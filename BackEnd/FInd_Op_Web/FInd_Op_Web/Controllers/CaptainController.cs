using FInd_Op_Web.DTOs;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FInd_Op_Web.Data;
using FInd_Op_Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;

namespace FInd_Op_Web.Controllers
{




    [Authorize(Roles = "Captain")]
    [ApiController]
    [Route("api/[controller]")]
    public class CaptainController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<FInd_Op_Web.Hubs.NotificationHub> _hubContext;

        public CaptainController(ApplicationDbContext context, IHubContext<FInd_Op_Web.Hubs.NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        private async Task<Team?> GetMyTeamAsync()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return null;
            }

            return await _context.Teams.FirstOrDefaultAsync(t => t.CaptainId == userId);
        }

        [HttpGet("MyTeam")]
        public async Task<IActionResult> GetMyTeam()
        {
            try 
            {
                var team = await GetMyTeamAsync();
                if (team == null) return NotFound(new { message = "You are not a captain of any team." });

                var memberCount = await _context.TeamMembers.CountAsync(tm => tm.TeamId == team.TeamId && tm.Status == "Active");

                int wonCount = await _context.Matches.CountAsync(m => m.MatchStatus == "Completed" &&
                    ((m.HomeTeamId == team.TeamId && m.HomeScore > m.AwayScore) ||
                     (m.AwayTeamId == team.TeamId && m.AwayScore > m.HomeScore)));
                     
                int totalCompleted = await _context.Matches.CountAsync(m => m.MatchStatus == "Completed" && (m.HomeTeamId == team.TeamId || m.AwayTeamId == team.TeamId));
                
                double winRate = totalCompleted > 0 ? Math.Round((double)wonCount / totalCompleted * 100, 1) : 0;

                var nextMatch = await _context.Matches
                    .Include(m => m.Schedule)
                        .ThenInclude(s => s.Pitch)
                    .Where(m => (m.HomeTeamId == team.TeamId || m.AwayTeamId == team.TeamId) 
                                && m.MatchStatus != "Completed" 
                                && m.MatchStatus != "Cancelled" 
                                && m.ScheduleId != null 
                                && m.Schedule.StartTime >= DateTime.UtcNow.Date)
                    .OrderBy(m => m.Schedule.StartTime)
                    .Select(m => new { MatchDate = m.Schedule.StartTime, StadiumId = m.Schedule.Pitch != null ? (int?)m.Schedule.Pitch.StadiumId : null })
                    .FirstOrDefaultAsync();

                string nextMatchStr = "Chưa có";
                string nextMatchTrend = "";
                if (nextMatch != null)
                {
                    nextMatchStr = nextMatch.MatchDate.ToString("dd/MM/yyyy");
                    nextMatchTrend = nextMatch.StadiumId != null ? "Đã chốt sân" : "Chưa có sân";
                }

                return Ok(new
                {
                    team.TeamId,
                    team.TeamName,
                    team.QualityLevel,
                    team.History,
                    team.HomeArea,
                    team.CreatedAt,
                    team.IsDisbanded,
                    team.LogoUrl,
                    team.RankingScore,
                    MemberCount = memberCount,
                    WinRate = winRate,
                    NextMatchDate = nextMatchStr,
                    NextMatchTrend = nextMatchTrend
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, stackTrace = ex.StackTrace, innerException = ex.InnerException?.Message });
            }
        }

        [HttpPost("CreateTeam")]
        public async Task<IActionResult> CreateTeam([FromBody] CaptainCreateTeamDto dto)
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                {
                    return Unauthorized();
                }

                var activeTeams = await _context.TeamMembers
                    .Include(tm => tm.Team)
                    .Where(tm => tm.PlayerId == userId && tm.Status == "Active")
                    .ToListAsync();

                if (activeTeams.Count >= 2)
                {
                    return BadRequest(new { message = "Bạn đã tham gia tối đa 2 đội thể thao." });
                }

                if (activeTeams.Any(t => t.Team != null && t.Team.SportId == dto.SportId))
                {
                    return BadRequest(new { message = "Bạn đã tham gia một đội thuộc môn thể thao này rồi." });
                }

                var team = new Team
                {
                    TeamName = dto.TeamName,
                    HomeArea = dto.HomeArea,
                    History = dto.Introduction,
                    CaptainId = userId,
                    SportId = dto.SportId,
                    LogoUrl = dto.LogoUrl,
                    CreatedAt = DateTime.Now,
                    FoundedDate = DateTime.Now,
                    IsDisbanded = false,
                    LookingForOpponent = true,
                    TeamMembers = new System.Collections.Generic.List<TeamMember>
                    {
                        new TeamMember
                        {
                            PlayerId = userId,
                            RoleInTeam = dto.IsClubOwner ? "Owner" : "Captain",
                            Status = "Active",
                            JoinedDate = DateTime.Now
                        }
                    }
                };

                _context.Teams.Add(team);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Tạo đội bóng thành công.", teamId = team.TeamId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, stackTrace = ex.StackTrace, innerException = ex.InnerException?.Message });
            }
        }

        [HttpPut("UpdateTeam")]
        public async Task<IActionResult> UpdateTeam([FromBody] CaptainUpdateTeamDto dto)
        {
            try
            {
                var team = await GetMyTeamAsync();
                if (team == null) return NotFound(new { message = "Team not found." });

                team.TeamName = dto.TeamName;
                team.HomeArea = dto.HomeArea;
                team.History = dto.Introduction;
                if (dto.QualityLevel != null) team.QualityLevel = dto.QualityLevel;
                if (!string.IsNullOrEmpty(dto.LogoUrl))
                {
                    team.LogoUrl = dto.LogoUrl;
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật thông tin đội thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, stackTrace = ex.StackTrace, innerException = ex.InnerException?.Message });
            }
        }

        [HttpPost("TransferRole")]
        public async Task<IActionResult> TransferRole([FromBody] TransferRoleDto dto)
        {
            var team = await GetMyTeamAsync();
            if (team == null) return NotFound(new { message = "Team not found." });

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdStr, out int currentCaptainId);

            var targetMember = await _context.TeamMembers.FirstOrDefaultAsync(tm => tm.TeamId == team.TeamId && tm.PlayerId == dto.NewCaptainId && tm.Status == "Active");
            if (targetMember == null) return NotFound(new { message = "Target player not found in team." });

            var currentMember = await _context.TeamMembers.FirstOrDefaultAsync(tm => tm.TeamId == team.TeamId && tm.PlayerId == currentCaptainId && tm.Status == "Active");
            if (currentMember == null) return NotFound(new { message = "Current captain not found in team." });

            team.CaptainId = dto.NewCaptainId;
            targetMember.RoleInTeam = "Captain";
            currentMember.RoleInTeam = dto.NewRoleForOldCaptain; 

            await _context.SaveChangesAsync();
            return Ok(new { message = "Role transferred successfully." });
        }

        [HttpGet("Members")]
        public async Task<IActionResult> GetMembers()
        {
            var team = await GetMyTeamAsync();
            if (team == null) return NotFound(new { message = "Team not found." });

            var totalTeamMatches = await _context.Matches.CountAsync(m => m.HomeTeamId == team.TeamId || m.AwayTeamId == team.TeamId);
            var matchPolls = await _context.MatchPolls
                .Where(mp => mp.IsAttending == true && (mp.Match.HomeTeamId == team.TeamId || mp.Match.AwayTeamId == team.TeamId))
                .ToListAsync();

            var members = await _context.TeamMembers
                .Include(tm => tm.Player)
                .Where(tm => tm.TeamId == team.TeamId)
                .ToListAsync();

            var result = members.Select(tm => {
                var attendedCount = matchPolls.Count(mp => mp.PlayerId == tm.PlayerId);
                var rate = totalTeamMatches > 0 ? (int)Math.Round((double)attendedCount / totalTeamMatches * 100) : 0;
                return new
                {
                    tm.PlayerId,
                    tm.Player!.FullName,
                    tm.Player.Username,
                    tm.Player.Phone,
                    tm.RoleInTeam,
                    tm.JoinedDate,
                    tm.Status,
                    ParticipationRate = rate
                };
            }).ToList();

            return Ok(result);
        }

        [HttpGet("JoinRequests")]
        public async Task<IActionResult> GetJoinRequests()
        {
            var team = await GetMyTeamAsync();
            if (team == null) return NotFound(new { message = "Team not found." });

            var requests = await _context.JoinRequests
                .Include(r => r.Player)
                .Where(r => r.TeamId == team.TeamId && r.Status == "Pending")
                .Select(r => new
                {
                    r.RequestId,
                    r.PlayerId,
                    r.Player!.FullName,
                    r.Player.Username,
                    r.Status,
                    r.RequestType,
                    r.CreatedAt
                })
                .ToListAsync();

            return Ok(requests);
        }

        [HttpPost("AcceptMember/{requestId}")]
        public async Task<IActionResult> AcceptMember(int requestId)
        {
            var team = await GetMyTeamAsync();
            if (team == null) return NotFound(new { message = "Team not found." });

            var request = await _context.JoinRequests
                .FirstOrDefaultAsync(r => r.TeamId == team.TeamId && r.RequestId == requestId && r.Status == "Pending");

            if (request == null)
            {
                return NotFound(new { message = "Pending join request not found." });
            }

            // Add to team members
            var teamMember = new TeamMember
            {
                TeamId = team.TeamId,
                PlayerId = request.PlayerId,
                JoinedDate = DateTime.Now,
                RoleInTeam = "Member",
                Status = "Active"
            };

            _context.TeamMembers.Add(teamMember);

            // Update request
            request.Status = "Accepted";
            request.ProcessedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Member accepted successfully." });
        }

        [HttpPost("RejectMember/{requestId}")]
        public async Task<IActionResult> RejectMember(int requestId)
        {
            var team = await GetMyTeamAsync();
            if (team == null) return NotFound(new { message = "Team not found." });

            var request = await _context.JoinRequests
                .FirstOrDefaultAsync(r => r.TeamId == team.TeamId && r.RequestId == requestId && r.Status == "Pending");

            if (request == null)
            {
                return NotFound(new { message = "Pending join request not found." });
            }

            request.Status = "Rejected";
            request.ProcessedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Member rejected successfully." });
        }

        [HttpGet("Posts")]
        public async Task<IActionResult> GetPosts()
        {
            var team = await GetMyTeamAsync();
            if (team == null) return Ok(new System.Collections.Generic.List<object>());

            var posts = await _context.Posts
                .Where(p => p.TeamId == team.TeamId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.PostId,
                    p.Title,
                    p.Content,
                    p.PostType,
                    p.ImageUrls,
                    p.MatchId,
                    p.CreatedAt,
                    p.UpdatedAt
                })
                .ToListAsync();

            return Ok(posts);
        }

        [HttpPost("Posts")]
        public async Task<IActionResult> CreatePost([FromBody] PostDto dto)
        {
            var team = await GetMyTeamAsync();
            if (team == null) return BadRequest(new { message = "Bạn cần tạo đội bóng trước khi đăng bài." });

            // Check Quota for Recruitment posts
            var postType = dto.PostType ?? "Recruitment";
            if (postType == "Recruitment" && !team.IsSubscriptionActive)
            {
                var thisMonthPosts = await _context.Posts
                    .Where(p => p.TeamId == team.TeamId 
                             && p.PostType == "Recruitment"
                             && p.CreatedAt.Month == DateTime.Now.Month 
                             && p.CreatedAt.Year == DateTime.Now.Year)
                    .CountAsync();

                if (thisMonthPosts >= 2)
                {
                    return BadRequest(new { 
                        message = "Đội bóng của bạn đã dùng hết 2 lượt Đăng bài Tìm Đối/Người miễn phí trong tháng này. Vui lòng nâng cấp Team Pro.",
                        requiresPayment = true,
                        paymentType = "TeamPro",
                        price = 120000
                    });
                }
            }

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdStr, out int userId);

            var post = new Post
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

            return CreatedAtAction(nameof(GetPosts), new { id = post.PostId }, post);
        }

        // --- MATCH MANAGEMENT ---

        [HttpGet("Matches")]
        public async Task<IActionResult> GetMatches()
        {
            var team = await GetMyTeamAsync();
            if (team == null) return Ok(new System.Collections.Generic.List<object>());

            var matches = await _context.Matches
                .Include(m => m.HomeTeam)
                .Include(m => m.AwayTeam)
                .Include(m => m.Schedule)
                .Where(m => m.HomeTeamId == team.TeamId || m.AwayTeamId == team.TeamId)
                .Select(m => new
                {
                    m.MatchId,
                    m.MatchType,
                    m.MatchStatus,
                    OpponentName = m.HomeTeamId == team.TeamId ? (m.AwayTeam != null ? m.AwayTeam.TeamName : null) : (m.HomeTeam != null ? m.HomeTeam.TeamName : null),
                    m.HomeScore,
                    m.AwayScore,
                    m.HomeConfirmed,
                    m.AwayConfirmed,
                    m.ScheduleId,
                    ScheduleStartTime = m.Schedule != null ? m.Schedule.StartTime : (DateTime?)null,
                    ScheduleEndTime = m.Schedule != null ? m.Schedule.EndTime : (DateTime?)null
                })
                .ToListAsync();

            return Ok(matches);
        }

        [HttpGet("Matches/{id}/Attendance")]
        public async Task<IActionResult> GetMatchAttendance(int id)
        {
            var team = await GetMyTeamAsync();
            if (team == null) return NotFound(new { message = "Team not found." });

            var match = await _context.Matches.FindAsync(id);
            if (match == null) return NotFound(new { message = "Match not found." });

            if (match.HomeTeamId != team.TeamId && match.AwayTeamId != team.TeamId)
                return Forbid();

            var teamMembers = await _context.TeamMembers
                .Include(tm => tm.Player)
                .Where(tm => tm.TeamId == team.TeamId && tm.Status == "Active")
                .ToListAsync();

            var polls = await _context.MatchPolls
                .Where(mp => mp.MatchId == id)
                .ToListAsync();

            var attendance = teamMembers.Select(tm => {
                var poll = polls.FirstOrDefault(p => p.PlayerId == tm.PlayerId);
                return new
                {
                    tm.PlayerId,
                    PlayerName = tm.Player?.FullName ?? tm.Player?.Username,
                    IsAttending = poll?.IsAttending,
                    RoleInTeam = tm.RoleInTeam,
                    MatchStatus = match.MatchStatus
                };
            }).ToList();

            var attendingCount = attendance.Count(a => a.IsAttending == true);
            var notAttendingCount = attendance.Count(a => a.IsAttending == false);
            var notVotedCount = attendance.Count(a => a.IsAttending == null);

            return Ok(new
            {
                MatchId = id,
                Summary = new { Attending = attendingCount, NotAttending = notAttendingCount, NotVoted = notVotedCount },
                Attendance = attendance
            });
        }

        [HttpPost("Matches/{id}/ExternalPitch")]
        public async Task<IActionResult> MarkAsExternalPitch(int id)
        {
            var team = await GetMyTeamAsync();
            if (team == null) return NotFound(new { message = "Team not found." });

            var match = await _context.Matches.FindAsync(id);
            if (match == null) return NotFound(new { message = "Match not found." });

            if (match.HomeTeamId != team.TeamId && match.AwayTeamId != team.TeamId)
                return Forbid();

            // Set a special status or simply leave it Accepted but indicate it has a pitch.
            // Since we don't have an ExternalPitch flag, we can update MatchStatus to a custom string if needed,
            // or just use "Accepted" and add a Note. For now, let's update MatchStatus to "ExternalBooked".
            match.MatchStatus = "ExternalBooked";

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã cập nhật sân ngoài thành công." });
        }

        [HttpPut("Matches/{id}/Score")]
        public async Task<IActionResult> UpdateScore(int id, [FromBody] ScoreDto dto)
        {
            var team = await GetMyTeamAsync();
            if (team == null) return NotFound(new { message = "Team not found." });

            var match = await _context.Matches.FindAsync(id);
            if (match == null) return NotFound(new { message = "Match not found." });

            if (match.HomeTeamId != team.TeamId && match.AwayTeamId != team.TeamId)
                return Forbid();

            match.HomeScore = dto.HomeScore;
            match.AwayScore = dto.AwayScore;

            match.HomeConfirmed = false;
            match.AwayConfirmed = false;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Score updated successfully." });
        }

        [HttpPost("Matches/{id}/ConfirmResult")]
        public async Task<IActionResult> ConfirmResult(int id)
        {
            var team = await GetMyTeamAsync();
            if (team == null) return NotFound(new { message = "Team not found." });

            var match = await _context.Matches.FindAsync(id);
            if (match == null) return NotFound(new { message = "Match not found." });

            if (match.HomeTeamId == team.TeamId)
            {
                match.HomeConfirmed = true;
            }
            else if (match.AwayTeamId == team.TeamId)
            {
                match.AwayConfirmed = true;
            }
            else
            {
                return Forbid();
            }

            if (match.HomeConfirmed == true && match.AwayConfirmed == true)
            {
                match.MatchStatus = "Completed";
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Result confirmed." });
        }

        [HttpPost("Matches/{id}/Cancel")]
        public async Task<IActionResult> CancelMatch(int id, [FromBody] CancelDto dto)
        {
            var team = await GetMyTeamAsync();
            if (team == null) return NotFound(new { message = "Team not found." });

            var match = await _context.Matches.FindAsync(id);
            if (match == null) return NotFound(new { message = "Match not found." });

            if (match.HomeTeamId != team.TeamId && match.AwayTeamId != team.TeamId)
                return Forbid();

            match.MatchStatus = "Cancelled";
            match.CancelRequestedBy = team.TeamId;
            match.CancelReason = dto.Reason;

            var allPlayersToNotify = await _context.TeamMembers
                .Where(tm => (tm.TeamId == match.HomeTeamId || tm.TeamId == match.AwayTeamId) && tm.Status == "Active")
                .Select(tm => tm.PlayerId)
                .Distinct()
                .ToListAsync();

            foreach(var pId in allPlayersToNotify)
            {
                var notification = new Notification
                {
                    UserId = pId,
                    Title = "Trận đấu bị hủy",
                    Message = $"Trận đấu đã bị hủy bởi đội {team.TeamName}. Lý do: {dto.Reason}",
                    IsRead = false,
                    CreatedAt = DateTime.Now
                };
                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Match cancelled." });
        }

        // --- OPPONENT MATCHING ---

        [HttpPost("CreateChallenge")]
        public async Task<IActionResult> CreateChallenge([FromBody] ChallengeDto dto)
        {
            var team = await GetMyTeamAsync();
            if (team == null) return NotFound(new { message = "Team not found." });

            // Check Quota cho team (Đã vô hiệu hóa theo yêu cầu)
            /*
            if (!team.IsSubscriptionActive)
            {
                var thisMonthChallenges = await _context.Matches
                    .Where(m => m.HomeTeamId == team.TeamId 
                             && m.MatchType == "Challenge"
                             && m.ExpiresAt != null 
                             && m.ExpiresAt.Value.Month == DateTime.Now.Month 
                             && m.ExpiresAt.Value.Year == DateTime.Now.Year)
                    .CountAsync();

                if (thisMonthChallenges >= 2)
                {
                    return BadRequest(new { 
                        message = "Đội bóng của bạn đã dùng hết 2 lượt tạo Thách đấu miễn phí trong tháng này. Vui lòng nâng cấp Team Pro.",
                        requiresPayment = true,
                        paymentType = "TeamPro",
                        price = 120000
                    });
                }
            }
            */

            var match = new Match
            {
                HomeTeamId = team.TeamId,
                MatchStatus = "LookingForOpponent",
                MatchType = "Challenge",
                ExpiresAt = DateTime.Now.AddDays(7),
                MatchDate = dto.MatchDate,
                StartTime = dto.StartTime,
                Location = dto.Location,
                Notes = dto.Notes
            };

            _context.Matches.Add(match);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Challenge created.", matchId = match.MatchId });
        }

        [HttpGet("ChallengeRequests")]
        public async Task<IActionResult> GetChallengeRequests()
        {
            var team = await GetMyTeamAsync();
            if (team == null) return NotFound(new { message = "Team not found." });

            var requests = await _context.Matches
                .Include(m => m.HomeTeam)
                .Where(m => m.MatchStatus == "LookingForOpponent" && m.HomeTeamId != team.TeamId)
                .Select(m => new
        {
                    m.MatchId,
                    HomeTeam = m.HomeTeam != null ? m.HomeTeam.TeamName : null,
                    m.MatchStatus,
                    m.MatchType
                })
                .ToListAsync();

            return Ok(requests);
        }

        [HttpPost("AcceptChallenge/{matchId}")]
        public async Task<IActionResult> AcceptChallenge(int matchId)
        {
            try
            {
                var team = await GetMyTeamAsync();
                if (team == null) return NotFound(new { message = "Team not found." });

                var match = await _context.Matches.FindAsync(matchId);
                if (match == null) return NotFound(new { message = "Match not found." });

                if (match.MatchStatus != "LookingForOpponent")
                    return BadRequest(new { message = "Match is not looking for an opponent." });

                if (match.HomeTeamId == team.TeamId)
                    return BadRequest(new { message = "Cannot accept your own challenge." });

                match.AwayTeamId = team.TeamId;
                match.MatchStatus = "Accepted";

                await _context.SaveChangesAsync();

                // Broadcast to HomeTeam Captain
                if (match.HomeTeamId != null)
                {
                    var homeTeam = await _context.Teams.FindAsync(match.HomeTeamId.Value);
                    if (homeTeam != null && homeTeam.CaptainId > 0)
                    {
                        var notification = new Notification
                        {
                            UserId = homeTeam.CaptainId,
                            Title = "Kèo đã được nhận",
                            Message = $"Đội {team.TeamName} đã nhận kèo thách đấu của bạn!",
                            IsRead = false,
                            CreatedAt = DateTime.Now
                        };
                        _context.Notifications.Add(notification);
                        await _context.SaveChangesAsync();

                        var connectionId = FInd_Op_Web.Hubs.NotificationHub.GetConnectionIdForUser(homeTeam.CaptainId.ToString());
                        if (!string.IsNullOrEmpty(connectionId))
                        {
                            await _hubContext.Clients.Client(connectionId).SendAsync("ReceiveNotification", notification.Message);
                        }
                    }
                }

                return Ok(new { message = "Challenge accepted.", matchId = match.MatchId });
            }
            catch (Exception ex)
            {
                // Temporarily return exception details for debugging
                return StatusCode(500, new { message = ex.Message, inner = ex.InnerException?.Message, stack = ex.StackTrace });
            }
        }

        // --- OPPONENT RATING & RANKING ---

        [HttpPost("RateOpponent")]
        public async Task<IActionResult> RateOpponent([FromBody] RateOpponentDto dto)
        {
            var team = await GetMyTeamAsync();
            if (team == null) return NotFound(new { message = "Team not found." });

            var match = await _context.Matches.FindAsync(dto.MatchId);
            if (match == null) return NotFound(new { message = "Match not found." });

            if (match.MatchStatus != "Completed")
                return BadRequest(new { message = "Can only rate after match is completed." });

            int ratedTeamId = match.HomeTeamId == team.TeamId ? (int)match.AwayTeamId! : (int)match.HomeTeamId!;

            // Check if already rated
            var existingRating = await _context.TeamRatings.FirstOrDefaultAsync(r => r.MatchId == dto.MatchId && r.ReviewerTeamId == team.TeamId);
            if (existingRating != null)
                return BadRequest(new { message = "You have already rated the opponent for this match." });

            var rating = new TeamRating
            {
                MatchId = dto.MatchId,
                ReviewerTeamId = team.TeamId,
                RatedTeamId = ratedTeamId,
                Score = dto.Score,
                Comment = dto.Comment,
                CreatedAt = DateTime.Now
            };

            _context.TeamRatings.Add(rating);

            // Update RankingScore
            var ratedTeam = await _context.Teams.FindAsync(ratedTeamId);
            if (ratedTeam != null)
            {
                // Simple logic: +10 for 5*, +5 for 4*, 0 for 3*, -5 for 2*, -10 for 1*
                int pointChange = 0;
                switch(dto.Score)
                {
                    case 5: pointChange = 10; break;
                    case 4: pointChange = 5; break;
                    case 3: pointChange = 0; break;
                    case 2: pointChange = -5; break;
                    case 1: pointChange = -10; break;
                }
                ratedTeam.RankingScore += pointChange;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Opponent rated successfully." });
        }

        [HttpGet("TeamRankings")]
        public async Task<IActionResult> GetTeamRankings()
        {
            var teams = await _context.Teams
                .OrderByDescending(t => t.RankingScore)
                .Select(t => new { t.TeamId, t.TeamName, t.RankingScore, t.HomeArea, SportName = t.Sport != null ? t.Sport.SportName : null })
                .Take(50)
                .ToListAsync();

            return Ok(teams);
        }

        // --- MATCH CHAT ---

        [HttpGet("Matches/{id}/Chats")]
        public async Task<IActionResult> GetMatchChats(int id)
        {
            var team = await GetMyTeamAsync();
            if (team == null) return NotFound(new { message = "Team not found." });

            var match = await _context.Matches.FindAsync(id);
            if (match == null) return NotFound(new { message = "Match not found." });

            if (match.HomeTeamId != team.TeamId && match.AwayTeamId != team.TeamId)
                return Forbid();

            var chats = await _context.MatchChats
                .Where(c => c.MatchId == id)
                .OrderBy(c => c.SentAt)
                .Select(c => new
                {
                    c.ChatId,
                    c.MatchId,
                    c.SenderTeamId,
                    c.EncryptedMessage,
                    c.SentAt
                })
                .ToListAsync();

            return Ok(chats);
        }

        // --- TOURNAMENT MANAGEMENT ---

        [HttpPost("CreateTournament")]
        public async Task<IActionResult> CreateTournament([FromBody] TournamentCreateDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "User not found." });

            if (dto.EntryFee > 0)
            {
                // TODO: Gọi PayOS API để tạo link thanh toán, ở đây lưu trạng thái Pending
                var tx = new PaymentTransaction
                {
                    UserId = userId,
                    Amount = (int)dto.EntryFee,
                    OrderCode = DateTime.Now.Ticks,
                    TransactionType = "TournamentFee",
                    Status = "Completed", // Demo: mặc định Completed luôn
                    CreatedAt = DateTime.Now,
                    Description = $"Phí tạo giải đấu: {dto.Name}"
                };
                _context.PaymentTransactions.Add(tx);
            }

            var tournament = new Tournament
            {
                TournamentName = dto.Name,
                Format = dto.Format,
                EntryFee = dto.EntryFee,
                OrganizerId = userId,
                Status = "Upcoming",
                CreatedAt = DateTime.Now,
                IsFeePaid = dto.EntryFee > 0,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                SportId = dto.SportId,
                Description = $"Cơ chế: {dto.AssignmentType}, Max đội: {dto.MaxTeams}" + (!string.IsNullOrEmpty(dto.Stadium) ? $", Sân dự kiến: {dto.Stadium}" : "")
            };

            _context.Tournaments.Add(tournament);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tạo giải đấu thành công.", tournamentId = tournament.TournamentId });
        }

        [HttpGet("Tournaments")]
        public async Task<IActionResult> GetMyTournaments()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            var tournaments = await _context.Tournaments
                .Where(t => t.OrganizerId == userId)
                .Select(t => new
                {
                    id = t.TournamentId,
                    name = t.TournamentName,
                    format = t.Format,
                    status = t.Status,
                    fee = t.EntryFee ?? 0,
                    teams = 0 // Tạm thời
                })
                .OrderByDescending(t => t.id)
                .ToListAsync();

            return Ok(tournaments);
        }

        [HttpGet("TournamentSettings/{id}")]
        public async Task<IActionResult> GetTournamentSettings(int id)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdStr, out int userId);

            var tournament = await _context.Tournaments.FirstOrDefaultAsync(t => t.TournamentId == id && t.OrganizerId == userId);
            if (tournament == null) return NotFound(new { message = "Tournament not found." });

            string sportName = "Bóng đá";
            if (tournament.SportId != null)
            {
                var sport = await _context.Sports.FindAsync(tournament.SportId);
                sportName = sport?.SportName ?? sportName;
            }

            int maxTeams = 16;
            string scope = "Internal";
            string stadium = "";
            if (!string.IsNullOrEmpty(tournament.Description))
            {
                // Simple parsing
                if (tournament.Description.Contains("Max đội: "))
                {
                    var maxTeamStr = tournament.Description.Split("Max đội: ")[1].Split(",")[0];
                    int.TryParse(maxTeamStr, out maxTeams);
                }
                if (tournament.Description.Contains("MaxTeams: "))
                {
                    var parts = tournament.Description.Split(new[] { "MaxTeams: " }, StringSplitOptions.None);
                    if (parts.Length > 1 && int.TryParse(parts[1].Trim(), out int max)) maxTeams = max;
                }
                if (tournament.Description.Contains("Sân dự kiến: "))
                {
                    stadium = tournament.Description.Split("Sân dự kiến: ")[1];
                }
                if (tournament.Description.Contains("Stadium: "))
                {
                    var stStart = tournament.Description.IndexOf("Stadium: ") + 9;
                    var stEnd = tournament.Description.IndexOf(", MaxTeams");
                    if (stEnd > stStart) stadium = tournament.Description.Substring(stStart, stEnd - stStart);
                }
                if (tournament.Description.Contains("Scope: Public")) scope = "Public";
            }

            return Ok(new TournamentSettingsDto
            {
                Name = tournament.TournamentName,
                Sport = sportName,
                Stadium = stadium,
                Format = tournament.Format ?? "League",
                Scope = scope,
                MaxTeams = maxTeams,
                StartDate = tournament.StartDate,
                EndDate = tournament.EndDate
            });
        }

        [HttpPut("TournamentSettings/{id}")]
        public async Task<IActionResult> UpdateTournamentSettings(int id, [FromBody] TournamentSettingsDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdStr, out int userId);

            var tournament = await _context.Tournaments.FirstOrDefaultAsync(t => t.TournamentId == id && t.OrganizerId == userId);
            if (tournament == null) return NotFound(new { message = "Tournament not found." });

            tournament.TournamentName = dto.Name;
            tournament.Format = dto.Format;
            tournament.StartDate = dto.StartDate;
            tournament.EndDate = dto.EndDate;
            tournament.Description = $"Sport: {dto.Sport}, Scope: {dto.Scope}, Stadium: {dto.Stadium}, MaxTeams: {dto.MaxTeams}";
            
            await _context.SaveChangesAsync();
            return Ok(new { message = "Settings updated." });
        }

        [HttpGet("Tournaments/{id}/Teams")]
        public async Task<IActionResult> GetTournamentTeams(int id)
        {
            var teams = await _context.TournamentTeams
                .Include(tt => tt.Team)
                .Where(tt => tt.TournamentId == id)
                .Select(tt => new
                {
                    id = tt.TeamId,
                    name = tt.Team!.TeamName,
                    logo = tt.Team.LogoUrl,
                    status = tt.Status,
                    abbr = tt.Team.TeamName.Substring(0, Math.Min(3, tt.Team.TeamName.Length)).ToUpper()
                })
                .ToListAsync();
            return Ok(teams);
        }

        [HttpPost("Tournaments/{id}/AddTeam")]
        public async Task<IActionResult> AddTeamToTournament(int id, [FromBody] TournamentAddTeamDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdStr, out int userId);

            var tournament = await _context.Tournaments.FirstOrDefaultAsync(t => t.TournamentId == id && t.OrganizerId == userId);
            if (tournament == null) return NotFound(new { message = "Tournament not found." });

            int teamIdToAdd = 0;
            if (dto.TeamId.HasValue)
            {
                teamIdToAdd = dto.TeamId.Value;
            }
            else
            {
                var newTeam = new Team
                {
                    TeamName = dto.Name ?? "No Name",
                    CaptainId = userId,
                    CreatedAt = DateTime.Now,
                    FoundedDate = DateTime.Now,
                    IsDisbanded = false,
                    LookingForOpponent = false
                };
                _context.Teams.Add(newTeam);
                await _context.SaveChangesAsync();
                teamIdToAdd = newTeam.TeamId;
            }

            if (!await _context.TournamentTeams.AnyAsync(tt => tt.TournamentId == id && tt.TeamId == teamIdToAdd))
            {
                _context.TournamentTeams.Add(new TournamentTeam
                {
                    TournamentId = id,
                    TeamId = teamIdToAdd,
                    Status = "Approved",
                    RegistrationDate = DateTime.Now
                });
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Team added to tournament." });
        }

        [HttpPost("Tournaments/{id}/AcceptTeam/{teamId}")]
        public async Task<IActionResult> AcceptTournamentTeam(int id, int teamId)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdStr, out int userId);
            var tournament = await _context.Tournaments.FirstOrDefaultAsync(t => t.TournamentId == id && t.OrganizerId == userId);
            if (tournament == null) return NotFound(new { message = "Tournament not found or unauthorized." });

            var tt = await _context.TournamentTeams.FirstOrDefaultAsync(x => x.TournamentId == id && x.TeamId == teamId);
            if (tt == null) return NotFound(new { message = "Team registration not found." });

            tt.Status = "Approved";
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã duyệt đội vào giải." });
        }

        [HttpPost("Tournaments/{id}/RejectTeam/{teamId}")]
        public async Task<IActionResult> RejectTournamentTeam(int id, int teamId)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdStr, out int userId);
            var tournament = await _context.Tournaments.FirstOrDefaultAsync(t => t.TournamentId == id && t.OrganizerId == userId);
            if (tournament == null) return NotFound(new { message = "Tournament not found or unauthorized." });

            var tt = await _context.TournamentTeams.FirstOrDefaultAsync(x => x.TournamentId == id && x.TeamId == teamId);
            if (tt == null) return NotFound(new { message = "Team registration not found." });

            _context.TournamentTeams.Remove(tt);
            
            var players = _context.TournamentTeamPlayers.Where(p => p.TournamentId == id && p.TeamId == teamId);
            _context.TournamentTeamPlayers.RemoveRange(players);

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã từ chối và xóa yêu cầu." });
        }

        [HttpPost("Tournaments/{id}/Register")]
        public async Task<IActionResult> RegisterTournament(int id, [FromBody] RegisterTournamentDto dto)
        {
            var team = await GetMyTeamAsync();
            if (team == null) return NotFound(new { message = "Bạn cần có đội bóng để đăng ký giải." });

            var tournament = await _context.Tournaments.FindAsync(id);
            if (tournament == null) return NotFound(new { message = "Tournament not found." });

            if (!dto.NoBettingCommitment) return BadRequest(new { message = "Bạn phải cam kết chơi bóng đá không cá độ." });

            if (tournament.MaxPlayersPerTeam.HasValue && dto.PlayerIds != null && dto.PlayerIds.Count > tournament.MaxPlayersPerTeam.Value)
            {
                return BadRequest(new { message = $"Số lượng cầu thủ vượt quá giới hạn ({tournament.MaxPlayersPerTeam.Value} người)." });
            }

            if (await _context.TournamentTeams.AnyAsync(tt => tt.TournamentId == id && tt.TeamId == team.TeamId))
            {
                return BadRequest(new { message = "Đội của bạn đã đăng ký giải đấu này rồi." });
            }

            var tt = new TournamentTeam
            {
                TournamentId = id,
                TeamId = team.TeamId,
                Status = "Pending",
                RegistrationDate = DateTime.Now,
                NoBettingCommitment = dto.NoBettingCommitment
            };

            _context.TournamentTeams.Add(tt);

            if (dto.PlayerIds != null && dto.PlayerIds.Any())
            {
                foreach (var playerId in dto.PlayerIds)
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

            return Ok(new { message = "Đã gửi yêu cầu đăng ký giải đấu thành công!" });
        }


        [HttpGet("Tournaments/{id}/Bracket")]
        public async Task<IActionResult> GetTournamentBracket(int id)
        {
            var tournament = await _context.Tournaments.FindAsync(id);
            if (tournament == null) return NotFound();

            // Return mock bracket structure if not saved yet
            return Ok(new { format = tournament.Format, rounds = new object[] { } });
        }


        [HttpPut("Tournaments/Match/{matchId}")]
        public async Task<IActionResult> UpdateTournamentMatch(int matchId, [FromBody] UpdateTournamentMatchDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdStr, out int userId);
            
            var match = await _context.Matches
                .Include(m => m.Tournament)
                .FirstOrDefaultAsync(m => m.MatchId == matchId);

            if (match == null) return NotFound(new { message = "Không tìm thấy trận đấu" });
            if (match.Tournament == null || match.Tournament.OrganizerId != userId)
                return Unauthorized(new { message = "Bạn không có quyền chỉnh sửa trận đấu của giải này" });

            match.MatchDate = dto.MatchDate;
            match.StartTime = dto.StartTime;
            match.EndTime = dto.EndTime;
            if (dto.HomeScore.HasValue) match.HomeScore = dto.HomeScore.Value;
            if (dto.AwayScore.HasValue) match.AwayScore = dto.AwayScore.Value;
            if (!string.IsNullOrEmpty(dto.MatchStatus)) match.MatchStatus = dto.MatchStatus;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật trận đấu thành công" });
        }

        [HttpGet("Tournaments/{id}/Matches")]
        public async Task<IActionResult> GetTournamentMatches(int id)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdStr, out int userId);
            
            var matches = await _context.Matches
                .Include(m => m.HomeTeam)
                .Include(m => m.AwayTeam)
                .Where(m => m.TournamentId == id && m.Tournament.OrganizerId == userId)
                .Select(m => new {
                    m.MatchId,
                    m.HomeTeamId,
                    HomeTeamName = m.HomeTeam != null ? m.HomeTeam.TeamName : "N/A",
                    m.AwayTeamId,
                    AwayTeamName = m.AwayTeam != null ? m.AwayTeam.TeamName : "N/A",
                    m.HomeScore,
                    m.AwayScore,
                    m.MatchStatus,
                    m.MatchDate,
                    m.StartTime,
                    m.EndTime,
                    m.TournamentStage
                })
                .ToListAsync();
            return Ok(matches);
        }

        [HttpPut("Tournaments/{id}/SwissMatches")]
        public async Task<IActionResult> UpdateSwissMatches(int id, [FromBody] object payload)
        {
            // Dummy endpoint since bracket is not fully modeled in DB
            return Ok(new { message = "Swiss matches updated." });
        }

        // --- STADIUM BOOKING ---

        [HttpGet("Stadiums")]
        public async Task<IActionResult> GetStadiums()
        {
            var stadiums = await _context.Stadiums
                .Include(s => s.Pitches)
                .Select(s => new
                {
                    s.StadiumId,
                    s.StadiumName,
                    s.Address,
                    s.Hotline,
                    Pitches = s.Pitches.Select(p => new { p.PitchId, p.PitchName, p.PitchSize, p.PricePerHour })
                })
                .ToListAsync();

            return Ok(stadiums);
        }

        [HttpGet("Stadiums/{id}")]
        public async Task<IActionResult> GetStadiumDetails(int id)
        {
            var stadium = await _context.Stadiums
                .Include(s => s.Pitches)
                .Select(s => new
                {
                    s.StadiumId,
                    s.StadiumName,
                    s.Address,
                    s.Hotline,
                    s.Description,
                    s.OwnerId,
                    Pitches = s.Pitches.Select(p => new { p.PitchId, p.PitchName, p.PitchSize, p.PricePerHour, p.GrassType })
                })
                .FirstOrDefaultAsync(s => s.StadiumId == id);

            if (stadium == null) return NotFound(new { message = "Stadium not found." });
            return Ok(stadium);
        }

        [HttpGet("Pitches/{pitchId}/Calendar")]
        public async Task<IActionResult> GetPitchCalendar(int pitchId, [FromQuery] DateTime date)
        {
            var startOfDay = date.Date;
            var endOfDay = startOfDay.AddDays(1).AddTicks(-1);

            var schedules = await _context.PitchSchedules
                .Where(ps => ps.PitchId == pitchId && ps.StartTime >= startOfDay && ps.EndTime <= endOfDay)
                .Select(ps => new
                {
                    ps.ScheduleId,
                    ps.StartTime,
                    ps.EndTime,
                    ps.ScheduleStatus, // Booked, PendingPayment, Locked
                    ps.LockedUntil
                })
                .ToListAsync();

            return Ok(schedules);
        }

        [HttpPost("BookPitch")]
        public async Task<IActionResult> BookPitch([FromBody] BookPitchDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            var team = await GetMyTeamAsync();

            // Check concurrency / overlaps
            var overlapping = await _context.PitchSchedules
                .Where(ps => ps.PitchId == dto.PitchId 
                          && ps.StartTime < dto.EndTime 
                          && ps.EndTime > dto.StartTime
                          && (ps.ScheduleStatus == "Booked" || ps.ScheduleStatus == "Confirmed" || (ps.LockedUntil != null && ps.LockedUntil > DateTime.Now)))
                .AnyAsync();

            if (overlapping)
            {
                return BadRequest(new { message = "Khung giờ này đã có người đặt hoặc đang trong quá trình thanh toán chờ." });
            }

            var pitchSchedule = new PitchSchedule
            {
                PitchId = dto.PitchId,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                ScheduleStatus = "PendingPayment", // Will be Booked/Confirmed after PayOS payment
                LockedUntil = DateTime.Now.AddMinutes(10), // Lock for 10 mins
                BookedById = userId
            };

            _context.PitchSchedules.Add(pitchSchedule);
            await _context.SaveChangesAsync();

            // Link to match if provided
            if (dto.MatchId.HasValue)
            {
                var match = await _context.Matches.FindAsync(dto.MatchId.Value);
                if (match != null && (match.HomeTeamId == team?.TeamId || match.AwayTeamId == team?.TeamId))
                {
                    match.ScheduleId = pitchSchedule.ScheduleId;
                    match.MatchStatus = "Scheduled"; // Scheduled on system
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(new { 
                message = "Pitch reserved. Please proceed to payment within 10 minutes.", 
                scheduleId = pitchSchedule.ScheduleId,
                paymentRequired = true,
                paymentType = "BookingDeposit"
            });
        }

        [HttpPost("CreateRecruitment")]
        public async Task<IActionResult> CreateRecruitment([FromBody] RecruitmentDto dto)
        {
            try
            {
                var team = await GetMyTeamAsync();
                if (team == null) return NotFound(new { message = "Bạn chưa có đội." });

                var ad = new RecruitmentAd
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
                return Ok(new { message = "Tạo tuyển quân thành công", id = ad.AdId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi tạo bài tuyển dụng: " + ex.Message, details = ex.StackTrace });
            }
        }
 
        // --- MATCH REQUESTS ---

        [HttpPost("Matches/{id}/Request")]
        public async Task<IActionResult> RequestToJoinMatch(int id, [FromBody] MatchRequestDto dto)
        {
            var team = await GetMyTeamAsync();
            if (team == null) return Unauthorized(new { message = "Bạn không phải là đội trưởng." });

            var match = await _context.Matches.FindAsync(id);
            if (match == null) return NotFound(new { message = "Không tìm thấy trận đấu." });

            if (match.HomeTeamId == team.TeamId) return BadRequest(new { message = "Đây là trận đấu của đội bạn." });
            if (match.AwayTeamId != null) return BadRequest(new { message = "Trận đấu đã có đội khách." });

            var existingReq = await _context.MatchRequests.FirstOrDefaultAsync(r => r.MatchId == id && r.RequestingTeamId == team.TeamId && r.Status == "Pending");
            if (existingReq != null) return BadRequest(new { message = "Bạn đã gửi yêu cầu cho trận đấu này rồi." });

            var req = new MatchRequest
            {
                MatchId = id,
                RequestingTeamId = team.TeamId,
                Message = dto.Message,
                Status = "Pending"
            };

            _context.MatchRequests.Add(req);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã gửi yêu cầu bắt kèo thành công." });
        }

        [HttpGet("MatchRequests")]
        public async Task<IActionResult> GetMatchRequests()
        {
            try
            {
                var team = await GetMyTeamAsync();
                if (team == null) return Unauthorized();

                var requests = await _context.MatchRequests
                    .Include(r => r.Match)
                    .Include(r => r.RequestingTeam)
                    .Where(r => r.Match != null && r.Match.HomeTeamId == team.TeamId && r.Status == "Pending")
                    .ToListAsync();

                var result = requests.Select(r => new
                {
                    r.RequestId,
                    r.MatchId,
                    r.Message,
                    r.CreatedAt,
                    MatchDate = r.Match?.MatchDate,
                    Team = r.RequestingTeam != null ? new
                    {
                        r.RequestingTeam.TeamId,
                        r.RequestingTeam.TeamName,
                        r.RequestingTeam.LogoUrl,
                        r.RequestingTeam.QualityLevel
                    } : null
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, stack = ex.StackTrace, inner = ex.InnerException?.Message });
            }
        }

        [HttpPost("MatchRequests/{id}/Accept")]
        public async Task<IActionResult> AcceptMatchRequest(int id)
        {
            var team = await GetMyTeamAsync();
            if (team == null) return Unauthorized();

            var req = await _context.MatchRequests.Include(r => r.Match).FirstOrDefaultAsync(r => r.RequestId == id);
            if (req == null) return NotFound();

            if (req.Match!.HomeTeamId != team.TeamId) return Unauthorized();
            if (req.Match.AwayTeamId != null) return BadRequest(new { message = "Trận đấu đã có đội khách." });

            req.Status = "Accepted";
            req.Match.AwayTeamId = req.RequestingTeamId;
            req.Match.MatchStatus = "Scheduled";

            // Reject others
            var otherReqs = await _context.MatchRequests.Where(r => r.MatchId == req.MatchId && r.RequestId != id && r.Status == "Pending").ToListAsync();
            foreach (var r in otherReqs) r.Status = "Rejected";

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã chấp nhận kèo." });
        }

        [HttpPost("MatchRequests/{id}/Reject")]
        public async Task<IActionResult> RejectMatchRequest(int id)
        {
            var team = await GetMyTeamAsync();
            if (team == null) return Unauthorized();

            var req = await _context.MatchRequests.Include(r => r.Match).FirstOrDefaultAsync(r => r.RequestId == id);
            if (req == null) return NotFound();

            if (req.Match!.HomeTeamId != team.TeamId) return Unauthorized();

            req.Status = "Rejected";
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã từ chối kèo." });
        }

    }










}

