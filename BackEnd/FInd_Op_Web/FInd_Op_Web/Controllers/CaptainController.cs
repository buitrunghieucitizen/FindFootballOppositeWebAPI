using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using FInd_Op_Web.DTOs;
using FInd_Op_Web.Data;
using FInd_Op_Web.Hubs;
using FInd_Op_Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace FInd_Op_Web.Controllers;

[Authorize(Roles = "Captain")]
[ApiController]
[Route("api/[controller]")]
public class CaptainController : ControllerBase
{
	private readonly ApplicationDbContext _context;

	private readonly IHubContext<NotificationHub> _hubContext;

	public CaptainController(ApplicationDbContext context, IHubContext<NotificationHub> hubContext)
	{
		_context = context;
		_hubContext = hubContext;
	}

	private async Task<Team?> GetMyTeamAsync()
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
		{
			return null;
		}
		return await _context.Teams.Include(t => t.Sport).FirstOrDefaultAsync((Team t) => t.CaptainId == (int?)userId);
	}

	[HttpGet("MyTeam")]
	public async Task<IActionResult> GetMyTeam()
	{
		try
		{
			Team team = await GetMyTeamAsync();
			if (team == null)
			{
				return NotFound(new
				{
					message = "You are not a captain of any team."
				});
			}
			int memberCount = await _context.TeamMembers.CountAsync((TeamMember tm) => tm.TeamId == team.TeamId && tm.Status == "Active");
			int wonCount = await _context.Matches.CountAsync((Match m) => m.MatchStatus == "Completed" && ((m.HomeTeamId == (int?)team.TeamId && m.HomeScore > m.AwayScore) || (m.AwayTeamId == (int?)team.TeamId && m.AwayScore > m.HomeScore)));
			int totalCompleted = await _context.Matches.CountAsync((Match m) => m.MatchStatus == "Completed" && (m.HomeTeamId == (int?)team.TeamId || m.AwayTeamId == (int?)team.TeamId));
			double winRate = ((totalCompleted > 0) ? Math.Round((double)wonCount / (double)totalCompleted * 100.0, 1) : 0.0);
			var nextMatch = await (from m in _context.Matches.Include((Match m) => m.Schedule).ThenInclude((PitchSchedule s) => s.Pitch)
				where (m.HomeTeamId == (int?)team.TeamId || m.AwayTeamId == (int?)team.TeamId) && m.MatchStatus != "Completed" && m.MatchStatus != "Cancelled" && m.ScheduleId != (int?)null && m.Schedule.StartTime >= DateTime.UtcNow.Date
				orderby m.Schedule.StartTime
				select new
				{
					MatchDate = m.Schedule.StartTime,
					StadiumId = ((m.Schedule.Pitch != null) ? m.Schedule.Pitch.StadiumId : ((int?)null))
				}).FirstOrDefaultAsync();
			string nextMatchStr = "Chưa xếp lịch";
			string nextMatchTrend = "";
			if (nextMatch != null)
			{
				nextMatchStr = nextMatch.MatchDate.ToString("dd/MM/yyyy HH:mm");
				nextMatchTrend = (nextMatch.StadiumId.HasValue ? "Đã chốt sân" : "Chưa có sân");
			}
			return Ok(new
			{
				TeamId = team.TeamId,
				TeamName = team.TeamName,
				QualityLevel = team.QualityLevel,
				History = team.History,
				HomeArea = team.HomeArea,
				CreatedAt = team.CreatedAt,
				IsDisbanded = team.IsDisbanded,
				LogoUrl = team.LogoUrl,
				RankingScore = team.RankingScore,
				FairplayScore = team.FairplayScore,
				MemberCount = memberCount,
				WinRate = winRate,
				NextMatchDate = nextMatchStr,
				NextMatchTrend = nextMatchTrend,
				SportName = team.Sport != null ? team.Sport.SportName : "Bóng đá",
				HasScoring = team.Sport != null ? team.Sport.HasScoring : true,
				ScoringFormat = team.Sport != null ? team.Sport.ScoringFormat : "Goals"
			});
		}
		catch (Exception ex)
		{
			Exception ex2 = ex;
			return StatusCode(500, new
			{
				message = ex2.Message,
				stackTrace = ex2.StackTrace,
				innerException = ex2.InnerException?.Message
			});
		}
	}

	[HttpPost("CreateTeam")]
	public async Task<IActionResult> CreateTeam([FromBody] CaptainCreateTeamDto dto)
	{
		try
		{
			string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
			if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
			{
				return Unauthorized();
			}
			List<TeamMember> activeTeams = await (from tm in _context.TeamMembers.Include((TeamMember tm) => tm.Team)
				where tm.PlayerId == userId && tm.Status == "Active"
				select tm).ToListAsync();
			if (activeTeams.Count >= 2)
			{
				return BadRequest(new
				{
					message = "Bạn đã tham gia tối đa 2 đội thể thao."
				});
			}
			if (activeTeams.Any((TeamMember t) => t.Team != null && t.Team.SportId == dto.SportId))
			{
				return BadRequest(new
				{
					message = "Bạn đã tham gia một đội thuộc môn thể thao này rồi."
				});
			}
			Team team = new Team
			{
				TeamName = dto.TeamName,
				HomeArea = dto.HomeArea,
				History = dto.Introduction,
				CaptainId = userId,
				SportId = dto.SportId,
				LogoUrl = dto.LogoUrl,
				BackgroundUrl = dto.BackgroundUrl,
				CreatedAt = DateTime.Now,
				FoundedDate = DateTime.Now,
				IsDisbanded = false,
				LookingForOpponent = true,
				FairplayScore = 100,
				TeamMembers = new List<TeamMember>
				{
					new TeamMember
					{
						PlayerId = userId,
						RoleInTeam = (dto.IsClubOwner ? "Owner" : "Captain"),
						Status = "Active",
						JoinedDate = DateTime.Now
					}
				}
			};
			_context.Teams.Add(team);
			await _context.SaveChangesAsync();
			return Ok(new
			{
				message = "Tạo đội bóng thành công.",
				teamId = team.TeamId
			});
		}
		catch (Exception ex)
		{
			Exception ex2 = ex;
			return StatusCode(500, new
			{
				message = ex2.Message,
				stackTrace = ex2.StackTrace,
				innerException = ex2.InnerException?.Message
			});
		}
	}

	[HttpPut("UpdateTeam")]
	public async Task<IActionResult> UpdateTeam([FromBody] CaptainUpdateTeamDto dto)
	{
		try
		{
			Team team = await GetMyTeamAsync();
			if (team == null)
			{
				return NotFound(new
				{
					message = "Team not found."
				});
			}
			team.TeamName = dto.TeamName;
			team.HomeArea = dto.HomeArea;
			team.History = dto.Introduction;
			if (dto.QualityLevel != null)
			{
				team.QualityLevel = dto.QualityLevel;
			}
			if (!string.IsNullOrEmpty(dto.LogoUrl))
			{
				team.LogoUrl = dto.LogoUrl;
			}
			if (!string.IsNullOrEmpty(dto.BackgroundUrl))
			{
				team.BackgroundUrl = dto.BackgroundUrl;
			}
			await _context.SaveChangesAsync();
			return Ok(new
			{
				message = "Cập nhật thông tin đội thành công."
			});
		}
		catch (Exception ex)
		{
			Exception ex2 = ex;
			return StatusCode(500, new
			{
				message = ex2.Message,
				stackTrace = ex2.StackTrace,
				innerException = ex2.InnerException?.Message
			});
		}
	}

	[HttpPost("TransferRole")]
	public async Task<IActionResult> TransferRole([FromBody] TransferRoleDto dto)
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return NotFound(new
			{
				message = "Team not found."
			});
		}
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		int.TryParse(userIdStr, out var currentCaptainId);
		TeamMember targetMember = await _context.TeamMembers.FirstOrDefaultAsync((TeamMember tm) => tm.TeamId == team.TeamId && tm.PlayerId == dto.NewCaptainId && tm.Status == "Active");
		if (targetMember == null)
		{
			return NotFound(new
			{
				message = "Target player not found in team."
			});
		}
		TeamMember currentMember = await _context.TeamMembers.FirstOrDefaultAsync((TeamMember tm) => tm.TeamId == team.TeamId && tm.PlayerId == currentCaptainId && tm.Status == "Active");
		if (currentMember == null)
		{
			return NotFound(new
			{
				message = "Current captain not found in team."
			});
		}
		team.CaptainId = dto.NewCaptainId;
		targetMember.RoleInTeam = "Captain";
		currentMember.RoleInTeam = dto.NewRoleForOldCaptain;
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "Role transferred successfully."
		});
	}

	[HttpGet("Members")]
	public async Task<IActionResult> GetMembers()
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return NotFound(new
			{
				message = "Team not found."
			});
		}
		int totalTeamMatches = await _context.Matches.CountAsync((Match m) => m.HomeTeamId == (int?)team.TeamId || m.AwayTeamId == (int?)team.TeamId);
		List<MatchPoll> matchPolls = await _context.MatchPolls.Where((MatchPoll mp) => mp.IsAttending == (bool?)true && (mp.Match.HomeTeamId == (int?)team.TeamId || mp.Match.AwayTeamId == (int?)team.TeamId)).ToListAsync();
		var result = (await (from tm in _context.TeamMembers.Include((TeamMember tm) => tm.Player)
			where tm.TeamId == team.TeamId
			select tm).ToListAsync()).Select(delegate(TeamMember tm)
		{
			int num = matchPolls.Count((MatchPoll mp) => mp.PlayerId == tm.PlayerId);
			int participationRate = ((totalTeamMatches > 0) ? ((int)Math.Round((double)num / (double)totalTeamMatches * 100.0)) : 0);
			return new
			{
				PlayerId = tm.PlayerId,
				FullName = tm.Player.FullName,
				Username = tm.Player.Username,
				Phone = tm.Player.Phone,
				RoleInTeam = tm.RoleInTeam,
				JoinedDate = tm.JoinedDate,
				Status = tm.Status,
				ParticipationRate = participationRate
			};
		}).ToList();
		return Ok(result);
	}

	[HttpGet("JoinRequests")]
	public async Task<IActionResult> GetJoinRequests()
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return NotFound(new
			{
				message = "Team not found."
			});
		}
		return Ok(await (from r in _context.JoinRequests.Include((JoinRequest r) => r.Player)
			where r.TeamId == team.TeamId && r.Status == "Pending"
			select new
			{
				r.RequestId,
				r.PlayerId,
				r.Player.FullName,
				r.Player.Username,
				r.Status,
				r.RequestType,
				r.CreatedAt
			}).ToListAsync());
	}

	[HttpPost("AcceptMember/{requestId}")]
	public async Task<IActionResult> AcceptMember(int requestId)
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return NotFound(new
			{
				message = "Team not found."
			});
		}
		JoinRequest request = await _context.JoinRequests.FirstOrDefaultAsync((JoinRequest r) => r.TeamId == team.TeamId && r.RequestId == requestId && r.Status == "Pending");
		if (request == null)
		{
			return NotFound(new
			{
				message = "Pending join request not found."
			});
		}
		TeamMember teamMember = new TeamMember
		{
			TeamId = team.TeamId,
			PlayerId = request.PlayerId,
			JoinedDate = DateTime.Now,
			RoleInTeam = "Member",
			Status = "Active"
		};
		_context.TeamMembers.Add(teamMember);
		request.Status = "Accepted";
		request.ProcessedAt = DateTime.Now;
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "Member accepted successfully."
		});
	}

	[HttpPost("RejectMember/{requestId}")]
	public async Task<IActionResult> RejectMember(int requestId)
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return NotFound(new
			{
				message = "Team not found."
			});
		}
		JoinRequest request = await _context.JoinRequests.FirstOrDefaultAsync((JoinRequest r) => r.TeamId == team.TeamId && r.RequestId == requestId && r.Status == "Pending");
		if (request == null)
		{
			return NotFound(new
			{
				message = "Pending join request not found."
			});
		}
		request.Status = "Rejected";
		request.ProcessedAt = DateTime.Now;
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "Member rejected successfully."
		});
	}

	[HttpPost("RemoveMember/{playerId}")]
	public async Task<IActionResult> RemoveMember(int playerId)
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return NotFound(new
			{
				message = "Team not found."
			});
		}
		TeamMember member = await _context.TeamMembers.FirstOrDefaultAsync((TeamMember tm) => tm.TeamId == team.TeamId && tm.PlayerId == playerId && tm.Status == "Active");
		if (member == null)
		{
			return NotFound(new
			{
				message = "Member not found in team."
			});
		}
		if (member.RoleInTeam == "Captain" || member.RoleInTeam == "Owner")
		{
			return BadRequest(new
			{
				message = "Cannot kick the captain or owner."
			});
		}
		_context.TeamMembers.Remove(member);
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "Member removed successfully."
		});
	}

	[HttpGet("Posts")]
	public async Task<IActionResult> GetPosts()
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return Ok(new List<object>());
		}
		return Ok(await (from p in _context.Posts
			where p.TeamId == team.TeamId
			orderby p.CreatedAt descending
			select new { p.PostId, p.Title, p.Content, p.PostType, p.ImageUrls, p.MatchId, p.CreatedAt, p.UpdatedAt }).ToListAsync());
	}

	[HttpPost("Posts")]
	public async Task<IActionResult> CreatePost([FromBody] PostDto dto)
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return BadRequest(new
			{
				message = "Bß¦ín cß¦ºn tß¦ío -æß+Öi b+¦ng tr¦¦ß+¢c khi +äGÇÿ+ä¦Æng b+â\u00a0i."
			});
		}
		string postType = dto.PostType ?? "Recruitment";
		if (postType == "Recruitment" && !team.IsSubscriptionActive && await _context.Posts.Where((Post p) => p.TeamId == team.TeamId && p.PostType == "Recruitment" && p.CreatedAt.Month == DateTime.Now.Month && p.CreatedAt.Year == DateTime.Now.Year).CountAsync() >= 2)
		{
			return BadRequest(new
			{
				message = "+ä +í-+Gäói b+¦ng cß+ºa bß¦ín -æ+ú d+¦ng hß¦+t 2 l¦¦ß+út +ä +ä¦Æng b+â\u00a0i T+â-¼m +ä +í-+GÇÿi/Ng+å-¦+í-+ i miß+àn ph+¡ trong th+íng n+áy. Vui l+¦ng n+óng cß¦Ñp Team Pro.",
				requiresPayment = true,
				paymentType = "TeamPro",
				price = 120000
			});
		}
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		int.TryParse(userIdStr, out var userId);
		Post post = new Post
		{
			TeamId = team.TeamId,
			AuthorId = userId,
			Title = dto.Title,
			Content = dto.Content,
			MatchId = dto.MatchId,
			ImageUrls = dto.ImageUrls,
			PostType = postType,
			CreatedAt = DateTime.Now
		};
		_context.Posts.Add(post);
		await _context.SaveChangesAsync();
		return CreatedAtAction("GetPosts", new
		{
			id = post.PostId
		}, post);
	}

	[HttpGet("Matches")]
	public async Task<IActionResult> GetMatches()
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return Ok(new List<object>());
		}
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		int.TryParse(userIdStr, out var userId);
		return Ok(await (from m in _context.Matches.Include((Match m) => m.HomeTeam).Include((Match m) => m.AwayTeam).Include((Match m) => m.Schedule)
			where m.HomeTeamId == (int?)team.TeamId || m.AwayTeamId == (int?)team.TeamId
			orderby m.MatchDate descending, m.StartTime descending
			select new
			{
				MatchId = m.MatchId,
				MatchType = m.MatchType,
				MatchStatus = m.MatchStatus,
				HomeTeamId = m.HomeTeamId,
				HomeTeamName = ((m.HomeTeam != null) ? m.HomeTeam.TeamName : "+ä +í-+Gäói Nh+á"),
				AwayTeamId = m.AwayTeamId,
				AwayTeamName = ((m.AwayTeam != null) ? m.AwayTeam.TeamName : "+ä +í-+Gäói Kh+ích"),
				OpponentName = ((m.HomeTeamId == (int?)team.TeamId) ? ((m.AwayTeam != null) ? m.AwayTeam.TeamName : null) : ((m.HomeTeam != null) ? m.HomeTeam.TeamName : null)),
				HomeScore = m.HomeScore,
				AwayScore = m.AwayScore,
				HomeConfirmed = m.HomeConfirmed,
				AwayConfirmed = m.AwayConfirmed,
				MatchDate = m.MatchDate,
				StartTime = m.StartTime,
				EndTime = m.EndTime,
				MyVote = (from mp in _context.MatchPolls
					where mp.MatchId == m.MatchId && mp.PlayerId == userId
					select mp.IsAttending).FirstOrDefault(),
				ScheduleId = m.ScheduleId,
				ScheduleStartTime = ((m.Schedule != null) ? ((DateTime?)m.Schedule.StartTime) : ((DateTime?)null)),
				ScheduleEndTime = ((m.Schedule != null) ? ((DateTime?)m.Schedule.EndTime) : ((DateTime?)null)),
				Location = ((m.Schedule != null && m.Schedule.Pitch != null && m.Schedule.Pitch.Stadium != null) ? m.Schedule.Pitch.Stadium.StadiumName : m.Location),
				Notes = m.Notes
			}).ToListAsync());
	}

	[HttpGet("Matches/{id}/Attendance")]
	public async Task<IActionResult> GetMatchAttendance(int id)
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return NotFound(new
			{
				message = "Team not found."
			});
		}
		Match match = await _context.Matches.FindAsync(id);
		if (match == null)
		{
			return NotFound(new
			{
				message = "Match not found."
			});
		}
		if (match.HomeTeamId != team.TeamId && match.AwayTeamId != team.TeamId)
		{
			return Forbid();
		}
		List<TeamMember> teamMembers = await (from tm in _context.TeamMembers.Include((TeamMember tm) => tm.Player)
			where tm.TeamId == team.TeamId && tm.Status == "Active"
			select tm).ToListAsync();
		List<MatchPoll> polls = await _context.MatchPolls.Where((MatchPoll mp) => mp.MatchId == id).ToListAsync();
		var attendance = teamMembers.Select(delegate(TeamMember tm)
		{
			MatchPoll matchPoll = polls.FirstOrDefault((MatchPoll p) => p.PlayerId == tm.PlayerId);
			return new
			{
				PlayerId = tm.PlayerId,
				PlayerName = (tm.Player?.FullName ?? tm.Player?.Username),
				IsAttending = matchPoll?.IsAttending,
				RoleInTeam = tm.RoleInTeam,
				MatchStatus = match.MatchStatus,
				IsGuest = false
			};
		}).ToList();
		List<int> teamMemberIds = teamMembers.Select((TeamMember tm) => tm.PlayerId).ToList();
		List<MatchPoll> guestPolls = polls.Where((MatchPoll p) => !teamMemberIds.Contains(p.PlayerId)).ToList();
		foreach (MatchPoll gp in guestPolls)
		{
			User guestPlayer = await _context.Users.FindAsync(gp.PlayerId);
			attendance.Add(new
			{
				PlayerId = gp.PlayerId,
				PlayerName = (guestPlayer?.FullName ?? guestPlayer?.Username),
				IsAttending = gp.IsAttending,
				RoleInTeam = "Guest",
				MatchStatus = match.MatchStatus,
				IsGuest = true
			});
		}
		int attendingCount = attendance.Count(a => a.IsAttending == true);
		int notAttendingCount = attendance.Count(a => a.IsAttending == false);
		int notVotedCount = attendance.Count(a => !a.IsAttending.HasValue);
		return Ok(new
		{
			MatchId = id,
			Summary = new
			{
				Attending = attendingCount,
				NotAttending = notAttendingCount,
				NotVoted = notVotedCount
			},
			Attendance = attendance
		});
	}

	[HttpPost("Matches/{id}/ExternalPitch")]
	public async Task<IActionResult> MarkAsExternalPitch(int id)
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return NotFound(new
			{
				message = "Team not found."
			});
		}
		Match match = await _context.Matches.FindAsync(id);
		if (match == null)
		{
			return NotFound(new
			{
				message = "Match not found."
			});
		}
		if (match.HomeTeamId != team.TeamId && match.AwayTeamId != team.TeamId)
		{
			return Forbid();
		}
		match.MatchStatus = "ExternalBooked";
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "+ä +â-ú c+í-¦\u00adp nh+í-¦\u00adt s+ón ngo+ái th+ánh c+¦ng."
		});
	}

	[HttpPut("Matches/{id}/Score")]
	public async Task<IActionResult> UpdateScore(int id, [FromBody] ScoreDto dto)
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return NotFound(new
			{
				message = "Team not found."
			});
		}
		Match match = await _context.Matches.FindAsync(id);
		if (match == null)
		{
			return NotFound(new
			{
				message = "Match not found."
			});
		}
		if (match.HomeTeamId != team.TeamId && match.AwayTeamId != team.TeamId)
		{
			return Forbid();
		}
		bool isSameScore = match.HomeScore == dto.HomeScore && match.AwayScore == dto.AwayScore;
		match.HomeScore = dto.HomeScore;
		match.AwayScore = dto.AwayScore;
		if (dto.SetScores != null) match.SetScores = dto.SetScores;
		if (match.HomeTeamId == team.TeamId)
		{
			match.HomeConfirmed = true;
			if (!isSameScore)
			{
				match.AwayConfirmed = false;
			}
		}
		else if (match.AwayTeamId == team.TeamId)
		{
			match.AwayConfirmed = true;
			if (!isSameScore)
			{
				match.HomeConfirmed = false;
			}
		}
		else
		{
			match.HomeConfirmed = false;
			match.AwayConfirmed = false;
		}
		if ((match.HomeConfirmed == true && match.AwayConfirmed == true) || (!match.AwayTeamId.HasValue && match.HomeConfirmed == true))
		{
			match.MatchStatus = "Completed";
			await CalculateRankingScoreAsync(match, match.HomeScore.GetValueOrDefault(), match.AwayScore.GetValueOrDefault());
		}
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "Score updated successfully."
		});
	}

	[HttpPost("Matches/{id}/ConfirmResult")]
	public async Task<IActionResult> ConfirmResult(int id)
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return NotFound(new
			{
				message = "Team not found."
			});
		}
		Match match = await _context.Matches.FindAsync(id);
		if (match == null)
		{
			return NotFound(new
			{
				message = "Match not found."
			});
		}
		if (match.HomeTeamId == team.TeamId)
		{
			match.HomeConfirmed = true;
		}
		else
		{
			if (match.AwayTeamId != team.TeamId)
			{
				return Forbid();
			}
			match.AwayConfirmed = true;
		}
		if ((match.HomeConfirmed == true && match.AwayConfirmed == true) || (!match.AwayTeamId.HasValue && match.HomeConfirmed == true))
		{
			match.MatchStatus = "Completed";
			await CalculateRankingScoreAsync(match, match.HomeScore.GetValueOrDefault(), match.AwayScore.GetValueOrDefault());
		}
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "Result confirmed."
		});
	}

	[HttpPost("Matches/{id}/Cancel")]
	public async Task<IActionResult> CancelMatch(int id, [FromBody] CancelDto dto)
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return NotFound(new
			{
				message = "Team not found."
			});
		}
		Match match = await _context.Matches.FindAsync(id);
		if (match == null)
		{
			return NotFound(new
			{
				message = "Match not found."
			});
		}
		if (match.HomeTeamId != team.TeamId && match.AwayTeamId != team.TeamId)
		{
			return Forbid();
		}
		foreach (int pId in await (from tm in _context.TeamMembers
			where ((int?)tm.TeamId == match.HomeTeamId || (int?)tm.TeamId == match.AwayTeamId) && tm.Status == "Active"
			select tm.PlayerId).Distinct().ToListAsync())
		{
			Notification notification = new Notification
			{
				UserId = pId,
				Title = "Trận đấu bị hủy",
				Message = "Trận đấu đã bị hủy bởi đội " + team.TeamName + ". Lý do: " + dto.Reason,
				IsRead = false,
				CreatedAt = DateTime.Now
			};
			_context.Notifications.Add(notification);
		}
		if (match.Schedule != null && match.Schedule.Pitch != null && match.Schedule.Pitch.Stadium != null && match.Schedule.Pitch.Stadium.OwnerId.HasValue)
		{
			Notification ownerNotification = new Notification
			{
				UserId = match.Schedule.Pitch.Stadium.OwnerId.Value,
				Title = "Khách hủy lịch đặt sân",
				Message = "Lịch đặt sân của đội " + team.TeamName + " đã bị hủy. Lý do: " + dto.Reason,
				IsRead = false,
				CreatedAt = DateTime.Now
			};
			_context.Notifications.Add(ownerNotification);
			if (match.Schedule != null)
			{
				_context.PitchSchedules.Remove(match.Schedule);
			}
		}
		IQueryable<MatchPoll> polls = _context.MatchPolls.Where((MatchPoll mp) => mp.MatchId == id);
		_context.MatchPolls.RemoveRange(polls);
		_context.Matches.Remove(match);
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "Match cancelled."
		});
	}

	[HttpPost("CreateChallenge")]
	public async Task<IActionResult> CreateChallenge([FromBody] ChallengeDto dto)
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return NotFound(new { message = "Team not found." });
		}

		if (team.FairplayScore == 0 && team.FairplayWarnings == 0)
		{
			team.FairplayScore = 100;
			await _context.SaveChangesAsync();
		}

		if (team.FairplayScore <= 40)
		{
			var currentMonth = DateTime.Now.Month;
			var currentYear = DateTime.Now.Year;
			var thisMonthCreated = await _context.Matches
				.Where(m => m.HomeTeamId == team.TeamId && m.MatchDate != null && m.MatchDate.Value.Month == currentMonth && m.MatchDate.Value.Year == currentYear)
				.CountAsync();

			if (thisMonthCreated >= 2)
			{
				return BadRequest(new { message = "Điểm Fairplay của bạn thấp, bạn chỉ được tạo tối đa 2 trận đấu trong tháng này." });
			}
		}

		string locationString = dto.Location ?? "";
		DateTime? finalMatchDate = dto.MatchDate;
		TimeSpan? finalStartTime = dto.StartTime;
		TimeSpan? finalEndTime = null;

		if (dto.ScheduleId != null)
		{
			var pitchSchedule = await _context.PitchSchedules
				.Include(ps => ps.Pitch)
				.ThenInclude(p => p.Stadium)
				.FirstOrDefaultAsync(ps => ps.ScheduleId == dto.ScheduleId);

			if (pitchSchedule == null || pitchSchedule.BookedById != team.CaptainId)
			{
				return BadRequest(new { message = "Không tìm thấy lịch đặt sân hợp lệ của bạn." });
			}
			
			finalMatchDate = pitchSchedule.StartTime.Date;
			finalStartTime = pitchSchedule.StartTime.TimeOfDay;
			finalEndTime = pitchSchedule.EndTime.TimeOfDay;

			if (pitchSchedule.Pitch != null && pitchSchedule.Pitch.Stadium != null)
			{
				var stadium = pitchSchedule.Pitch.Stadium;
				locationString = $"{stadium.StadiumName} - {pitchSchedule.Pitch.PitchName} (GPS: {stadium.Latitude}, {stadium.Longitude})";
			}
		}

		Match match = new Match
		{
			HomeTeamId = team.TeamId,
			MatchStatus = "LookingForOpponent",
			MatchType = "Challenge",
			ExpiresAt = DateTime.Now.AddDays(7.0),
			MatchDate = finalMatchDate,
			StartTime = finalStartTime,
			EndTime = finalEndTime,
			Location = locationString,
			Notes = dto.Notes,
			ScheduleId = dto.ScheduleId
		};
		_context.Matches.Add(match);
		await _context.SaveChangesAsync();

		return Ok(new
		{
			message = "Challenge created.",
			matchId = match.MatchId
		});
	}

	[HttpPut("Matches/{id}/Challenge")]
	public async Task<IActionResult> UpdateChallenge(int id, [FromBody] UpdateChallengeDto dto)
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return NotFound(new
			{
				message = "Team not found."
			});
		}
		Match match = await _context.Matches.FindAsync(id);
		if (match == null)
		{
			return NotFound(new
			{
				message = "Match not found."
			});
		}
		if (match.HomeTeamId != team.TeamId)
		{
			return Forbid();
		}
		if (match.MatchType != "Challenge")
		{
			return BadRequest(new
			{
				message = "+ä\u0090+â-óy kh+¦ng phß¦úi l+á tr+í-¦\u00adn giao hß+»u tß+¦ do."
			});
		}
		match.MatchDate = dto.MatchDate;
		match.StartTime = dto.StartTime;
		match.Location = dto.Location;
		match.Notes = dto.Notes;
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "Cß¦¡p nhß¦¡t th+¦ng tin k+â\u00a8o th+ánh c+¦ng."
		});
	}

	[HttpGet("ChallengeRequests")]
	public async Task<IActionResult> GetChallengeRequests()
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return NotFound(new
			{
				message = "Team not found."
			});
		}
		return Ok(await (from m in _context.Matches.Include((Match m) => m.HomeTeam)
			where m.MatchStatus == "LookingForOpponent" && m.HomeTeamId != (int?)team.TeamId
			select new
			{
				MatchId = m.MatchId,
				HomeTeam = ((m.HomeTeam != null) ? m.HomeTeam.TeamName : null),
				MatchStatus = m.MatchStatus,
				MatchType = m.MatchType
			}).ToListAsync());
	}

	[HttpPost("AcceptChallenge/{matchId}")]
	public async Task<IActionResult> AcceptChallenge(int matchId)
	{
		try
		{
			Team team = await GetMyTeamAsync();
			if (team == null)
			{
				return NotFound(new { message = "Team not found." });
			}

			if (team.FairplayScore <= 20)
			{
				return BadRequest(new { message = "Điểm Fairplay của bạn quá thấp (<=20), bạn không thể bắt kèo." });
			}
			
			if (team.FairplayScore <= 40)
			{
				var currentMonth = DateTime.Now.Month;
				var currentYear = DateTime.Now.Year;
				var thisMonthAccepted = await _context.Matches
					.Where(m => m.AwayTeamId == team.TeamId && m.MatchDate != null && m.MatchDate.Value.Month == currentMonth && m.MatchDate.Value.Year == currentYear)
					.CountAsync();

				if (thisMonthAccepted >= 2)
				{
					return BadRequest(new { message = "Điểm Fairplay của bạn thấp, bạn chỉ được bắt kèo tối đa 2 trận trong tháng này." });
				}
			}
			Match match = await _context.Matches.FindAsync(matchId);
			if (match == null)
			{
				return NotFound(new
				{
					message = "Match not found."
				});
			}
			if (match.MatchStatus != "LookingForOpponent")
			{
				return BadRequest(new
				{
					message = "Match is not looking for an opponent."
				});
			}
			if (match.HomeTeamId == team.TeamId)
			{
				return BadRequest(new
				{
					message = "Cannot accept your own challenge."
				});
			}
			match.AwayTeamId = team.TeamId;
			match.MatchStatus = "Accepted";

            var request = await _context.MatchRequests.FirstOrDefaultAsync(r => r.MatchId == matchId && r.RequestingTeamId == team.TeamId && r.Status == "Pending");
            if (request != null) {
                request.Status = "Accepted";
            }
            
            var otherRequests = await _context.MatchRequests.Where(r => r.MatchId == matchId && r.Status == "Pending").ToListAsync();
            foreach (var r in otherRequests) {
                r.Status = "Rejected";
            }

			await _context.SaveChangesAsync();
			if (match.HomeTeamId.HasValue)
			{
				Team homeTeam = await _context.Teams.FindAsync(match.HomeTeamId.Value);
				if (homeTeam != null && homeTeam.CaptainId > 0)
				{
					Notification notification = new Notification
					{
						UserId = homeTeam.CaptainId,
						Title = "K+¿o -æ+ú -æ¦¦ß+úc nhß¦¡n!",
						Message = "-Éß+Öi " + team.TeamName + " -æ+ú nhß¦¡n k+¿o th+ích -æß¦Ñu cß+ºa bß¦ín!",
						IsRead = false,
						CreatedAt = DateTime.Now
					};
					_context.Notifications.Add(notification);
					await _context.SaveChangesAsync();
					string connectionId = NotificationHub.GetConnectionIdForUser(homeTeam.CaptainId.ToString());
					if (!string.IsNullOrEmpty(connectionId))
					{
						await _hubContext.Clients.Client(connectionId).SendAsync("ReceiveNotification", notification.Message);
					}
				}
			}
			return Ok(new
			{
				message = "Challenge accepted.",
				matchId = match.MatchId
			});
		}
		catch (Exception ex)
		{
			Exception ex2 = ex;
			return StatusCode(500, new
			{
				message = ex2.Message,
				inner = ex2.InnerException?.Message,
				stack = ex2.StackTrace
			});
		}
	}

	[HttpPost("RateOpponent")]
	public async Task<IActionResult> RateOpponent([FromBody] RateOpponentDto dto)
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return NotFound(new
			{
				message = "Team not found."
			});
		}
		Match match = await _context.Matches.FindAsync(dto.MatchId);
		if (match == null)
		{
			return NotFound(new
			{
				message = "Match not found."
			});
		}
		if (match.MatchStatus != "Completed")
		{
			return BadRequest(new
			{
				message = "Can only rate after match is completed."
			});
		}
		int ratedTeamId = ((match.HomeTeamId == team.TeamId) ? match.AwayTeamId.Value : match.HomeTeamId.Value);
		if (await _context.TeamRatings.FirstOrDefaultAsync((TeamRating r) => r.MatchId == dto.MatchId && r.ReviewerTeamId == team.TeamId) != null)
		{
			return BadRequest(new
			{
				message = "You have already rated the opponent for this match."
			});
		}
		TeamRating rating = new TeamRating
		{
			MatchId = dto.MatchId,
			ReviewerTeamId = team.TeamId,
			RatedTeamId = ratedTeamId,
			Score = dto.Score,
			Comment = dto.Comment,
			CreatedAt = DateTime.Now
		};
		_context.TeamRatings.Add(rating);
		Team ratedTeam = await _context.Teams.FindAsync(ratedTeamId);
		if (ratedTeam != null)
		{
			int fairplayChange = 0;
			switch (dto.Score)
			{
			case 5:
				fairplayChange = 3;
				break;
			case 4:
				fairplayChange = 2;
				break;
			case 3:
				fairplayChange = -1;
				break;
			case 2:
				fairplayChange = -3;
				break;
			case 1:
				fairplayChange = -4;
				break;
			}
			ratedTeam.FairplayScore += fairplayChange;
			if (ratedTeam.FairplayScore > 100)
			{
				ratedTeam.FairplayScore = 100;
			}
			string notificationMessage = "";
			if (ratedTeam.FairplayScore <= 0 && ratedTeam.FairplayWarnings < 5)
			{
				ratedTeam.FairplayWarnings = 5;
				notificationMessage = "Đội của bạn đã nhận cảnh báo mức 5 do điểm Fairplay giảm xuống 0. Bạn sẽ không thể bắt kèo.";
			}
			else if (ratedTeam.FairplayScore <= 20 && ratedTeam.FairplayScore > 0 && ratedTeam.FairplayWarnings < 4)
			{
				ratedTeam.FairplayWarnings = 4;
				notificationMessage = "Đội của bạn đã nhận cảnh báo mức 4 do điểm Fairplay giảm xuống dưới 20. Bạn không thể bắt kèo.";
			}
			else if (ratedTeam.FairplayScore <= 40 && ratedTeam.FairplayScore > 20 && ratedTeam.FairplayWarnings < 3)
			{
				ratedTeam.FairplayWarnings = 3;
				notificationMessage = "Đội của bạn đã nhận cảnh báo mức 3 do điểm Fairplay giảm xuống dưới 40. Bạn bị giới hạn tạo 2 kèo/tháng và giới hạn bắt 2 kèo/tháng.";
			}
			else if (ratedTeam.FairplayScore <= 60 && ratedTeam.FairplayScore > 40 && ratedTeam.FairplayWarnings < 2)
			{
				ratedTeam.FairplayWarnings = 2;
				notificationMessage = "Đội của bạn đã nhận cảnh báo mức 2 do điểm Fairplay giảm xuống dưới 60.";
			}
			else if (ratedTeam.FairplayScore <= 80 && ratedTeam.FairplayScore > 60 && ratedTeam.FairplayWarnings < 1)
			{
				ratedTeam.FairplayWarnings = 1;
				notificationMessage = "Đội của bạn đã nhận cảnh báo mức 1 do điểm Fairplay giảm xuống dưới 80.";
			}
			if (!string.IsNullOrEmpty(notificationMessage) && ratedTeam.CaptainId.HasValue)
			{
				Notification notification = new Notification
				{
					UserId = ratedTeam.CaptainId.Value,
					Title = "Cß¦únh b+ío Fairplay",
					Message = notificationMessage,
					CreatedAt = DateTime.Now,
					IsRead = false
				};
				_context.Notifications.Add(notification);
				string connectionId = NotificationHub.GetConnectionIdForUser(ratedTeam.CaptainId.Value.ToString());
				if (!string.IsNullOrEmpty(connectionId))
				{
					await _hubContext.Clients.Client(connectionId).SendAsync("ReceiveNotification", notification.Message);
				}
			}
		}
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "Opponent rated successfully."
		});
	}

	[HttpPost("RateOpponentPlayer/{playerId}")]
	public async Task<IActionResult> RateOpponentPlayer(int playerId, [FromBody] RatePlayerDto dto)
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return NotFound(new { message = "Team not found." });
		}
		
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var currentUserId))
		{
			return Unauthorized();
		}

		if (currentUserId == playerId)
		{
			return BadRequest(new { message = "You cannot rate yourself." });
		}

		var playedMatch = await _context.Matches.FirstOrDefaultAsync(m => 
			m.MatchStatus == "Completed" && 
			((m.HomeTeamId == team.TeamId && m.AwayTeamId != null) || 
			 (m.AwayTeamId == team.TeamId && m.HomeTeamId != null)) &&
			_context.TeamMembers.Any(tm => tm.PlayerId == playerId && tm.Status == "Active" && 
				(tm.TeamId == m.HomeTeamId || tm.TeamId == m.AwayTeamId) && tm.TeamId != team.TeamId));

		if (playedMatch == null)
		{
			return BadRequest(new { message = "You can only rate players from teams you have played against." });
		}

		int targetTeamId = (playedMatch.HomeTeamId == team.TeamId) ? playedMatch.AwayTeamId.Value : playedMatch.HomeTeamId.Value;

		if (dto.Score < 1 || dto.Score > 5)
		{
			return BadRequest(new { message = "Score must be between 1 and 5." });
		}

		var existingRating = await _context.PlayerRatings
			.FirstOrDefaultAsync(r => r.RatedById == currentUserId && r.PlayerId == playerId && r.Month == dto.Month && r.Year == dto.Year);

		if (existingRating != null)
		{
			return BadRequest(new { message = "You have already rated this player for the specified month and year." });
		}

		var rating = new PlayerRating
		{
			PlayerId = playerId,
			RatedById = currentUserId,
			TeamId = targetTeamId,
			Score = dto.Score,
			Month = dto.Month,
			Year = dto.Year,
			Comment = dto.Comment
		};

		_context.PlayerRatings.Add(rating);
		await _context.SaveChangesAsync();

		return Ok(new { message = "Opponent player rated successfully." });
	}


	[HttpGet("TeamRankings")]
	public async Task<IActionResult> GetTeamRankings()
	{
		return Ok(await (from t in _context.Teams
			where (t.IsDisbanded == (bool?)false || t.IsDisbanded == (bool?)null) && !t.IsInternal && t.QualityLevel != "Nội bộ"
			orderby t.RankingScore descending
			select new
			{
				TeamId = t.TeamId,
				TeamName = t.TeamName,
				RankingScore = t.RankingScore,
				FairplayScore = t.FairplayScore,
				HomeArea = t.HomeArea,
				SportName = ((t.Sport != null) ? t.Sport.SportName : null)
			}).Take(50).ToListAsync());
	}

	[HttpGet("Matches/{id}/Chats")]
	public async Task<IActionResult> GetMatchChats(int id)
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return NotFound(new
			{
				message = "Team not found."
			});
		}
		Match match = await _context.Matches.FindAsync(id);
		if (match == null)
		{
			return NotFound(new
			{
				message = "Match not found."
			});
		}
		if (match.HomeTeamId != team.TeamId && match.AwayTeamId != team.TeamId)
		{
			return Forbid();
		}
		return Ok(await (from c in _context.MatchChats
			where c.MatchId == id
			orderby c.SentAt
			select new { c.ChatId, c.MatchId, c.SenderTeamId, c.EncryptedMessage, c.SentAt }).ToListAsync());
	}

	[HttpPost("CreateTournament")]
	public async Task<IActionResult> CreateTournament([FromBody] TournamentCreateDto dto)
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
		{
			return Unauthorized();
		}
		if (await _context.Users.FindAsync(userId) == null)
		{
			return NotFound(new
			{
				message = "User not found."
			});
		}

		if (dto.StartDate?.Date < DateTime.Now.Date || dto.EndDate?.Date < dto.StartDate?.Date)
		{
			return BadRequest(new { message = "Ngày bắt đầu hoặc ngày kết thúc không hợp lệ." });
		}
		Tournament tournament = new Tournament
		{
			TournamentName = dto.Name,
			Format = dto.Format,
			EntryFee = ((dto.Scope == "Internal") ? 0m : dto.EntryFee),
			OrganizerId = userId,
			Status = "Upcoming",
			ApprovalStatus = ((dto.Scope == "Internal") ? "Approved" : "Pending"),
			Scope = dto.Scope,
			MaxPlayersPerTeam = dto.MaxPlayersPerTeam,
			MaxTeams = dto.MaxTeams,
			CreatedAt = DateTime.Now,
			IsFeePaid = (dto.Scope == "Internal"),
			BankQrCodeUrl = ((dto.Scope == "Internal") ? null : dto.BankQrCodeUrl),
			StartDate = dto.StartDate,
			EndDate = dto.EndDate,
			SportId = dto.SportId,
			OrganizerCccd = ((dto.Scope != "Internal") ? dto.OrganizerCccd : null),
			OrganizerDriverLicense = ((dto.Scope != "Internal") ? dto.OrganizerDriverLicense : null),
			Description = $"C¦í chß¦+: {dto.AssignmentType}, Max -æß+Öi: {dto.MaxTeams}" + ((!string.IsNullOrEmpty(dto.Stadium)) ? (", S+ón dß+¦ kiß¦+n: " + dto.Stadium) : "")
		};
		_context.Tournaments.Add(tournament);
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "Tß¦ío giß¦úi -æß¦Ñu th+ánh c+¦ng.",
			tournamentId = tournament.TournamentId
		});
	}

	[HttpGet("Tournaments")]
	public async Task<IActionResult> GetMyTournaments()
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
		{
			return Unauthorized();
		}
		return Ok(await (from t in _context.Tournaments
			where t.OrganizerId == (int?)userId
			select new
			{
				id = t.TournamentId,
				name = t.TournamentName,
				format = t.Format,
				status = t.Status,
				fee = (t.EntryFee ?? 0m),
				entryFee = (t.EntryFee ?? 0m),
				platformFee = ((t.MaxTeams <= 8) ? 130000 : ((t.MaxTeams <= 16) ? 200000 : 500000)),
				approvalStatus = t.ApprovalStatus,
				isFeePaid = t.IsFeePaid,
				maxPlayersPerTeam = t.MaxPlayersPerTeam,
				maxTeams = t.MaxTeams,
				teams = t.TournamentTeams.Count()
			} into t
			orderby t.id descending
			select t).ToListAsync());
	}

	[HttpGet("JoinedTournaments")]
	public async Task<IActionResult> GetJoinedTournaments()
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return Ok(new List<object>());
		}
		return Ok(await (from tt in _context.TournamentTeams.Include((TournamentTeam tt) => tt.Tournament).Include((TournamentTeam tt) => tt.Team)
			where tt.TeamId == team.TeamId && tt.Tournament != null
			select new
			{
				id = tt.TournamentId,
				name = tt.Tournament.TournamentName,
				format = tt.Tournament.Format,
				status = tt.Status,
				fee = (tt.Tournament.EntryFee ?? 0m),
				startDate = tt.Tournament.StartDate,
				teamAbbr = !string.IsNullOrEmpty(tt.TeamAbbreviation) ? tt.TeamAbbreviation : ((tt.Team != null) ? tt.Team.TeamName.Substring(0, Math.Min(3, tt.Team.TeamName.Length)).ToUpper() : ""),
				ownerName = "Admin",
				ownerBank = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ChuyenTienChoAdmin"
			}).ToListAsync());
	}

	[HttpGet("TournamentSettings/{id}")]
	public async Task<IActionResult> GetTournamentSettings(int id)
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		int.TryParse(userIdStr, out var userId);
		Tournament tournament = await _context.Tournaments.FirstOrDefaultAsync((Tournament t) => t.TournamentId == id && t.OrganizerId == (int?)userId);
		if (tournament == null)
		{
			return NotFound(new
			{
				message = "Tournament not found."
			});
		}
		string sportName = "B+¦ng -æ+í";
		if (tournament.SportId.HasValue)
		{
			sportName = (await _context.Sports.FindAsync(tournament.SportId))?.SportName ?? sportName;
		}
		int maxTeams = 16;
		string scope = tournament.Scope ?? "Internal";
		string stadium = "";
		if (!string.IsNullOrEmpty(tournament.Description))
		{
			if (tournament.Description.Contains("Max -æß+Öi: "))
			{
				string maxTeamStr = tournament.Description.Split("Max -æß+Öi: ")[1].Split(",")[0];
				int.TryParse(maxTeamStr, out maxTeams);
			}
			if (tournament.Description.Contains("MaxTeams: "))
			{
				string[] parts = tournament.Description.Split(new string[1] { "MaxTeams: " }, StringSplitOptions.None);
				if (parts.Length > 1 && int.TryParse(parts[1].Trim(), out var max))
				{
					maxTeams = max;
				}
			}
			if (tournament.Description.Contains("S+ón dß+¦ kiß¦+n: "))
			{
				stadium = tournament.Description.Split("S+ón dß+¦ kiß¦+n: ")[1];
			}
			if (tournament.Description.Contains("Stadium: "))
			{
				int stStart = tournament.Description.IndexOf("Stadium: ") + 9;
				int stEnd = tournament.Description.IndexOf(", MaxTeams");
				if (stEnd > stStart)
				{
					stadium = tournament.Description.Substring(stStart, stEnd - stStart);
				}
			}
		}
		return Ok(new TournamentSettingsDto
		{
			Name = tournament.TournamentName,
			Sport = sportName,
			Stadium = stadium,
			Format = (tournament.Format ?? "League"),
			Scope = scope,
			MaxTeams = maxTeams,
			StartDate = tournament.StartDate,
			EndDate = tournament.EndDate,
			Status = tournament.Status
		});
	}

	[HttpPut("TournamentSettings/{id}")]
	public async Task<IActionResult> UpdateTournamentSettings(int id, [FromBody] TournamentSettingsDto dto)
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		int.TryParse(userIdStr, out var userId);
		Tournament tournament = await _context.Tournaments.FirstOrDefaultAsync((Tournament t) => t.TournamentId == id && t.OrganizerId == (int?)userId);
		if (tournament == null)
		{
			return NotFound(new
			{
				message = "Tournament not found."
			});
		}
		tournament.TournamentName = dto.Name;
		tournament.Format = dto.Format;
		tournament.StartDate = dto.StartDate;
		tournament.EndDate = dto.EndDate;
		tournament.Description = $"Sport: {dto.Sport}, Scope: {dto.Scope}, Stadium: {dto.Stadium}, MaxTeams: {dto.MaxTeams}";
		
		if (tournament.Status == "Completed" && tournament.EndDate > DateTime.Now)
		{
			tournament.Status = "Ongoing";
		}
		
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "Settings updated."
		});
	}

	[HttpPost("Tournaments/{id}/RequestRefund")]
	public async Task<IActionResult> RequestRefund(int id)
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		int.TryParse(userIdStr, out var userId);
		Tournament tournament = await _context.Tournaments.FirstOrDefaultAsync((Tournament t) => t.TournamentId == id && t.OrganizerId == (int?)userId);
		if (tournament == null)
		{
			return NotFound(new
			{
				message = "Tournament not found."
			});
		}
		if (tournament.Status == "Cancelled")
		{
			return BadRequest(new
			{
				message = "Tournament already cancelled."
			});
		}
		tournament.Status = "Cancelled";
		tournament.RefundStatus = "Requested";
		_context.Notifications.Add(new Notification
		{
			UserId = 1,
			Title = "Y+¬u cß¦ºu ho+án tiß+ün giß¦úi -æß¦Ñu",
			Message = $"Ng¦¦ß+¥i d+¦ng {userId} y+¬u cß¦ºu ho+án tiß+ün 80% cho giß¦úi -æß¦Ñu '{tournament.TournamentName}' bß+ï hß+ºy.",
			IsRead = false,
			CreatedAt = DateTime.Now
		});
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "-É+ú hß+ºy giß¦úi v+á y+¬u cß¦ºu ho+án tiß+ün 80%."
		});
	}

	[HttpPost("Tournaments/{id}/ConfirmRefund")]
	public async Task<IActionResult> ConfirmRefund(int id)
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		int.TryParse(userIdStr, out var userId);
		Tournament tournament = await _context.Tournaments.FirstOrDefaultAsync((Tournament t) => t.TournamentId == id && t.OrganizerId == (int?)userId);
		if (tournament == null)
		{
			return NotFound(new
			{
				message = "Tournament not found."
			});
		}
		if (tournament.RefundStatus != "AdminRefunded")
		{
			return BadRequest(new
			{
				message = "Admin ch¦¦a ho+án tiß+ün hoß¦+c bß¦ín -æ+ú x+íc nhß¦¡n rß+ôi."
			});
		}
		tournament.RefundStatus = "Completed";
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "-É+ú x+íc nhß¦¡n nhß¦¡n -æ¦¦ß+úc tiß+ün."
		});
	}

	[HttpGet("Tournaments/{id}/Teams")]
	public async Task<IActionResult> GetTournamentTeams(int id)
	{
		return Ok(await (from tt in _context.TournamentTeams.Include((TournamentTeam tt) => tt.Team)
			where tt.TournamentId == id
			select new
			{
				id = tt.TeamId,
				name = tt.Team.TeamName,
				logo = tt.Team.LogoUrl,
				status = tt.Status,
				abbr = !string.IsNullOrEmpty(tt.TeamAbbreviation) ? tt.TeamAbbreviation : tt.Team.TeamName.Substring(0, Math.Min(3, tt.Team.TeamName.Length)).ToUpper()
			}).ToListAsync());
	}

	[HttpPost("Tournaments/{id}/AddTeam")]
	public async Task<IActionResult> AddTeamToTournament(int id, [FromBody] TournamentAddTeamDto dto)
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		int.TryParse(userIdStr, out var userId);
		if (await _context.Tournaments.FirstOrDefaultAsync((Tournament t) => t.TournamentId == id && t.OrganizerId == (int?)userId) == null)
		{
			return NotFound(new
			{
				message = "Tournament not found."
			});
		}
		int teamIdToAdd = 0;
		if (dto.TeamId.HasValue)
		{
			teamIdToAdd = dto.TeamId.Value;
		}
		else
		{
			Team newTeam = new Team
			{
				TeamName = (dto.Name ?? "No Name"),
				CaptainId = userId,
				CreatedAt = DateTime.Now,
				FoundedDate = DateTime.Now,
				IsDisbanded = false,
				LookingForOpponent = false,
				IsInternal = true,
				QualityLevel = "Nß+Öi bß+Ö"
			};
			_context.Teams.Add(newTeam);
			await _context.SaveChangesAsync();
			teamIdToAdd = newTeam.TeamId;
		}
		if (!(await _context.TournamentTeams.AnyAsync((TournamentTeam tt) => tt.TournamentId == id && tt.TeamId == teamIdToAdd)))
		{
			_context.TournamentTeams.Add(new TournamentTeam
			{
				TournamentId = id,
				TeamId = teamIdToAdd,
				Status = "Approved",
				RegistrationDate = DateTime.Now,
				TeamAbbreviation = dto.Abbr
			});
			await _context.SaveChangesAsync();
		}
		return Ok(new
		{
			message = "Team added to tournament."
		});
	}

	[HttpPost("Tournaments/{id}/AcceptTeam/{teamId}")]
	public async Task<IActionResult> AcceptTournamentTeam(int id, int teamId)
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		int.TryParse(userIdStr, out var userId);
		if (await _context.Tournaments.FirstOrDefaultAsync((Tournament t) => t.TournamentId == id && t.OrganizerId == (int?)userId) == null)
		{
			return NotFound(new
			{
				message = "Tournament not found or unauthorized."
			});
		}
		TournamentTeam tt = await _context.TournamentTeams.FirstOrDefaultAsync((TournamentTeam x) => x.TournamentId == id && x.TeamId == teamId);
		if (tt == null)
		{
			return NotFound(new
			{
				message = "Team registration not found."
			});
		}
		tt.Status = "Approved";
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "-É+ú duyß+çt -æß+Öi v+áo giß¦úi."
		});
	}

	[HttpPost("Tournaments/{id}/RejectTeam/{teamId}")]
	public async Task<IActionResult> RejectTournamentTeam(int id, int teamId)
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		int.TryParse(userIdStr, out var userId);
		if (await _context.Tournaments.FirstOrDefaultAsync((Tournament t) => t.TournamentId == id && t.OrganizerId == (int?)userId) == null)
		{
			return NotFound(new
			{
				message = "Tournament not found or unauthorized."
			});
		}
		TournamentTeam tt = await _context.TournamentTeams.FirstOrDefaultAsync((TournamentTeam x) => x.TournamentId == id && x.TeamId == teamId);
		if (tt == null)
		{
			return NotFound(new
			{
				message = "Team registration not found."
			});
		}
		_context.TournamentTeams.Remove(tt);
		IQueryable<TournamentTeamPlayer> players = _context.TournamentTeamPlayers.Where((TournamentTeamPlayer p) => p.TournamentId == id && p.TeamId == teamId);
		_context.TournamentTeamPlayers.RemoveRange(players);
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "-É+ú tß+½ chß+æi v+á x+¦a y+¬u cß¦ºu."
		});
	}

	[HttpPost("Tournaments/{id}/Register")]
	public async Task<IActionResult> RegisterTournament(int id, [FromBody] RegisterTournamentDto dto)
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return NotFound(new
			{
				message = "Bß¦ín cß¦ºn c+¦ -æß+Öi b+¦ng -æß+â -æ-âng k++ giß¦úi."
			});
		}
		Tournament tournament = await _context.Tournaments.FindAsync(id);
		if (tournament == null)
		{
			return NotFound(new
			{
				message = "Tournament not found."
			});
		}
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		int.TryParse(userIdStr, out var userId);
		if (tournament.Scope == "Internal" && tournament.OrganizerId != userId)
		{
			return BadRequest(new
			{
				message = "-É+óy l+á giß¦úi -æß¦Ñu nß+Öi bß+Ö, bß¦ín kh+¦ng thß+â tß+¦ -æ-âng k++."
			});
		}
		if (!dto.NoBettingCommitment)
		{
			return BadRequest(new
			{
				message = "Bß¦ín phß¦úi cam kß¦+t ch¦íi b+¦ng -æ+í kh+¦ng c+í -æß+Ö."
			});
		}
		if (tournament.MaxPlayersPerTeam.HasValue && dto.PlayerIds != null && dto.PlayerIds.Count > tournament.MaxPlayersPerTeam.Value)
		{
			return BadRequest(new
			{
				message = $"Sß+æ l¦¦ß+úng cß¦ºu thß+º v¦¦ß+út qu+í giß+¢i hß¦ín ({tournament.MaxPlayersPerTeam.Value} ng¦¦ß+¥i)."
			});
		}
		if (await _context.TournamentTeams.AnyAsync((TournamentTeam tt) => tt.TournamentId == id && tt.TeamId == team.TeamId))
		{
			return BadRequest(new
			{
				message = "-Éß+Öi cß+ºa bß¦ín -æ+ú -æ-âng k++ giß¦úi -æß¦Ñu n+áy rß+ôi."
			});
		}
		TournamentTeam tt2 = new TournamentTeam
		{
			TournamentId = id,
			TeamId = team.TeamId,
			Status = "Pending",
			RegistrationDate = DateTime.Now,
			NoBettingCommitment = dto.NoBettingCommitment,
			TeamAbbreviation = dto.TeamAbbreviation
		};
		_context.TournamentTeams.Add(tt2);
		if (dto.PlayerIds != null && dto.PlayerIds.Any())
		{
			foreach (int playerId in dto.PlayerIds)
			{
				_context.TournamentTeamPlayers.Add(new TournamentTeamPlayer
				{
					TournamentId = id,
					TeamId = team.TeamId,
					PlayerId = playerId
				});
			}
		}
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "-É-âng k++ th+ánh c+¦ng."
		});
	}

	[HttpPost("Tournaments/{id}/RandomizeTeams")]
	public async Task<IActionResult> RandomizeTeams(int id, [FromQuery] int? numTeams, [FromBody] List<int> playerIds)
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
		{
			return Unauthorized();
		}
		Tournament tournament = await _context.Tournaments.FindAsync(id);
		if (tournament == null || tournament.OrganizerId != userId)
		{
			return NotFound(new
			{
				message = "Kh+¦ng t+¼m thß¦Ñy giß¦úi -æß¦Ñu hoß¦+c bß¦ín kh+¦ng c+¦ quyß+ün."
			});
		}
		if (tournament.Scope != "Internal")
		{
			return BadRequest(new
			{
				message = "Chß+ë +íp dß+Ñng cho giß¦úi -æß¦Ñu nß+Öi bß+Ö."
			});
		}
		if (playerIds == null || !playerIds.Any())
		{
			return BadRequest(new
			{
				message = "Danh s+ích ng¦¦ß+¥i ch¦íi trß+æng."
			});
		}
		int playersPerTeam = tournament.MaxPlayersPerTeam ?? 5;
		List<TournamentTeam> existingTt = _context.TournamentTeams.Where((TournamentTeam t) => t.TournamentId == id).ToList();
		if (existingTt.Any())
		{
			List<int> teamIds = existingTt.Select((TournamentTeam x) => x.TeamId).ToList();
			List<TournamentTeamPlayer> playersInTt = _context.TournamentTeamPlayers.Where((TournamentTeamPlayer p) => p.TournamentId == id).ToList();
			_context.TournamentTeamPlayers.RemoveRange(playersInTt);
			_context.TournamentTeams.RemoveRange(existingTt);
			List<Team> teamsToDelete = _context.Teams.Where((Team t) => teamIds.Contains(t.TeamId) && t.QualityLevel == "Nß+Öi bß+Ö").ToList();
			foreach (Team t2 in teamsToDelete)
			{
				List<TeamMember> members = _context.TeamMembers.Where((TeamMember m) => m.TeamId == t2.TeamId).ToList();
				_context.TeamMembers.RemoveRange(members);
			}
			_context.Teams.RemoveRange(teamsToDelete);
			await _context.SaveChangesAsync();
		}
		List<User> players = await _context.Users.Where((User u) => playerIds.Contains(u.UserId)).ToListAsync();
		Random rnd = new Random();
		List<User> shuffledPlayers = players.OrderBy((User x) => rnd.Next()).ToList();
		int actualNumTeams = numTeams ?? (int)Math.Ceiling((double)shuffledPlayers.Count / (double)playersPerTeam);
		playersPerTeam = (int)Math.Ceiling((double)shuffledPlayers.Count / (double)Math.Max(1, actualNumTeams));
		List<Team> newTeams = new List<Team>();
		for (int i = 0; i < actualNumTeams; i++)
		{
			Team team = new Team
			{
				TeamName = $"-Éß+Öi {i + 1}",
				CaptainId = userId,
				SportId = (tournament.SportId ?? 1),
				CreatedAt = DateTime.Now,
				QualityLevel = "Nß+Öi bß+Ö",
				IsInternal = true
			};
			_context.Teams.Add(team);
			newTeams.Add(team);
		}
		await _context.SaveChangesAsync();
		int playerIndex = 0;
		for (int j = 0; j < actualNumTeams; j++)
		{
			Team team2 = newTeams[j];
			_context.TournamentTeams.Add(new TournamentTeam
			{
				TournamentId = id,
				TeamId = team2.TeamId,
				Status = "Approved",
				RegistrationDate = DateTime.Now
			});
			int playersToAssign = Math.Min(playersPerTeam, shuffledPlayers.Count - playerIndex);
			if (playersToAssign <= 0)
			{
				break;
			}
			for (int k = 0; k < playersToAssign; k++)
			{
				User player = shuffledPlayers[playerIndex++];
				_context.TeamMembers.Add(new TeamMember
				{
					TeamId = team2.TeamId,
					PlayerId = player.UserId,
					RoleInTeam = ((k == 0) ? "Captain" : "Member"),
					Status = "Active",
					JoinedDate = DateTime.Now
				});
				if (k == 0)
				{
					team2.CaptainId = player.UserId;
				}
				_context.TournamentTeamPlayers.Add(new TournamentTeamPlayer
				{
					TournamentId = id,
					TeamId = team2.TeamId,
					PlayerId = player.UserId
				});
			}
		}
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = $"-É+ú chia th+ánh c+¦ng {numTeams} -æß+Öi.",
			teams = newTeams
		});
	}

	[HttpPut("Tournaments/{id}/Teams/{teamId}/Rename")]
	public async Task<IActionResult> RenameInternalTeam(int id, int teamId, [FromBody] string newName)
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
		{
			return Unauthorized();
		}
		Team team = await _context.Teams.FirstOrDefaultAsync((Team t) => t.TeamId == teamId && t.CaptainId == (int?)userId);
		if (team == null)
		{
			return NotFound(new
			{
				message = "Kh+¦ng t+¼m thß¦Ñy -æß+Öi hoß¦+c bß¦ín kh+¦ng c+¦ quyß+ün."
			});
		}
		if (!(await _context.TournamentTeams.AnyAsync((TournamentTeam tt) => tt.TournamentId == id && tt.TeamId == teamId)))
		{
			return BadRequest(new
			{
				message = "-Éß+Öi kh+¦ng thuß+Öc giß¦úi -æß¦Ñu n+áy."
			});
		}
		if (string.IsNullOrWhiteSpace(newName))
		{
			return BadRequest(new
			{
				message = "T+¬n kh+¦ng hß+úp lß+ç."
			});
		}
		team.TeamName = newName;
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "-Éß+òi t+¬n -æß+Öi th+ánh c+¦ng."
		});
	}

	[HttpGet("Tournaments/{id}/Bracket")]
	public async Task<IActionResult> GetTournamentBracket(int id)
	{
		Tournament tournament = await _context.Tournaments.FindAsync(id);
		if (tournament == null)
		{
			return NotFound();
		}
		if (string.IsNullOrEmpty(tournament.BracketJson))
		{
			return Ok(new
			{
				format = tournament.Format,
				rounds = new object[0]
			});
		}
		return Content(tournament.BracketJson, "application/json");
	}

	[HttpPut("Tournaments/{id}/Bracket")]
	public async Task<IActionResult> UpdateTournamentBracket(int id, [FromBody] JsonElement payload)
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		int.TryParse(userIdStr, out var userId);
		Tournament tournament = await _context.Tournaments.FindAsync(id);
		if (tournament == null || tournament.OrganizerId != userId)
		{
			return NotFound(new
			{
				message = "Kh+¦ng t+¼m thß¦Ñy giß¦úi -æß¦Ñu hoß¦+c bß¦ín kh+¦ng c+¦ quyß+ün."
			});
		}
		tournament.BracketJson = payload.GetRawText();
		List<Match> existingMatches = _context.Matches.Where((Match m) => m.TournamentId == (int?)id && (m.MatchStatus == "Upcoming" || m.MatchStatus == "Ch¦¦a xß¦+p lß+ïch")).ToList();
		_context.Matches.RemoveRange(existingMatches);
		List<Match> matchesToCreate = new List<Match>();
		ExtractMatchesFromJson(payload, matchesToCreate, id);
		if (matchesToCreate.Any())
		{
			_context.Matches.AddRange(matchesToCreate);
		}
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "L¦¦u s¦í -æß+ô nh+ính -æß¦Ñu th+ánh c+¦ng."
		});
	}

	[HttpPost("Tournaments/{id}/Cancel")]
	public async Task<IActionResult> CancelTournament(int id)
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
		{
			return Unauthorized();
		}
		Tournament tournament = await _context.Tournaments.Include((Tournament t) => t.Matches).FirstOrDefaultAsync((Tournament t) => t.TournamentId == id && t.OrganizerId == (int?)userId);
		if (tournament == null)
		{
			return NotFound(new
			{
				message = "Kh+¦ng t+¼m thß¦Ñy giß¦úi -æß¦Ñu hoß¦+c bß¦ín kh+¦ng c+¦ quyß+ün."
			});
		}
		if (tournament.Status == "Completed")
		{
			return BadRequest(new
			{
				message = "Kh+¦ng thß+â hß+ºy giß¦úi -æß¦Ñu -æ+ú kß¦+t th+¦c."
			});
		}
		tournament.Status = "Cancelled";
		foreach (Match match in tournament.Matches)
		{
			if (match.MatchStatus != "Completed")
			{
				match.MatchStatus = "Cancelled";
			}
		}
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "-É+ú hß+ºy giß¦úi -æß¦Ñu th+ánh c+¦ng."
		});
	}

	private void ExtractMatchesFromJson(JsonElement element, List<Match> matches, int tournamentId)
	{
		if (element.ValueKind == JsonValueKind.Array)
		{
			foreach (JsonElement item in element.EnumerateArray())
			{
				ExtractMatchesFromJson(item, matches, tournamentId);
			}
			return;
		}
		if (element.ValueKind != JsonValueKind.Object)
		{
			return;
		}
		int? homeTeamId = null;
		int? awayTeamId = null;
		if (element.TryGetProperty("homeTeamId", out var value) && value.ValueKind == JsonValueKind.Number)
		{
			homeTeamId = value.GetInt32();
		}
		if (element.TryGetProperty("awayTeamId", out var value2) && value2.ValueKind == JsonValueKind.Number)
		{
			awayTeamId = value2.GetInt32();
		}
		if (homeTeamId.HasValue || awayTeamId.HasValue)
		{
			matches.Add(new Match
			{
				TournamentId = tournamentId,
				HomeTeamId = homeTeamId,
				AwayTeamId = awayTeamId,
				MatchStatus = "Ch¦¦a xß¦+p lß+ïch",
				TournamentStage = "V+¦ng -Éß¦Ñu"
			});
		}
		foreach (JsonProperty item2 in element.EnumerateObject())
		{
			ExtractMatchesFromJson(item2.Value, matches, tournamentId);
		}
	}

	[HttpPost("Tournaments/Match/{matchId}/SubmitResult")]
	public async Task<IActionResult> SubmitTournamentMatchResult(int matchId, [FromBody] ScoreDto dto)
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		int.TryParse(userIdStr, out var userId);
		Match match = await _context.Matches.Include((Match m) => m.Tournament).Include((Match m) => m.HomeTeam).Include((Match m) => m.AwayTeam)
			.FirstOrDefaultAsync((Match m) => m.MatchId == matchId);
		if (match == null)
		{
			return NotFound(new
			{
				message = "Kh+¦ng t+¼m thß¦Ñy trß¦¡n -æß¦Ñu"
			});
		}
		if (match.Tournament == null || match.Tournament.OrganizerId != userId)
		{
			return Unauthorized(new
			{
				message = "Chß+ë ng¦¦ß+¥i tß¦ío giß¦úi mß+¢i -æ¦¦ß+úc cß¦¡p nhß¦¡t kß¦+t quß¦ú"
			});
		}
		match.HomeScore = dto.HomeScore;
		match.AwayScore = dto.AwayScore;
		if (dto.SetScores != null) match.SetScores = dto.SetScores;
		match.MatchStatus = "Completed";
		match.HomeConfirmed = true;
		match.AwayConfirmed = true;
		await CalculateRankingScoreAsync(match, dto.HomeScore, dto.AwayScore);
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "-É+ú l¦¦u kß¦+t quß¦ú trß¦¡n -æß¦Ñu"
		});
	}

	[AllowAnonymous]
	[HttpPut("Tournaments/Match/{matchId}")]
	public async Task<IActionResult> UpdateTournamentMatch(int matchId, [FromBody] UpdateTournamentMatchDto dto)
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		int.TryParse(userIdStr, out var userId);
		Match match = await _context.Matches.Include((Match m) => m.Tournament).Include((Match m) => m.HomeTeam).FirstOrDefaultAsync((Match m) => m.MatchId == matchId);
		if (match == null)
		{
			return NotFound(new
			{
				message = "Kh+¦ng t+¼m thß¦Ñy trß¦¡n -æß¦Ñu"
			});
		}
		bool isOrganizer = match.Tournament != null && match.Tournament.OrganizerId == userId;
		bool isHomeCaptain = match.HomeTeam != null && match.HomeTeam.CaptainId == userId;
		if (!isOrganizer && !isHomeCaptain)
		{
			return Unauthorized(new
			{
				message = "Bß¦ín kh+¦ng c+¦ quyß+ün chß+ënh sß+¡a trß¦¡n -æß¦Ñu n+áy"
			});
		}
		if (dto.PitchId.HasValue && dto.MatchDate.HasValue && dto.StartTime.HasValue)
		{
			int duration = dto.DurationMinutes ?? 90;
			if (dto.HasExtraTime == true)
			{
				duration += 30;
			}
			TimeSpan endTime = dto.StartTime.Value.Add(TimeSpan.FromMinutes(duration));
			if ((await _context.Matches.Where((Match m) => m.TournamentId == match.TournamentId && m.MatchId != matchId && m.PitchId == dto.PitchId && m.MatchDate == dto.MatchDate).ToListAsync()).Any(delegate(Match m)
			{
				if (!m.StartTime.HasValue || !m.DurationMinutes.HasValue)
				{
					return false;
				}
				int num = m.DurationMinutes.Value + ((m.HasExtraTime == true) ? 30 : 0);
				TimeSpan timeSpan = m.StartTime.Value.Add(TimeSpan.FromMinutes(num));
				return dto.StartTime.Value < timeSpan && endTime > m.StartTime.Value;
			}))
			{
				return BadRequest(new
				{
					message = "Lß+ïch thi -æß¦Ñu tr+¦ng vß+¢i mß+Öt trß¦¡n kh+íc tr+¬n c+¦ng s+ón n+áy!"
				});
			}
		}
		if (dto.MatchDate.HasValue)
		{
			match.MatchDate = dto.MatchDate;
		}
		if (dto.StartTime.HasValue)
		{
			match.StartTime = dto.StartTime;
		}
		if (dto.EndTime.HasValue)
		{
			match.EndTime = dto.EndTime;
		}
		if (dto.PitchId.HasValue)
		{
			match.PitchId = dto.PitchId;
			match.Location = null;
		}
		if (!string.IsNullOrEmpty(dto.Location))
		{
			match.Location = dto.Location;
			match.PitchId = null;
		}
		if (dto.DurationMinutes.HasValue)
		{
			match.DurationMinutes = dto.DurationMinutes;
		}
		if (dto.HasExtraTime.HasValue)
		{
			match.HasExtraTime = dto.HasExtraTime;
		}
		bool wasCompleted = match.MatchStatus == "Completed";
		if (dto.HomeScore.HasValue)
		{
			match.HomeScore = dto.HomeScore.Value;
		}
		if (dto.AwayScore.HasValue)
		{
			match.AwayScore = dto.AwayScore.Value;
		}
		if (!string.IsNullOrEmpty(dto.MatchStatus))
		{
			match.MatchStatus = dto.MatchStatus;
		}
		if (match.MatchStatus == "Completed" && !wasCompleted)
		{
			await CalculateRankingScoreAsync(match, match.HomeScore.GetValueOrDefault(), match.AwayScore.GetValueOrDefault());
		}
		if (match.PitchId.HasValue)
		{
			Pitch pitch = await _context.Pitches.Include((Pitch p) => p.Stadium).FirstOrDefaultAsync((Pitch p) => (int?)p.PitchId == match.PitchId);
			if (pitch != null && pitch.Stadium != null)
			{
				match.Location = pitch.PitchName + " - " + pitch.Stadium.StadiumName;
			}
		}
		if (match.StartTime.HasValue && match.DurationMinutes.HasValue)
		{
			int totalDur = match.DurationMinutes.Value + ((match.HasExtraTime == true) ? 30 : 0);
			match.EndTime = match.StartTime.Value.Add(TimeSpan.FromMinutes(totalDur));
		}
		else if (dto.EndTime.HasValue)
		{
			match.EndTime = dto.EndTime;
		}
		if (dto.HomeScore.HasValue)
		{
			match.HomeScore = dto.HomeScore.Value;
		}
		if (dto.AwayScore.HasValue)
		{
			match.AwayScore = dto.AwayScore.Value;
		}
		if (dto.SetScores != null)
		{
			match.SetScores = dto.SetScores;
		}
		if (!string.IsNullOrEmpty(dto.MatchStatus))
		{
			match.MatchStatus = dto.MatchStatus;
		}
		await _context.SaveChangesAsync();
		
		// Check if all matches in the tournament are completed
		if (match.TournamentId.HasValue)
		{
			var allMatches = await _context.Matches.Where(m => m.TournamentId == match.TournamentId).ToListAsync();
			if (allMatches.Any() && allMatches.All(m => m.MatchStatus == "Completed" || m.MatchStatus == "Cancelled"))
			{
				var t = await _context.Tournaments.FindAsync(match.TournamentId);
				if (t != null && t.Status != "Completed")
				{
					t.Status = "Completed";
					await _context.SaveChangesAsync();
				}
			}
		}

		return Ok(new
		{
			message = "Cập nhật trận đấu thành công"
		});
	}

	[HttpPost("Tournaments/{id}/AutoSchedule")]
	public async Task<IActionResult> AutoScheduleMatches(int id)
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		int.TryParse(userIdStr, out var userId);
		Tournament tournament = await _context.Tournaments.Include((Tournament t) => t.Matches).FirstOrDefaultAsync((Tournament t) => t.TournamentId == id && t.OrganizerId == (int?)userId);
		if (tournament == null)
		{
			return NotFound(new
			{
				message = "Tournament not found or unauthorized."
			});
		}
		List<Match> matches = tournament.Matches.ToList();
		if (!matches.Any())
		{
			return BadRequest(new
			{
				message = "Kh+¦ng c+¦ trß¦¡n -æß¦Ñu n+áo trong giß¦úi -æß+â xß¦+p lß+ïch."
			});
		}
		DateTime startDate = tournament.StartDate ?? DateTime.Now.Date;
		Random random = new Random();
		DateTime currentDay = startDate;
		int matchCountPerDay = 2;
		int currentMatchInDay = 0;
		foreach (Match m2 in matches.OrderBy((Match m) => m.MatchId))
		{
			m2.MatchDate = currentDay;
			m2.DurationMinutes = 90;
			m2.HasExtraTime = false;
			int startHour = random.Next(16, 21);
			m2.StartTime = new TimeSpan(startHour, 0, 0);
			m2.EndTime = m2.StartTime.Value.Add(TimeSpan.FromMinutes(90.0));
			if (tournament.StadiumId.HasValue)
			{
				List<Pitch> pitches = await _context.Pitches.Where((Pitch p) => p.StadiumId == tournament.StadiumId).ToListAsync();
				if (pitches.Any())
				{
					Pitch randomPitch = pitches[random.Next(pitches.Count)];
					m2.PitchId = randomPitch.PitchId;
					m2.Location = randomPitch.PitchName;
				}
			}
			m2.MatchStatus = "Scheduled";
			currentMatchInDay++;
			if (currentMatchInDay >= matchCountPerDay)
			{
				currentMatchInDay = 0;
				currentDay = currentDay.AddDays(1.0);
			}
		}
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "-É+ú tß+¦ -æß+Öng xß¦+p lß+ïch thi -æß¦Ñu th+ánh c+¦ng!"
		});
	}

	[HttpPost("Tournaments/{id}/Start")]
	public async Task<IActionResult> StartTournament(int id)
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		int.TryParse(userIdStr, out var userId);
		Tournament tournament = await _context.Tournaments.FirstOrDefaultAsync((Tournament t) => t.TournamentId == id && t.OrganizerId == (int?)userId);
		if (tournament == null)
		{
			return NotFound(new
			{
				message = "Tournament not found or unauthorized."
			});
		}
		if (tournament.Status == "InProgress" || tournament.Status == "Completed")
		{
			return BadRequest(new
			{
				message = "Giß¦úi -æß¦Ñu -æ+ú bß¦»t -æß¦ºu hoß¦+c -æ+ú kß¦+t th+¦c."
			});
		}
		tournament.Status = "InProgress";
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "-É+ú bß¦»t -æß¦ºu giß¦úi -æß¦Ñu!"
		});
	}

	[HttpGet("Tournaments/{id}/Matches")]
	public async Task<IActionResult> GetTournamentMatches(int id)
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		int.TryParse(userIdStr, out var userId);
		return Ok(await (from m in _context.Matches.Include((Match m) => m.HomeTeam).Include((Match m) => m.AwayTeam)
			where m.TournamentId == (int?)id && m.Tournament.OrganizerId == (int?)userId
			select new
			{
				MatchId = m.MatchId,
				HomeTeamId = m.HomeTeamId,
				HomeTeamName = ((m.HomeTeam != null) ? m.HomeTeam.TeamName : "N/A"),
				AwayTeamId = m.AwayTeamId,
				AwayTeamName = ((m.AwayTeam != null) ? m.AwayTeam.TeamName : "N/A"),
				HomeScore = m.HomeScore,
				AwayScore = m.AwayScore,
				MatchStatus = m.MatchStatus,
				MatchDate = m.MatchDate,
				StartTime = m.StartTime,
				EndTime = m.EndTime,
				TournamentStage = m.TournamentStage
			}).ToListAsync());
	}

	[HttpPut("Tournaments/{id}/SwissMatches")]
	public async Task<IActionResult> UpdateSwissMatches(int id, [FromBody] object payload)
	{
		return Ok(new
		{
			message = "Swiss matches updated."
		});
	}

	[HttpGet("Stadiums")]
	public async Task<IActionResult> GetStadiums()
	{
		return Ok(await (from s in _context.Stadiums.Include((Stadium s) => s.Pitches)
			select new
			{
				StadiumId = s.StadiumId,
				StadiumName = s.StadiumName,
				Address = s.Address,
				Hotline = s.Hotline,
				Pitches = s.Pitches.Select((Pitch p) => new { p.PitchId, p.PitchName, p.PitchSize, p.PricePerSlot })
			}).ToListAsync());
	}

	[HttpGet("Stadiums/{id}")]
	public async Task<IActionResult> GetStadiumDetails(int id)
	{
		var stadium = await (from s in _context.Stadiums.Include((Stadium s) => s.Pitches)
			select new
			{
				StadiumId = s.StadiumId,
				StadiumName = s.StadiumName,
				Address = s.Address,
				Hotline = s.Hotline,
				Description = s.Description,
				OwnerId = s.OwnerId,
				Pitches = s.Pitches.Select((Pitch p) => new { p.PitchId, p.PitchName, p.PitchSize, p.PricePerSlot, p.GrassType })
			}).FirstOrDefaultAsync(s => s.StadiumId == id);
		if (stadium == null)
		{
			return NotFound(new
			{
				message = "Stadium not found."
			});
		}
		return Ok(stadium);
	}

	[HttpGet("Pitches/{pitchId}/Calendar")]
	public async Task<IActionResult> GetPitchCalendar(int pitchId, [FromQuery] DateTime date)
	{
		DateTime startOfDay = date.Date;
		DateTime endOfDay = startOfDay.AddDays(1.0).AddTicks(-1L);
		
		var pitch = await _context.Pitches.Include(p => p.Stadium).FirstOrDefaultAsync(p => p.PitchId == pitchId);
		if (pitch == null || pitch.Stadium == null) return NotFound("Pitch or Stadium not found");

		var schedules = await (from ps in _context.PitchSchedules
			where ps.PitchId == (int?)pitchId && ps.StartTime >= startOfDay && ps.EndTime <= endOfDay
			select new { ps.ScheduleId, ps.StartTime, ps.EndTime, ps.ScheduleStatus, ps.LockedUntil }).ToListAsync();

		return Ok(new
		{
			openTime = pitch.Stadium.OpenTime?.ToString(@"hh\:mm") ?? "05:00",
			closeTime = pitch.Stadium.CloseTime?.ToString(@"hh\:mm") ?? "23:30",
			slotDurationMinutes = pitch.Stadium.SlotDurationMinutes ?? 30,
			schedules = schedules
		});
	}

	[HttpGet("BookingHistory")]
	public async Task<IActionResult> GetBookingHistory()
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
		{
			return Unauthorized();
		}

		var bookings = await _context.PitchSchedules
			.Include(ps => ps.Pitch)
			.ThenInclude(p => p.Stadium)
			.Where(ps => ps.BookedById == userId)
			.OrderByDescending(ps => ps.StartTime)
			.Select(ps => new
			{
				ps.ScheduleId,
				ps.PitchId,
				PitchName = ps.Pitch != null ? ps.Pitch.PitchName : "",
				StadiumName = ps.Pitch != null && ps.Pitch.Stadium != null ? ps.Pitch.Stadium.StadiumName : "",
				ps.StartTime,
				ps.EndTime,
				ps.ScheduleStatus,
				// Kiem tra xem booking nay co match nao khong
				HasMatch = _context.Matches.Any(m => m.ScheduleId == ps.ScheduleId)
			})
			.ToListAsync();

		return Ok(bookings);
	}

	[HttpPost("BookPitch")]
	public async Task<IActionResult> BookPitch([FromBody] BookPitchDto dto)
	{
		string userIdStr = base.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
		if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
		{
			return Unauthorized();
		}

		if (dto.StartTime < DateTime.Now || dto.EndTime <= dto.StartTime)
		{
			return BadRequest(new { message = "Thời gian đặt sân không hợp lệ (không thể đặt trong quá khứ)." });
		}

		Team team = await GetMyTeamAsync();

		using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
		try
		{
			if (await _context.PitchSchedules.Where((PitchSchedule ps) => ps.PitchId == (int?)dto.PitchId && ps.StartTime < dto.EndTime && ps.EndTime > dto.StartTime && (ps.ScheduleStatus == "Booked" || ps.ScheduleStatus == "Confirmed" || (ps.LockedUntil != null && ps.LockedUntil > DateTime.Now))).AnyAsync())
			{
				return BadRequest(new
				{
					message = "Khung giờ này đã có người đặt hoặc đang trong quá trình thanh toán chờ."
				});
			}
			bool isPayLater = dto.BookingType == "pay_later";
			PitchSchedule pitchSchedule = new PitchSchedule
			{
				PitchId = dto.PitchId,
				StartTime = dto.StartTime,
				EndTime = dto.EndTime,
				ScheduleStatus = (isPayLater ? "Booked" : "PendingPayment"),
				LockedUntil = (isPayLater ? ((DateTime?)null) : new DateTime?(DateTime.Now.AddMinutes(10.0))),
				BookedById = userId
			};
			_context.PitchSchedules.Add(pitchSchedule);
			await _context.SaveChangesAsync();
			await transaction.CommitAsync();

			Pitch pitch = await _context.Pitches.Include((Pitch p) => p.Stadium).FirstOrDefaultAsync((Pitch p) => p.PitchId == dto.PitchId);
			if (pitch != null && pitch.Stadium != null && isPayLater)
		{
			int ownerId = pitch.Stadium.OwnerId.GetValueOrDefault();
			Notification notif = new Notification
			{
				UserId = ownerId,
				Title = "C\u00f3 \u0111\u1ed9i \u0111\u1eb7t s\u00e2n m\u1edbi",
				Message = $"S\u00e2n {pitch.PitchName} ({pitch.Stadium.StadiumName}) v\u1eeba \u0111\u01b0\u1ee3c \u0111\u1eb7t v\u00e0o l\u00fac {dto.StartTime:HH:mm dd/MM/yyyy}. Thanh to\u00e1n t\u1ea1i s\u00e2n.",
				CreatedAt = DateTime.Now,
				IsRead = false
			};
			_context.Notifications.Add(notif);
			await _context.SaveChangesAsync();
			string connId = NotificationHub.GetConnectionIdForUser(ownerId.ToString());
			if (!string.IsNullOrEmpty(connId))
			{
				await _hubContext.Clients.Client(connId).SendAsync("ReceiveNotification", notif.Message);
			}
		}
		if (dto.MatchId.HasValue)
		{
			Match match = await _context.Matches.FindAsync(dto.MatchId.Value);
			if (match != null && (match.HomeTeamId == team?.TeamId || match.AwayTeamId == team?.TeamId))
			{
				match.ScheduleId = pitchSchedule.ScheduleId;
				match.MatchStatus = "Scheduled";
				match.MatchDate = pitchSchedule.StartTime.Date;
				match.StartTime = pitchSchedule.StartTime.TimeOfDay;
				match.EndTime = pitchSchedule.EndTime.TimeOfDay;
				if (pitch != null && pitch.Stadium != null)
				{
					match.Location = $"{pitch.Stadium.StadiumName} - {pitch.PitchName} (GPS: {pitch.Stadium.Latitude}, {pitch.Stadium.Longitude})";
				}
				await _context.SaveChangesAsync();
			}
		}
			return Ok(new
			{
				message = "Pitch reserved. Please proceed to payment within 10 minutes.",
				scheduleId = pitchSchedule.ScheduleId,
				paymentRequired = true,
				paymentType = "BookingDeposit"
			});
		}
		catch (Exception ex)
		{
			await transaction.RollbackAsync();
			return StatusCode(500, new { message = "Lỗi khi đặt sân: " + ex.Message });
		}
	}

	[HttpPost("CreateRecruitment")]
	public async Task<IActionResult> CreateRecruitment([FromBody] RecruitmentDto dto)
	{
		try
		{
			Team team = await GetMyTeamAsync();
			if (team == null)
			{
				return NotFound(new
				{
					message = "B\u1ea1n ch\u01b0a c\u00f3 \u0111\u1ed9i."
				});
			}
			RecruitmentAd ad = new RecruitmentAd
			{
				TeamId = team.TeamId,
				Title = dto.Title,
				Content = dto.Content,
				PositionNeeded = dto.PositionNeeded,
				CreatedAt = DateTime.UtcNow,
				IsActive = true
			};
			_context.RecruitmentAds.Add(ad);
			await _context.SaveChangesAsync();
			return Ok(new
			{
				message = "T\u1ea1o tuy\u1ec3n qu\u00e2n th\u00e0nh c\u00f4ng",
				id = ad.AdId
			});
		}
		catch (Exception ex)
		{
			Exception ex2 = ex;
			return StatusCode(500, new
			{
				message = "L\u1ed7i khi t\u1ea1o b\u00e0i tuy\u1ec3n d\u1ee5ng: " + ex2.Message,
				details = ex2.StackTrace
			});
		}
	}

	[HttpPost("Matches/{id}/Request")]
	public async Task<IActionResult> RequestToJoinMatch(int id, [FromBody] MatchRequestDto dto)
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return Unauthorized(new { message = "Bạn không phải là đội trưởng." });
		}

		if (team.FairplayScore <= 20)
		{
			return BadRequest(new { message = "Điểm Fairplay của bạn quá thấp (<=20), bạn không thể bắt kèo." });
		}
		
		if (team.FairplayScore <= 40)
		{
			var currentMonth = DateTime.Now.Month;
			var currentYear = DateTime.Now.Year;
			var thisMonthAccepted = await _context.Matches
				.Where(m => m.AwayTeamId == team.TeamId && m.MatchDate != null && m.MatchDate.Value.Month == currentMonth && m.MatchDate.Value.Year == currentYear)
				.CountAsync();

			if (thisMonthAccepted >= 2)
			{
				return BadRequest(new { message = "Điểm Fairplay của bạn thấp, bạn chỉ được bắt kèo tối đa 2 trận trong tháng này." });
			}
		}
		Match match = await _context.Matches.FindAsync(id);
		if (match == null)
		{
			return NotFound(new
			{
				message = "Kh\u00f4ng t\u00ecm th\u1ea5y tr\u1eadn \u0111\u1ea5u."
			});
		}
		if (match.HomeTeamId == team.TeamId)
		{
			return BadRequest(new
			{
				message = "\u0110\u00e2y l\u00e0 tr\u1eadn \u0111\u1ea5u c\u1ee7a \u0111\u1ed9i b\u1ea1n."
			});
		}
		if (match.AwayTeamId.HasValue)
		{
			return BadRequest(new
			{
				message = "Tr\u1eadn \u0111\u1ea5u \u0111\u00e3 c\u00f3 \u0111\u1ed9i kh\u00e1ch."
			});
		}
		if (await _context.MatchRequests.FirstOrDefaultAsync((MatchRequest r) => r.MatchId == id && r.RequestingTeamId == team.TeamId && r.Status == "Pending") != null)
		{
			return BadRequest(new
			{
				message = "B\u1ea1n \u0111\u00e3 g\u1eedi y\u00eau c\u1ea7u cho tr\u1eadn \u0111\u1ea5u n\u00e0y r\u1ed3i."
			});
		}
		MatchRequest req = new MatchRequest
		{
			MatchId = id,
			RequestingTeamId = team.TeamId,
			Message = dto.Message,
			Status = "Pending"
		};
		_context.MatchRequests.Add(req);
		await _context.SaveChangesAsync();
		if (match.HomeTeamId.HasValue)
		{
			Team homeTeam = await _context.Teams.FindAsync(match.HomeTeamId.Value);
			if (homeTeam != null && homeTeam.CaptainId > 0)
			{
				Notification notification = new Notification
				{
					UserId = homeTeam.CaptainId,
					Title = "Y\u00eau c\u1ea7u b\u1eaft k\u00e8o m\u1edbi",
					Message = "\u0110\u1ed9i " + team.TeamName + " v\u1eeba g\u1eedi y\u00eau c\u1ea7u giao h\u1eefu v\u1edbi \u0111\u1ed9i c\u1ee7a b\u1ea1n!",
					IsRead = false,
					CreatedAt = DateTime.Now
				};
				_context.Notifications.Add(notification);
				await _context.SaveChangesAsync();
				string connectionId = NotificationHub.GetConnectionIdForUser(homeTeam.CaptainId.ToString());
				if (!string.IsNullOrEmpty(connectionId))
				{
					await _hubContext.Clients.Client(connectionId).SendAsync("ReceiveNotification", notification.Message);
				}
			}
		}
		return Ok(new
		{
			message = "\u0110\u00e3 g\u1eedi y\u00eau c\u1ea7u b\u1eaft k\u00e8o th\u00e0nh c\u00f4ng."
		});
	}

	[HttpGet("MatchRequests")]
	public async Task<IActionResult> GetMatchRequests()
	{
		try
		{
			Team team = await GetMyTeamAsync();
			if (team == null)
			{
				return Unauthorized();
			}
			var result = (await (from r in _context.MatchRequests.Include((MatchRequest r) => r.Match).Include((MatchRequest r) => r.RequestingTeam)
				where r.Match != null && r.Match.HomeTeamId == (int?)team.TeamId && r.Status == "Pending"
				select r).ToListAsync()).Select((MatchRequest r) => new
			{
				RequestId = r.RequestId,
				MatchId = r.MatchId,
				Message = r.Message,
				CreatedAt = r.CreatedAt,
				MatchDate = r.Match?.MatchDate,
				Team = ((r.RequestingTeam != null) ? new
				{
					r.RequestingTeam.TeamId,
					r.RequestingTeam.TeamName,
					r.RequestingTeam.LogoUrl,
					r.RequestingTeam.QualityLevel
				} : null)
			});
			return Ok(result);
		}
		catch (Exception ex)
		{
			Exception ex2 = ex;
			return StatusCode(500, new
			{
				message = ex2.Message,
				stack = ex2.StackTrace,
				inner = ex2.InnerException?.Message
			});
		}
	}

	[HttpPost("MatchRequests/{id}/Accept")]
	public async Task<IActionResult> AcceptMatchRequest(int id)
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return Unauthorized();
		}
		MatchRequest req = await _context.MatchRequests.Include((MatchRequest r) => r.Match).FirstOrDefaultAsync((MatchRequest r) => r.RequestId == id);
		if (req == null)
		{
			return NotFound();
		}
		if (!req.IsInvite && req.Match.HomeTeamId != team.TeamId)
		{
			return Unauthorized();
		}
		if (req.IsInvite && req.RequestingTeamId != team.TeamId)
		{
			return Unauthorized();
		}
		if (req.Match.AwayTeamId.HasValue)
		{
			return BadRequest(new
			{
				message = "Tr\u1eadn \u0111\u1ea5u \u0111\u00e3 c\u00f3 \u0111\u1ed9i kh\u00e1ch."
			});
		}
		req.Status = "Accepted";
		req.Match.AwayTeamId = req.RequestingTeamId;
		req.Match.MatchStatus = "Scheduled";
		foreach (MatchRequest r2 in await _context.MatchRequests.Where((MatchRequest r) => r.MatchId == req.MatchId && r.RequestId != id && r.Status == "Pending").ToListAsync())
		{
			r2.Status = "Rejected";
		}
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "\u0110\u00e3 ch\u1ea5p nh\u1eadn k\u00e8o."
		});
	}

	[HttpPost("MatchRequests/{id}/Reject")]
	public async Task<IActionResult> RejectMatchRequest(int id)
	{
		Team team = await GetMyTeamAsync();
		if (team == null)
		{
			return Unauthorized();
		}
		MatchRequest req = await _context.MatchRequests.Include((MatchRequest r) => r.Match).FirstOrDefaultAsync((MatchRequest r) => r.RequestId == id);
		if (req == null)
		{
			return NotFound();
		}
		if (!req.IsInvite && req.Match.HomeTeamId != team.TeamId)
		{
			return Unauthorized();
		}
		if (req.IsInvite && req.RequestingTeamId != team.TeamId)
		{
			return Unauthorized();
		}
		req.Status = "Rejected";
		await _context.SaveChangesAsync();
		return Ok(new
		{
			message = "\u0110\u00e3 t\u1eeb ch\u1ed1i k\u00e8o."
		});
	}

	private async Task CalculateRankingScoreAsync(Match match, int homeScore, int awayScore)
	{
		if (match.TournamentId.HasValue)
		{
			Tournament t = await _context.Tournaments.FindAsync(match.TournamentId.Value);
			if (t != null && t.Scope == "Internal")
			{
				return;
			}
		}

		Team homeTeam = match.HomeTeamId.HasValue ? await _context.Teams.Include(t => t.Sport).FirstOrDefaultAsync(t => t.TeamId == match.HomeTeamId.Value) : null;
		Team awayTeam = match.AwayTeamId.HasValue ? await _context.Teams.Include(t => t.Sport).FirstOrDefaultAsync(t => t.TeamId == match.AwayTeamId.Value) : null;

		if ((homeTeam != null && homeTeam.Sport != null && homeTeam.Sport.HasScoring == false) || 
			(awayTeam != null && awayTeam.Sport != null && awayTeam.Sport.HasScoring == false))
		{
			return;
		}

		if ((homeTeam != null && homeTeam.IsInternal) || (awayTeam != null && awayTeam.IsInternal))
		{
			return;
		}

		if (homeTeam == null && awayTeam == null)
		{
			return;
		}
		int num = ((homeTeam != null) ? (await _context.Teams.CountAsync((Team t) => t.RankingScore > homeTeam.RankingScore) + 1) : 0);
		int homeRank = num;
		int num2 = ((awayTeam != null) ? (await _context.Teams.CountAsync((Team t) => t.RankingScore > awayTeam.RankingScore) + 1) : 0);
		int awayRank = num2;
		int diff = 0;
		if (homeTeam != null && awayTeam != null)
		{
			diff = Math.Abs(homeRank - awayRank);
		}
		if (diff < 15)
		{
			if (homeScore > awayScore)
			{
				AddPoints(homeTeam, 3);
				AddPoints(awayTeam, -3);
			}
			else if (homeScore < awayScore)
			{
				AddPoints(homeTeam, -3);
				AddPoints(awayTeam, 3);
			}
			else
			{
				AddPoints(homeTeam, 1);
				AddPoints(awayTeam, 1);
			}
		}
		else if (diff >= 15 && diff <= 20)
		{
			bool homeIsHigher = homeRank < awayRank;
			bool higherWon = (homeIsHigher ? (homeScore > awayScore) : (awayScore > homeScore));
			bool isDraw = homeScore == awayScore;
			Team higherTeam = (homeIsHigher ? homeTeam : awayTeam);
			Team lowerTeam = (homeIsHigher ? awayTeam : homeTeam);
			if (higherWon)
			{
				AddPoints(higherTeam, 2);
				AddPoints(lowerTeam, -1);
			}
			else if (isDraw)
			{
				AddPoints(higherTeam, -3);
				AddPoints(lowerTeam, 5);
			}
			else
			{
				AddPoints(higherTeam, -6);
				AddPoints(lowerTeam, 9);
			}
		}
		else
		{
			bool homeIsHigher2 = homeRank < awayRank;
			bool higherWon2 = (homeIsHigher2 ? (homeScore > awayScore) : (awayScore > homeScore));
			bool isDraw2 = homeScore == awayScore;
			Team higherTeam2 = (homeIsHigher2 ? homeTeam : awayTeam);
			Team lowerTeam2 = (homeIsHigher2 ? awayTeam : homeTeam);
			if (higherWon2)
			{
				AddPoints(higherTeam2, 1);
				AddPoints(lowerTeam2, -1);
			}
			else if (isDraw2)
			{
				AddPoints(higherTeam2, -5);
				AddPoints(lowerTeam2, 9);
			}
			else
			{
				AddPoints(higherTeam2, -12);
				AddPoints(lowerTeam2, 15);
			}
		}
		if (homeTeam != null)
		{
			int rank = await _context.Teams.CountAsync((Team t) => t.RankingScore > homeTeam.RankingScore) + 1;
			Notification notif = new Notification
			{
				UserId = homeTeam.CaptainId,
				Title = "C\u1eadp nh\u1eadt Ranking",
				Message = $"K\u1ebft qu\u1ea3 c\u1eadp nh\u1eadt: {homeTeam.TeamName} c\u00f3 {homeTeam.RankingScore} \u0111i\u1ec3m (H\u1ea1ng {rank}).",
				CreatedAt = DateTime.Now,
				IsRead = false
			};
			_context.Notifications.Add(notif);
			string connId = NotificationHub.GetConnectionIdForUser(homeTeam.CaptainId.ToString());
			if (!string.IsNullOrEmpty(connId))
			{
				await _hubContext.Clients.Client(connId).SendAsync("ReceiveNotification", notif.Message);
			}
		}
		if (awayTeam != null)
		{
			int rank2 = await _context.Teams.CountAsync((Team t) => t.RankingScore > awayTeam.RankingScore) + 1;
			Notification notif2 = new Notification
			{
				UserId = awayTeam.CaptainId,
				Title = "C\u1eadp nh\u1eadt Ranking",
				Message = $"K\u1ebft qu\u1ea3 c\u1eadp nh\u1eadt: {awayTeam.TeamName} c\u00f3 {awayTeam.RankingScore} \u0111i\u1ec3m (H\u1ea1ng {rank2}).",
				CreatedAt = DateTime.Now,
				IsRead = false
			};
			_context.Notifications.Add(notif2);
			string connId2 = NotificationHub.GetConnectionIdForUser(awayTeam.CaptainId.ToString());
			if (!string.IsNullOrEmpty(connId2))
			{
				await _hubContext.Clients.Client(connId2).SendAsync("ReceiveNotification", notif2.Message);
			}
		}
		static void AddPoints(Team? team, int points)
		{
			if (team != null)
			{
				team.RankingScore += points;
				if (team.RankingScore < 0)
				{
					team.RankingScore = 0;
				}
			}
		}
	}

    [HttpPost("Matches/{matchId}/InviteTeam/{targetTeamId}")]
    public async Task<IActionResult> InviteTeamToMatch(int matchId, int targetTeamId)
    {
        try
        {
            Team myTeam = await GetMyTeamAsync();
            if (myTeam == null) return NotFound(new { message = "Team not found." });

            Match match = await _context.Matches.FindAsync(matchId);
            if (match == null || match.HomeTeamId != myTeam.TeamId) return BadRequest(new { message = "Invalid match." });

            Team targetTeam = await _context.Teams.FindAsync(targetTeamId);
            if (targetTeam == null) return NotFound(new { message = "Target team not found." });

            bool exists = await _context.MatchRequests.AnyAsync(r => r.MatchId == matchId && r.RequestingTeamId == targetTeamId);
            if (exists) return BadRequest(new { message = "Đã có yêu cầu hoặc lời mời đối với đội này." });

            MatchRequest req = new MatchRequest
            {
                MatchId = matchId,
                RequestingTeamId = targetTeamId,
                Status = "Pending",
                IsInvite = true,
                Message = $"Đội {myTeam.TeamName} đã mời bạn tham gia trận đấu giao hữu."
            };
            _context.MatchRequests.Add(req);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Gửi lời mời thành công!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("Matches/ReceivedInvites")]
    public async Task<IActionResult> GetReceivedInvites()
    {
        try
        {
            Team myTeam = await GetMyTeamAsync();
            if (myTeam == null) return NotFound(new { message = "Team not found." });

            var invites = await _context.MatchRequests
                .Include(r => r.Match)
                .ThenInclude(m => m.HomeTeam)
                .Where(r => r.RequestingTeamId == myTeam.TeamId && r.IsInvite && r.Status == "Pending")
                .Select(r => new
                {
                    RequestId = r.RequestId,
                    MatchId = r.MatchId,
                    MatchDate = r.Match.MatchDate,
                    StartTime = r.Match.StartTime,
                    Location = r.Match.Location,
                    HomeTeamName = r.Match.HomeTeam != null ? r.Match.HomeTeam.TeamName : "Không xác định",
                    HomeTeamAvatar = r.Match.HomeTeam != null ? r.Match.HomeTeam.LogoUrl : null,
                    Message = r.Message,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(invites);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
