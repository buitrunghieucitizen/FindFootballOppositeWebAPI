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
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Collections.Generic;

namespace FInd_Op_Web.Controllers
{



    [Authorize(Roles = "Player,Captain")]
    [ApiController]
    [Route("api/[controller]")]
    public class PlayerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<FInd_Op_Web.Hubs.NotificationHub> _hubContext;
        private readonly IConfiguration _configuration;

        public PlayerController(ApplicationDbContext context, IHubContext<FInd_Op_Web.Hubs.NotificationHub> hubContext, IConfiguration configuration)
        {
            _context = context;
            _hubContext = hubContext;
            _configuration = configuration;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        private async Task<TeamMember?> GetMyTeamAsync()
        {
            var userId = GetUserId();
            return await _context.TeamMembers
                .Include(tm => tm.Team)
                .FirstOrDefaultAsync(tm => tm.PlayerId == userId && tm.Status == "Active");
        }

        // 1. GET api/Player/MyTeam
        [HttpGet("MyTeam")]
        public async Task<IActionResult> GetMyTeam()
        {
            var userId = GetUserId();
            var teamMember = await _context.TeamMembers
                .Include(tm => tm.Team)
                .FirstOrDefaultAsync(tm => tm.PlayerId == userId && tm.Status == "Active");

            if (teamMember == null)
            {
                return NotFound(new { message = "You are not currently in any team." });
            }

            var team = await _context.Teams
                .Include(t => t.TeamMembers)
                    .ThenInclude(tm => tm.Player)
                .FirstOrDefaultAsync(t => t.TeamId == teamMember.TeamId);

            var teamId = teamMember.TeamId;
            var totalTeamMatches = await _context.Matches.CountAsync(m => m.HomeTeamId == teamId || m.AwayTeamId == teamId);
            var matchPolls = await _context.MatchPolls
                .Where(mp => mp.IsAttending == true && (mp.Match.HomeTeamId == teamId || mp.Match.AwayTeamId == teamId))
                .ToListAsync();

            var members = team?.TeamMembers.Select(tm => {
                var attendedCount = matchPolls.Count(mp => mp.PlayerId == tm.PlayerId);
                var rate = totalTeamMatches > 0 ? (int)Math.Round((double)attendedCount / totalTeamMatches * 100) : 0;
                return new {
                    tm.PlayerId,
                    PlayerName = tm.Player?.FullName ?? tm.Player?.Username,
                    tm.RoleInTeam,
                    tm.Status,
                    tm.JoinedDate,
                    ParticipationRate = rate
                };
            }).ToList();

            return Ok(new
            {
                teamMember.TeamId,
                teamMember.Team.TeamName,
                teamMember.Team.HomeArea,
                teamMember.Team.QualityLevel,
                teamMember.Team.FoundedDate,
                teamMember.Team.History,
                teamMember.RoleInTeam,
                teamMember.JoinedDate,
                Members = members
            });
        }

        [HttpGet("MyTeams")]
        public async Task<IActionResult> GetMyTeams()
        {
            var userId = GetUserId();
            var teamMembers = await _context.TeamMembers
                .Include(tm => tm.Team)
                .ThenInclude(t => t.Sport)
                .Where(tm => tm.PlayerId == userId && tm.Status == "Active")
                .ToListAsync();

            var result = teamMembers.Select(tm => new {
                tm.TeamId,
                tm.Team.TeamName,
                tm.Team.HomeArea,
                tm.Team.QualityLevel,
                tm.RoleInTeam,
                tm.JoinedDate,
                SportName = tm.Team.Sport?.SportName
            }).ToList();

            return Ok(result);
        }

        // 2. POST api/Player/LeaveTeam
        [HttpPost("LeaveTeam")]
        public async Task<IActionResult> LeaveTeam()
        {
            var userId = GetUserId();
            var teamMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.PlayerId == userId && tm.Status == "Active");

            if (teamMember == null)
            {
                return BadRequest(new { message = "You are not in a team." });
            }

            _context.TeamMembers.Remove(teamMember);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Gửi yêu cầu đánh giá thành công." });
        }

        // --- STADIUM BOOKING FOR PLAYERS (PRACTICE) ---

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
                    Pitches = s.Pitches.Select(p => new { p.PitchId, p.PitchName, p.PitchSize, p.PricePerSlot })
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
                    Pitches = s.Pitches.Select(p => new { p.PitchId, p.PitchName, p.PitchSize, p.PricePerSlot, p.GrassType })
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
                    ps.ScheduleStatus,
                    ps.LockedUntil
                })
                .ToListAsync();

            return Ok(schedules);
        }

        [HttpGet("BookingHistory")]
        public async Task<IActionResult> GetBookingHistory()
        {
            var userId = GetUserId();

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
            var userId = GetUserId();

            if (dto.StartTime < DateTime.Now || dto.EndTime <= dto.StartTime)
            {
                return BadRequest(new { message = "Thời gian đặt sân không hợp lệ (không thể đặt trong quá khứ)." });
            }

            using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
            try
            {
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

                bool isPayLater = dto.BookingType == "pay_later";
                var pitchSchedule = new PitchSchedule
                {
                    PitchId = dto.PitchId,
                    StartTime = dto.StartTime,
                    EndTime = dto.EndTime,
                    ScheduleStatus = isPayLater ? "Booked" : "PendingPayment",
                    LockedUntil = isPayLater ? null : DateTime.Now.AddMinutes(10),
                    BookedById = userId
                };

                _context.PitchSchedules.Add(pitchSchedule);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Gửi thông báo cho Chủ sân
                var pitch = await _context.Pitches.Include(p => p.Stadium).FirstOrDefaultAsync(p => p.PitchId == dto.PitchId);
                if (pitch != null && pitch.Stadium != null && isPayLater)
                {
                    int ownerId = pitch.Stadium.OwnerId ?? 0;
                    var notif = new Notification
                    {
                        UserId = ownerId,
                        Title = "Có đội đặt sân mới",
                        Message = $"Sân {pitch.PitchName} ({pitch.Stadium.StadiumName}) vừa được đặt vào lúc {dto.StartTime:HH:mm dd/MM/yyyy}. Thanh toán tại sân.",
                        CreatedAt = DateTime.Now,
                        IsRead = false
                    };
                    _context.Notifications.Add(notif);
                    await _context.SaveChangesAsync();

                    var connId = FInd_Op_Web.Hubs.NotificationHub.GetConnectionIdForUser(ownerId.ToString());
                    if (!string.IsNullOrEmpty(connId))
                    {
                        await _hubContext.Clients.Client(connId).SendAsync("ReceiveNotification", notif.Message);
                    }
                }

                if (isPayLater)
                {
                    return Ok(new { 
                        message = "Đặt sân thành công (Thanh toán tại sân).", 
                        scheduleId = pitchSchedule.ScheduleId,
                        paymentRequired = false
                    });
                }

                return Ok(new { 
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

        // 3. POST api/Player/CreateTeam
        [HttpPost("CreateTeam")]
        public async Task<IActionResult> CreateTeam([FromBody] PlayerCreateTeamDto dto)
        {
            var userId = GetUserId();

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
                QualityLevel = dto.QualityLevel,
                CaptainId = userId,
                SportId = dto.SportId,
                CreatedAt = DateTime.Now,
                FoundedDate = DateTime.Now,
                IsDisbanded = false,
                LookingForOpponent = true,
                TeamMembers = new System.Collections.Generic.List<TeamMember>
                {
                    new TeamMember
                    {
                        PlayerId = userId,
                        RoleInTeam = "Captain",
                        Status = "Active",
                        JoinedDate = DateTime.Now
                    }
                }
            };

            _context.Teams.Add(team);

            // Change the user's role from Player to Captain
            var user = await _context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.UserId == userId);
            if (user != null)
            {
                var playerRole = user.Roles.FirstOrDefault(r => r.RoleName == "Player");
                if (playerRole != null)
                {
                    user.Roles.Remove(playerRole);
                }
                var captainRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Captain");
                if (captainRole != null && !user.Roles.Any(r => r.RoleName == "Captain"))
                {
                    user.Roles.Add(captainRole);
                }
            }
            await _context.SaveChangesAsync();

            // Generate new token with Captain role
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, "Captain")
            };

            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSettings["Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: System.DateTime.UtcNow.AddDays(double.Parse(jwtSettings["ExpireDays"])),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return CreatedAtAction(nameof(GetMyTeam), new { }, new { 
                message = "Tạo đội bóng thành công. Vui lòng kiểm tra Bảng điều khiển Đội trưởng.", 
                teamId = team.TeamId,
                roleChanged = true,
                token = tokenString,
                role = "Captain"
            });
        }

        // 4. POST api/Player/RequestJoin/{teamId}
        [HttpPost("RequestJoin/{teamId}")]
        public async Task<IActionResult> RequestJoin(int teamId)
        {
            var userId = GetUserId();

            // Check if team exists
            var team = await _context.Teams.FindAsync(teamId);
            if (team == null || team.IsDisbanded == true)
            {
                return NotFound(new { message = "Team not found or is disbanded." });
            }

            // Check active teams count and sport collision
            var activeTeams = await _context.TeamMembers
                .Include(tm => tm.Team)
                .Where(tm => tm.PlayerId == userId && tm.Status == "Active")
                .ToListAsync();

            if (activeTeams.Count >= 2)
            {
                return BadRequest(new { message = "Bạn đã tham gia tối đa 2 đội thể thao." });
            }

            if (activeTeams.Any(t => t.Team != null && t.Team.SportId == team.SportId))
            {
                return BadRequest(new { message = "Bạn đã tham gia một đội thuộc môn thể thao này rồi." });
            }

            // Check for existing pending requests
            var existingRequest = await _context.JoinRequests
                .FirstOrDefaultAsync(r => r.PlayerId == userId && r.TeamId == teamId && r.Status == "Pending");

            if (existingRequest != null)
            {
                return BadRequest(new { message = "You already have a pending request for this team." });
            }

            var request = new JoinRequest
            {
                PlayerId = userId,
                TeamId = teamId,
                Status = "Pending",
                RequestType = "PlayerToTeam",
                CreatedAt = DateTime.Now
            };

            _context.JoinRequests.Add(request);
            await _context.SaveChangesAsync();

            // Broadcast via SignalR to Captain and save Notification
            if (team.CaptainId > 0)
            {
                var notification = new Notification
                {
                    UserId = team.CaptainId,
                    Title = "Yêu cầu gia nhập đội",
                    Message = $"Có người vừa xin gia nhập đội {team.TeamName} của bạn.",
                    IsRead = false,
                    CreatedAt = DateTime.Now
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                var connectionId = FInd_Op_Web.Hubs.NotificationHub.GetConnectionIdForUser(team.CaptainId.ToString());
                if (!string.IsNullOrEmpty(connectionId))
                {
                    await _hubContext.Clients.Client(connectionId).SendAsync("ReceiveNotification", notification.Message);
                }
            }

            return Ok(new { message = "Join request sent successfully." });
        }

        // 5. GET api/Player/MyRequests
        [HttpGet("MyRequests")]
        public async Task<IActionResult> GetMyRequests()
        {
            var userId = GetUserId();

            var requests = await _context.JoinRequests
                .Include(r => r.Team)
                .Where(r => r.PlayerId == userId && r.RequestType == "PlayerToTeam")
                .Select(r => new
                {
                    r.RequestId,
                    r.TeamId,
                    TeamName = r.Team != null ? r.Team.TeamName : null,
                    r.Status,
                    r.CreatedAt,
                    r.ProcessedAt
                })
                .ToListAsync();

            return Ok(requests);
        }

        // 6. GET api/Player/IncomingRequests
        [HttpGet("IncomingRequests")]
        public async Task<IActionResult> GetIncomingRequests()
        {
            var userId = GetUserId();

            var requests = await _context.JoinRequests
                .Include(r => r.Team)
                .Where(r => r.PlayerId == userId && r.RequestType == "TeamToPlayer" && r.Status == "Pending")
                .Select(r => new
                {
                    r.RequestId,
                    r.TeamId,
                    TeamName = r.Team != null ? r.Team.TeamName : null,
                    r.Status,
                    r.CreatedAt
                })
                .ToListAsync();

            return Ok(requests);
        }

        // 7. POST api/Player/AcceptInvite/{requestId}
        [HttpPost("AcceptInvite/{requestId}")]
        public async Task<IActionResult> AcceptInvite(int requestId)
        {
            var userId = GetUserId();

            var request = await _context.JoinRequests
                .FirstOrDefaultAsync(r => r.RequestId == requestId && r.PlayerId == userId && r.RequestType == "TeamToPlayer" && r.Status == "Pending");

            if (request == null)
            {
                return NotFound(new { message = "Invite not found or already processed." });
            }

            // Check if already in a team
            var existingMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.PlayerId == userId && tm.Status == "Active");
            if (existingMember != null)
            {
                return BadRequest(new { message = "You are already in a team. Please leave your team first." });
            }

            request.Status = "Accepted";
            request.ProcessedAt = DateTime.Now;

            var teamMember = new TeamMember
            {
                TeamId = request.TeamId,
                PlayerId = userId,
                RoleInTeam = "Member",
                Status = "Active",
                JoinedDate = DateTime.Now
            };

            _context.TeamMembers.Add(teamMember);
            
            // Reject other pending invitations
            var otherRequests = await _context.JoinRequests
                .Where(r => r.PlayerId == userId && r.Status == "Pending" && r.RequestId != requestId)
                .ToListAsync();
            
            foreach(var r in otherRequests)
            {
                r.Status = "Rejected";
                r.ProcessedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Invite accepted successfully. You have joined the team." });
        }

        // 8. POST api/Player/RejectInvite/{requestId}
        [HttpPost("RejectInvite/{requestId}")]
        public async Task<IActionResult> RejectInvite(int requestId)
        {
            var userId = GetUserId();

            var request = await _context.JoinRequests
                .FirstOrDefaultAsync(r => r.RequestId == requestId && r.PlayerId == userId && r.RequestType == "TeamToPlayer" && r.Status == "Pending");

            if (request == null)
            {
                return NotFound(new { message = "Invite not found or already processed." });
            }

            request.Status = "Rejected";
            request.ProcessedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Invite rejected." });
        }

        // 9. POST api/Player/RatePlayer/{playerId}
        [HttpPost("RatePlayer/{playerId}")]
        public async Task<IActionResult> RatePlayer(int playerId, [FromBody] RatePlayerDto dto)
        {
            var currentUserId = GetUserId();

            if (currentUserId == playerId)
            {
                return BadRequest(new { message = "You cannot rate yourself." });
            }

            // Validate that both users are in the same team
            var myTeam = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.PlayerId == currentUserId && tm.Status == "Active");

            if (myTeam == null)
            {
                return BadRequest(new { message = "You must be in a team to rate a player." });
            }

            var targetPlayer = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.PlayerId == playerId && tm.TeamId == myTeam.TeamId && tm.Status == "Active");

            if (targetPlayer == null)
            {
                return BadRequest(new { message = "The target player is not in your team." });
            }

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
                TeamId = myTeam.TeamId,
                Score = dto.Score,
                Month = dto.Month,
                Year = dto.Year,
                Comment = dto.Comment
            };

            _context.PlayerRatings.Add(rating);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Player rated successfully." });
        }

        // 10. GET api/Player/NearbyTeams
        [HttpGet("NearbyTeams")]
        public async Task<IActionResult> GetNearbyTeams([FromQuery] string? ward, [FromQuery] int? sportId, [FromQuery] string? search, [FromQuery] string? quality, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var query = _context.Teams
                .Include(t => t.Sport)
                .Where(t => t.IsDisbanded == false || t.IsDisbanded == null);

            if (!string.IsNullOrWhiteSpace(ward))
            {
                query = query.Where(t => t.HomeArea != null && t.HomeArea.Contains(ward));
            }
            
            if (sportId.HasValue && sportId.Value > 0)
            {
                query = query.Where(t => t.SportId == sportId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(t => t.TeamName.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(quality))
            {
                query = query.Where(t => t.QualityLevel == quality);
            }

            var total = await query.CountAsync();

            var teams = await query
                .OrderByDescending(t => t.FoundedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new
                {
                    t.TeamId,
                    t.TeamName,
                    t.HomeArea,
                    t.QualityLevel,
                    t.FoundedDate,
                    t.LookingForOpponent,
                    t.SportId,
                    SportName = t.Sport != null ? t.Sport.SportName : null
                })
                .ToListAsync();

            return Ok(new { data = teams, total, page, pageSize, totalPages = (int)Math.Ceiling((double)total / pageSize) });
        }

        // 10.5 GET api/Player/Matches
        [HttpGet("Matches")]
        public async Task<IActionResult> GetMatches()
        {
            var userId = GetUserId();
            var myTeams = await _context.TeamMembers
                .Where(tm => tm.PlayerId == userId && tm.Status == "Active")
                .Select(tm => tm.TeamId)
                .ToListAsync();

            if (!myTeams.Any())
            {
                return BadRequest(new { message = "You must be in a team to view matches." });
            }

            var matches = await _context.Matches
                .Include(m => m.HomeTeam)
                    .ThenInclude(t => t.Sport)
                .Include(m => m.AwayTeam)
                .Include(m => m.Schedule)
                    .ThenInclude(s => s.Pitch)
                        .ThenInclude(p => p.Stadium)
                .Where(m => m.HomeTeamId != null && myTeams.Contains((int)m.HomeTeamId) || m.AwayTeamId != null && myTeams.Contains((int)m.AwayTeamId))
                .OrderByDescending(m => m.MatchDate)
                .ThenByDescending(m => m.StartTime)
                .Select(m => new
                {
                    m.MatchId,
                    m.HomeTeamId,
                    HomeTeamName = m.HomeTeam != null ? m.HomeTeam.TeamName : null,
                    SportName = m.HomeTeam != null && m.HomeTeam.Sport != null ? m.HomeTeam.Sport.SportName : null,
                    m.AwayTeamId,
                    AwayTeamName = m.AwayTeam != null ? m.AwayTeam.TeamName : null,
                    m.HomeScore,
                    m.AwayScore,
                    m.MatchStatus,
                    m.MatchType,
                    m.Location,
                    m.MatchDate,
                    Schedule = m.Schedule != null ? new
                    {
                        m.Schedule.ScheduleId,
                        m.Schedule.StartTime,
                        m.Schedule.EndTime,
                        m.Schedule.PitchId
                    } : null,
                    MyVote = _context.MatchPolls.Where(mp => mp.MatchId == m.MatchId && mp.PlayerId == userId).Select(mp => mp.IsAttending).FirstOrDefault()
                })
                .ToListAsync();

            return Ok(matches);
        }

        // 10.6 GET api/Player/PickupMatches
        [HttpGet("PickupMatches")]
        public async Task<IActionResult> GetPickupMatches()
        {
            var matches = await _context.Matches
                .Include(m => m.Sport)
                .Where(m => m.MatchType == "PickUp" && m.MatchStatus == "Pending")
                .OrderByDescending(m => m.ExpiresAt)
                .ToListAsync();

            var result = matches.Select(m => {
                string desc = "";
                string loc = "";
                try {
                    if (!string.IsNullOrEmpty(m.CancelReason)) {
                        using (var doc = System.Text.Json.JsonDocument.Parse(m.CancelReason)) {
                            if (doc.RootElement.TryGetProperty("Description", out var d)) desc = d.GetString() ?? "";
                            if (doc.RootElement.TryGetProperty("Location", out var l)) loc = l.GetString() ?? "";
                        }
                    }
                } catch { }
                
                return new {
                    PostId = m.MatchId,
                    Title = $"Cá nhân tìm trận {(m.Sport != null ? m.Sport.SportName : "")}{(string.IsNullOrEmpty(loc) ? "" : $" tại {loc}")}",
                    Content = desc,
                    MatchId = m.MatchId,
                    Match = new {
                        Sport = new { SportName = m.Sport != null ? m.Sport.SportName : "Thể thao" },
                        ExpiresAt = m.ExpiresAt
                    },
                    CreatedAt = m.ExpiresAt ?? DateTime.Now
                };
            });

            return Ok(result);
        }

        // 10.7 POST api/Player/JoinPickupMatch/{postId}
        [HttpPost("JoinPickupMatch/{postId}")]
        public async Task<IActionResult> JoinPickupMatch(int postId)
        {
            var userId = GetUserId();

            var post = await _context.Posts
                .Include(p => p.Match)
                .FirstOrDefaultAsync(p => p.PostId == postId && p.PostType == "Recruitment");

            if (post == null || post.MatchId == null)
            {
                return NotFound(new { message = "Pickup match not found." });
            }

            // Check Paywall Quota
            var user = await _context.Users.FindAsync(userId);
            if (user != null && !user.IsPremium)
            {
                var thisMonthCount = await _context.MatchPolls
                    .Include(mp => mp.Match)
                    .Where(mp => mp.PlayerId == userId 
                              && mp.IsAttending == true 
                              && mp.Match.MatchType == "PickUp" 
                              && mp.Match.ExpiresAt != null 
                              && mp.Match.ExpiresAt.Value.Month == DateTime.Now.Month 
                              && mp.Match.ExpiresAt.Value.Year == DateTime.Now.Year)
                    .CountAsync();

                if (thisMonthCount >= 3)
                {
                    return BadRequest(new { 
                        message = "Bạn đã dùng hết 3 lượt tham gia trận ghép lẻ miễn phí trong tháng này.",
                        requiresPayment = true,
                        paymentType = "PickupMatch",
                        price = 9000
                    });
                }
            }

            // Add player to MatchPoll as attending
            var existingPoll = await _context.MatchPolls
                .FirstOrDefaultAsync(mp => mp.MatchId == post.MatchId && mp.PlayerId == userId);

            if (existingPoll != null)
            {
                existingPoll.IsAttending = true;
            }
            else
            {
                var newPoll = new MatchPoll
                {
                    MatchId = post.MatchId.Value,
                    PlayerId = userId,
                    IsAttending = true
                };
                _context.MatchPolls.Add(newPoll);
            }

            await _context.SaveChangesAsync();

            // Broadcast to Post Author
            if (post.AuthorId > 0)
            {
                var connectionId = FInd_Op_Web.Hubs.NotificationHub.GetConnectionIdForUser(post.AuthorId.ToString());
                if (!string.IsNullOrEmpty(connectionId))
                {
                    var name = user?.FullName ?? user?.Username ?? "Một người chơi";
                    await _hubContext.Clients.Client(connectionId).SendAsync("ReceiveNotification", $"{name} vừa xin tham gia trận ghép lẻ của bạn.");
                }
            }

            return Ok(new { message = "You have successfully joined the pickup match." });
        }

        // 11. POST api/Player/VoteAttendance/{matchId}
        [HttpPost("VoteAttendance/{matchId}")]
        public async Task<IActionResult> VoteAttendance(int matchId, [FromBody] VoteAttendanceDto dto)
        {
            var userId = GetUserId();

            // Check if match exists
            var match = await _context.Matches.FindAsync(matchId);
            if (match == null)
            {
                return NotFound(new { message = "Match not found." });
            }

            if (match.TournamentId != null && dto.IsAttending)
            {
                var isMember = await _context.TeamMembers.AnyAsync(tm => 
                    tm.PlayerId == userId && tm.Status == "Active" &&
                    (tm.TeamId == match.HomeTeamId || tm.TeamId == match.AwayTeamId));

                if (!isMember)
                {
                    return BadRequest(new { message = "Vào giải sẽ không được phép đá ở đội khác, chỉ đá với đội của mình thôi." });
                }
            }

            var poll = await _context.MatchPolls
                .FirstOrDefaultAsync(p => p.MatchId == matchId && p.PlayerId == userId);

            if (poll == null)
            {
                poll = new MatchPoll
                {
                    MatchId = matchId,
                    PlayerId = userId,
                    IsAttending = dto.IsAttending
                };
                _context.MatchPolls.Add(poll);
            }
            else
            {
                poll.IsAttending = dto.IsAttending;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Attendance voted successfully.", isAttending = dto.IsAttending });
        }

        // 11.5 GET api/Player/Tournaments
        [HttpGet("Tournaments")]
        public async Task<IActionResult> GetTournaments()
        {
            var userId = GetUserId();
            var teamMember = await _context.TeamMembers.FirstOrDefaultAsync(tm => tm.PlayerId == userId && tm.Status == "Active");
            
            if (teamMember == null)
            {
                return Ok(new List<object>()); // Empty list if player is not in a team
            }

            var tournaments = await _context.TournamentTeams
                .Include(tt => tt.Tournament)
                .Where(tt => tt.TeamId == teamMember.TeamId && tt.Tournament != null)
                .Select(tt => new {
                    tt.Tournament.TournamentId,
                    tt.Tournament.TournamentName,
                    tt.Tournament.Format,
                    tt.Tournament.Status,
                    tt.Tournament.StartDate,
                    tt.Tournament.EndDate,
                    tt.Tournament.Scope,
                    tt.Tournament.MaxTeams,
                    tt.Tournament.MaxPlayersPerTeam,
                    tt.Tournament.Description
                })
                .ToListAsync();

            return Ok(tournaments);
        }

        // 12. POST api/Player/CreateIndividualMatch
        [HttpGet("MyPickupMatches")]
        public async Task<IActionResult> GetMyPickupMatches()
        {
            var userId = GetUserId();
            var matches = await _context.Matches
                .Where(m => m.MatchType == "PickUp" && m.CancelReason != null && m.CancelReason.Contains($"\"CreatorId\":{userId}"))
                .OrderByDescending(m => m.ExpiresAt)
                .Select(m => new
                {
                    m.MatchId,
                    m.MatchStatus,
                    m.CancelReason,
                    m.ExpiresAt,
                    m.SportId
                })
                .ToListAsync();

            return Ok(matches);
        }

        [HttpPost("CreateIndividualMatch")]
        public async Task<IActionResult> CreateIndividualMatch([FromBody] CreateIndividualMatchDto dto)
        {
            var userId = GetUserId();
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");

            // Count existing individual matches this month
            var currentMonthMatches = await _context.Matches
                .Where(m => m.CancelReason != null && m.CancelReason.Contains($"\"CreatorId\":{userId}") 
                         && m.ExpiresAt != null 
                         && m.ExpiresAt.Value.Month == DateTime.Now.Month 
                         && m.ExpiresAt.Value.Year == DateTime.Now.Year)
                .CountAsync();

            if (!user.IsPremium && currentMonthMatches >= 3)
            {
                return BadRequest(new { message = "Bạn đã đạt giới hạn 3 trận tạo cá nhân trong tháng này. Vui lòng nâng cấp VIP để tạo không giới hạn." });
            }

            var newMatch = new Match
            {
                SportId = dto.SportId,
                MatchType = "PickUp",
                CancelReason = System.Text.Json.JsonSerializer.Serialize(new { CreatorId = userId, Location = dto.Location, QualityLevel = dto.QualityLevel, Description = dto.Description }),
                MatchStatus = "Pending",
                ResultVisibility = "Public",
                ExpiresAt = dto.ExpiresAt != default ? dto.ExpiresAt : DateTime.Now.AddDays(7)
            };

            _context.Matches.Add(newMatch);
            await _context.SaveChangesAsync();

            // Add creator to match poll
            var poll = new MatchPoll
            {
                MatchId = newMatch.MatchId,
                PlayerId = userId,
                IsAttending = true
            };
            _context.MatchPolls.Add(poll);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tạo trận cá nhân thành công!", matchId = newMatch.MatchId });
        }

        [HttpDelete("DeletePickupMatch/{id}")]
        public async Task<IActionResult> DeletePickupMatch(int id)
        {
            var userId = GetUserId();
            var match = await _context.Matches.FindAsync(id);
            if (match == null || match.MatchType != "PickUp") return NotFound();

            if (!match.CancelReason.Contains($"\"CreatorId\":{userId}"))
            {
                return Forbid();
            }

            // Remove related polls
            var polls = await _context.MatchPolls.Where(p => p.MatchId == id).ToListAsync();
            _context.MatchPolls.RemoveRange(polls);
            
            // Remove related posts
            var posts = await _context.Posts.Where(p => p.MatchId == id).ToListAsync();
            _context.Posts.RemoveRange(posts);

            _context.Matches.Remove(match);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa kèo thành công!" });
        }
    }
}
