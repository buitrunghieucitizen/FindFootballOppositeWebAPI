using System;
using System.Linq;
using System.Threading.Tasks;
using FInd_Op_Web.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FInd_Op_Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PublicController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PublicController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("Teams")]
        public async Task<IActionResult> GetTeams(
            [FromQuery] string? rankingTier, 
            [FromQuery] string? homeArea, 
            [FromQuery] int? minFairplay,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12)
        {
            var query = _context.Teams
                .Include(t => t.Sport)
                .Where(t => (t.IsDisbanded == false || t.IsDisbanded == null) && !t.IsInternal && t.QualityLevel != "Nội bộ");

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(t => t.TeamName.Contains(search));
            }

            if (!string.IsNullOrEmpty(homeArea))
            {
                query = query.Where(t => t.HomeArea != null && t.HomeArea.Contains(homeArea));
            }

            if (minFairplay.HasValue)
            {
                query = query.Where(t => t.FairplayScore >= minFairplay.Value);
            }

            if (!string.IsNullOrEmpty(rankingTier))
            {
                switch (rankingTier.ToLower())
                {
                    case "yếu":
                        query = query.Where(t => t.RankingScore < 20);
                        break;
                    case "trung bình":
                        query = query.Where(t => t.RankingScore >= 20 && t.RankingScore < 50);
                        break;
                    case "khá":
                        query = query.Where(t => t.RankingScore >= 50 && t.RankingScore <= 100);
                        break;
                    case "đá hay":
                        query = query.Where(t => t.RankingScore > 100);
                        break;
                }
            }

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var teams = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new
                {
                    t.TeamId,
                    t.TeamName,
                    t.CaptainId,
                    t.QualityLevel,
                    t.HomeArea,
                    t.History,
                    t.CreatedAt,
                    t.SportId,
                    t.FairplayScore,
                    t.RankingScore,
                    SportName = t.Sport != null ? t.Sport.SportName : null
                })
                .ToListAsync();

            return Ok(new { teams, totalCount, totalPages, page, pageSize });
        }

        [HttpGet("Teams/{id}")]
        public async Task<IActionResult> GetTeam(int id)
        {
            var team = await _context.Teams
                .Include(t => t.Captain)
                .Include(t => t.Sport)
                .Select(t => new {
                    t.TeamId,
                    t.TeamName,
                    t.LogoUrl,
                    t.FoundedDate,
                    t.QualityLevel,
                    t.RankingScore,
                    t.FairplayScore,
                    t.History,
                    t.LookingForOpponent,
                    t.HomeArea,
                    CaptainName = t.Captain != null ? t.Captain.FullName : "N/A",
                    SportName = t.Sport != null ? t.Sport.SportName : "N/A",
                    Tournaments = t.TournamentTeams.Select(tt => new { tt.TournamentId, tt.Tournament.TournamentName }).ToList(),
                    Members = t.TeamMembers.Select(tm => new { UserId = tm.PlayerId, FullName = tm.Player != null ? tm.Player.FullName : "N/A", Role = tm.RoleInTeam }).ToList()
                })
                .FirstOrDefaultAsync(t => t.TeamId == id);

            if (team == null) return NotFound(new { message = "Không tìm thấy đội." });

            var matches = await _context.Matches
                .Include(m => m.HomeTeam)
                .Include(m => m.AwayTeam)
                .Where(m => (m.HomeTeamId == id || m.AwayTeamId == id) && m.MatchStatus == "Đã kết thúc")
                .OrderByDescending(m => m.MatchDate)
                .ToListAsync();

            int totalMatches = matches.Count;
            int wonMatches = matches.Count(m => 
                (m.HomeTeamId == id && m.HomeScore > m.AwayScore) || 
                (m.AwayTeamId == id && m.AwayScore > m.HomeScore)
            );
            int drawMatches = matches.Count(m => m.HomeScore == m.AwayScore);
            int lostMatches = totalMatches - wonMatches - drawMatches;
            double winRate = totalMatches > 0 ? Math.Round((double)wonMatches / totalMatches * 100, 2) : 0;

            var matchHistory = matches.Select(m => new {
                m.MatchId,
                m.MatchDate,
                HomeTeamName = m.HomeTeam?.TeamName,
                AwayTeamName = m.AwayTeam?.TeamName,
                HomeTeamLogo = m.HomeTeam?.LogoUrl,
                AwayTeamLogo = m.AwayTeam?.LogoUrl,
                m.HomeScore,
                m.AwayScore,
                Result = (m.HomeTeamId == id && m.HomeScore > m.AwayScore) || (m.AwayTeamId == id && m.AwayScore > m.HomeScore) ? "Thắng" : 
                         (m.HomeScore == m.AwayScore ? "Hòa" : "Thua")
            }).Take(10).ToList();

            return Ok(new { 
                team, 
                stats = new { 
                    totalMatches, 
                    wonMatches, 
                    drawMatches, 
                    lostMatches, 
                    winRate 
                }, 
                matchHistory 
            });
        }

        [HttpGet("TestMatchRequests")]
        public async Task<IActionResult> TestMatchRequests([FromQuery] int teamId)
        {
            try
            {
                var requests = await _context.MatchRequests
                    .Include(r => r.Match)
                    .Include(r => r.RequestingTeam)
                    .Where(r => r.Match != null && r.Match.HomeTeamId == teamId && r.Status == "Pending")
                    .ToListAsync();

                return Ok(new { count = requests.Count, requests = requests });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, stack = ex.StackTrace, inner = ex.InnerException?.Message });
            }
        }

        [HttpGet("Stadiums")]
        public async Task<IActionResult> GetStadiums([FromQuery] int? sportId, [FromQuery] string? search)
        {
            var query = _context.Stadiums.Include(s => s.Pitches).ThenInclude(p => p.Sport).AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(s => s.StadiumName.Contains(search) || s.Address.Contains(search));
            }

            if (sportId.HasValue && sportId.Value > 0)
            {
                query = query.Where(s => s.Pitches.Any(p => p.SportId == sportId.Value));
            }

            var stadiums = await query
                .Include(s => s.Owner)
                .Select(s => new
                {
                    s.StadiumId,
                    s.StadiumName,
                    s.Address,
                    s.Hotline,
                    s.Description,
                    s.Latitude,
                    s.Longitude,
                    s.ImageUrl,
                    s.QrCodeUrl,
                    s.BankAccountNumber,
                    s.BankName,
                    s.BankAccountName,
                    s.OwnerId,
                    OwnerName = s.Owner != null ? s.Owner.FullName : "Chủ sân",
                    Sports = s.Pitches.Where(p => p.Sport != null).Select(p => p.Sport.SportName).Distinct(),
                    Pitches = s.Pitches.Select(p => new
                    {
                        p.PitchId,
                        p.PitchName,
                        p.PitchSize,
                        p.GrassType,
                        p.PricePerSlot,
                        p.SportId,
                        SportName = p.Sport != null ? p.Sport.SportName : null
                    })
                })
                .ToListAsync();

            return Ok(stadiums);
        }

        [HttpGet("TeamRankings")]
        public async Task<IActionResult> GetTeamRankings([FromQuery] int? sportId)
        {
            var query = _context.Teams.Where(t => (t.IsDisbanded == false || t.IsDisbanded == null) && !t.IsInternal && t.QualityLevel != "Nội bộ");
            
            if (sportId.HasValue && sportId.Value > 0)
            {
                query = query.Where(t => t.SportId == sportId.Value);
            }

            var teams = await query
                .OrderByDescending(t => t.RankingScore)
                .Select(t => new { t.TeamId, t.TeamName, t.RankingScore, t.HomeArea, SportName = t.Sport != null ? t.Sport.SportName : null })
                .Take(50)
                .ToListAsync();

            return Ok(teams);
        }

        [HttpGet("Matches")]
        public async Task<IActionResult> GetMatches([FromQuery] int? sportId, [FromQuery] string? search)
        {
            var query = _context.Matches
                .Include(m => m.HomeTeam)
                    .ThenInclude(t => t.Sport)
                .Include(m => m.AwayTeam)
                .Include(m => m.Schedule)
                    .ThenInclude(s => s.Pitch)
                        .ThenInclude(p => p.Stadium)
                .Include(m => m.MatchPolls)
                    .ThenInclude(mp => mp.Player)
                .Include(m => m.Sport)
                .Where(m => !m.IsIndividualMatch)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(m => (m.HomeTeam != null && m.HomeTeam.TeamName.Contains(search)) || 
                                         (m.AwayTeam != null && m.AwayTeam.TeamName.Contains(search)) ||
                                         (m.Schedule != null && m.Schedule.Pitch != null && m.Schedule.Pitch.Stadium != null && m.Schedule.Pitch.Stadium.StadiumName.Contains(search)) ||
                                         (m.MatchType == "PickUp" && m.MatchPolls.Any(mp => mp.IsAttending == true && mp.Player != null && mp.Player.FullName.Contains(search))));
            }

            if (sportId.HasValue && sportId.Value > 0)
            {
                query = query.Where(m => (m.HomeTeam != null && m.HomeTeam.SportId == sportId.Value) || 
                                         (m.MatchType == "PickUp" && m.SportId == sportId.Value));
            }

            var dbMatches = await query
                .Select(m => new
                {
                    m.MatchId,
                    m.MatchStatus,
                    m.MatchType,
                    HomeTeamName = m.MatchType == "PickUp" && m.MatchPolls.FirstOrDefault(mp => mp.IsAttending == true) != null
                        ? m.MatchPolls.FirstOrDefault(mp => mp.IsAttending == true).Player.FullName
                        : (m.HomeTeam != null ? m.HomeTeam.TeamName : "Đội khách"),
                    HomeTeamAvatar = m.MatchType == "PickUp" && m.MatchPolls.FirstOrDefault(mp => mp.IsAttending == true) != null
                        ? m.MatchPolls.FirstOrDefault(mp => mp.IsAttending == true).Player.AvatarUrl
                        : (m.HomeTeam != null ? m.HomeTeam.LogoUrl : null),
                    HomeTeamPhone = m.MatchType == "PickUp" && m.MatchPolls.FirstOrDefault(mp => mp.IsAttending == true) != null
                        ? m.MatchPolls.FirstOrDefault(mp => mp.IsAttending == true).Player.Phone
                        : null,
                    CreatorId = m.MatchType == "PickUp" && m.MatchPolls.FirstOrDefault(mp => mp.IsAttending == true) != null
                        ? (int?)m.MatchPolls.FirstOrDefault(mp => mp.IsAttending == true).PlayerId
                        : null,
                    AwayTeamName = m.AwayTeam != null ? m.AwayTeam.TeamName : "Đang tìm đối thủ",
                    HomeTeamQuality = m.HomeTeam != null ? m.HomeTeam.QualityLevel : "",
                    AwayTeamQuality = m.AwayTeam != null ? m.AwayTeam.QualityLevel : "",
                    SportName = m.HomeTeam != null && m.HomeTeam.Sport != null ? m.HomeTeam.Sport.SportName : (m.Sport != null ? m.Sport.SportName : null),
                    MatchDate = m.MatchDate,
                    StartTimeTs = m.StartTime,
                    ScheduleStartTime = m.Schedule != null ? (DateTime?)m.Schedule.StartTime : null,
                    ScheduleEndTime = m.Schedule != null ? (DateTime?)m.Schedule.EndTime : null,
                    Location = m.Location,
                    m.HomeScore,
                    m.AwayScore,
                    StadiumName = m.Schedule != null && m.Schedule.Pitch != null && m.Schedule.Pitch.Stadium != null ? m.Schedule.Pitch.Stadium.StadiumName : "Chưa xác định",
                    PitchName = m.Schedule != null && m.Schedule.Pitch != null ? m.Schedule.Pitch.PitchName : "Chưa xác định"
                })
                .OrderByDescending(m => m.MatchDate)
                .ToListAsync();

            var matches = dbMatches.Select(m => new
            {
                m.MatchId,
                m.MatchStatus,
                m.MatchType,
                m.HomeTeamName,
                m.HomeTeamAvatar,
                m.HomeTeamPhone,
                m.CreatorId,
                m.AwayTeamName,
                m.HomeTeamQuality,
                m.AwayTeamQuality,
                m.SportName,
                m.MatchDate,
                StartTime = m.StartTimeTs != null ? m.StartTimeTs.Value.ToString(@"hh\:mm") : (m.ScheduleStartTime != null ? m.ScheduleStartTime.Value.ToString("HH:mm") : null),
                EndTime = m.ScheduleEndTime,
                m.Location,
                m.HomeScore,
                m.AwayScore,
                m.StadiumName,
                m.PitchName
            });

            return Ok(matches);
        }

        [HttpGet("IndividualMatches")]
        public async Task<IActionResult> GetIndividualMatches([FromQuery] int? sportId, [FromQuery] string? search)
        {
            var query = _context.Matches
                .Include(m => m.HomePlayer)
                .Include(m => m.AwayPlayer)
                .Include(m => m.Sport)
                .Where(m => m.IsIndividualMatch)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(m => (m.HomePlayer != null && m.HomePlayer.FullName.Contains(search)) || 
                                         (m.AwayPlayer != null && m.AwayPlayer.FullName.Contains(search)));
            }

            if (sportId.HasValue && sportId.Value > 0)
            {
                query = query.Where(m => m.SportId == sportId.Value);
            }

            var matches = await query
                .Select(m => new
                {
                    m.MatchId,
                    m.MatchStatus,
                    m.MatchType,
                    HomePlayerName = m.HomePlayer != null ? m.HomePlayer.FullName : "Không xác định",
                    HomePlayerAvatar = m.HomePlayer != null ? m.HomePlayer.AvatarUrl : null,
                    HomePlayerRanking = m.HomePlayer != null ? m.HomePlayer.RankingScore : 0,
                    HomePlayerId = m.HomePlayerId,
                    AwayPlayerName = m.AwayPlayer != null ? m.AwayPlayer.FullName : "Đang tìm đối thủ",
                    AwayPlayerAvatar = m.AwayPlayer != null ? m.AwayPlayer.AvatarUrl : null,
                    AwayPlayerRanking = m.AwayPlayer != null ? m.AwayPlayer.RankingScore : 0,
                    AwayPlayerId = m.AwayPlayerId,
                    SportName = m.Sport != null ? m.Sport.SportName : null,
                    MatchDate = m.MatchDate,
                    m.StartTime,
                    m.Location,
                    m.HomeScore,
                    m.AwayScore
                })
                .OrderByDescending(m => m.MatchDate)
                .ToListAsync();

            return Ok(matches);
        }

        [HttpGet("Tournaments")]
        public async Task<IActionResult> GetTournaments([FromQuery] int? sportId, [FromQuery] string? search)
        {
            var query = _context.Tournaments
                .Include(t => t.Stadium)
                .Include(t => t.TournamentTeams)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(t => t.TournamentName.Contains(search) || 
                                         (t.Stadium != null && t.Stadium.StadiumName.Contains(search)));
            }

            if (sportId.HasValue && sportId.Value > 0)
            {
                query = query.Where(t => t.SportId == sportId.Value);
            }

            var tournaments = await query
                .Select(t => new
                {
                    t.TournamentId,
                    t.TournamentName,
                    t.Format,
                    t.Status,
                    t.Scope,
                    t.StartDate,
                    t.EndDate,
                    t.Description,
                    t.CreatedAt,
                    t.EntryFee,
                    t.BankQrCodeUrl,
                    t.MaxPlayersPerTeam,
                    t.MaxTeams,
                    OwnerName = t.Organizer != null ? t.Organizer.FullName : "Chủ Giải Đấu",
                    OwnerBank = "Chuyển khoản trực tiếp qua QR code",
                    StadiumName = t.Stadium != null ? t.Stadium.StadiumName : "Chưa xác định",
                    RegisteredTeamIds = t.TournamentTeams.Select(tt => tt.TeamId).ToList()
                })
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(tournaments);
        }

        [HttpGet("Tournaments/{id}/Teams")]
        public async Task<IActionResult> GetTournamentTeams(int id)
        {
            var teams = await _context.TournamentTeams
                .Include(tt => tt.Team)
                .Where(tt => tt.TournamentId == id && (tt.Status == "Approved" || tt.Status == "PaidPendingName"))
                .Select(tt => new
                {
                    tt.TeamId,
                    tt.Team.TeamName,
                    tt.Team.CaptainId,
                    tt.Status
                })
                .ToListAsync();

            return Ok(teams);
        }

        [HttpGet("Tournaments/{id}/Matches")]
        public async Task<IActionResult> GetTournamentMatches(int id)
        {
            var matches = await _context.Matches
                .Include(m => m.HomeTeam)
                .Include(m => m.AwayTeam)
                .Where(m => m.TournamentId == id)
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
                .OrderBy(m => m.MatchId)
                .ToListAsync();

            return Ok(matches);
        }

        [HttpGet("Tournaments/{id}/Bracket")]
        public async Task<IActionResult> GetTournamentBracket(int id)
        {
            var tournament = await _context.Tournaments.FindAsync(id);
            if (tournament == null) return NotFound();

            if (string.IsNullOrEmpty(tournament.BracketJson))
            {
                return Ok(new { format = tournament.Format, rounds = new object[] { } });
            }
            return Content(tournament.BracketJson, "application/json");
        }

        [HttpGet("Recruitments")]
        public async Task<IActionResult> GetRecruitments()
        {
            var recruitments = await _context.RecruitmentAds
                .Include(r => r.Team)
                .Where(r => r.IsActive == true)
                .Select(r => new
                {
                    r.AdId,
                    r.Title,
                    r.Content,
                    r.PositionNeeded,
                    r.CreatedAt,
                    TeamId = r.TeamId,
                    TeamName = r.Team != null ? r.Team.TeamName : "Đội ẩn",
                    TeamHomeArea = r.Team != null ? r.Team.HomeArea : "",
                    TeamQuality = r.Team != null ? r.Team.QualityLevel : ""
                })
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(recruitments);
        }

        [HttpGet("Posts")]
        public async Task<IActionResult> GetPosts()
        {
            var posts = await _context.Posts
                .Include(p => p.Team)
                .Include(p => p.Author)
                .Where(p => p.Status == "Approved")
                .Select(p => new
                {
                    p.PostId,
                    p.Title,
                    p.Content,
                    p.PostType,
                    p.CreatedAt,
                    TeamName = p.Team != null ? p.Team.TeamName : "Đội ẩn",
                    AuthorName = p.Author != null ? p.Author.FullName : "Người dùng"
                })
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(posts);
        }
        [HttpPost("Feedback")]
        public async Task<IActionResult> SubmitFeedback([FromBody] FInd_Op_Web.Models.Feedback feedback)
        {
            if (string.IsNullOrWhiteSpace(feedback.Category)) feedback.Category = "General";
            if (string.IsNullOrWhiteSpace(feedback.Content)) return BadRequest("Nội dung không được để trống");
            
            feedback.CreatedAt = DateTime.Now;
            feedback.Status = "New";
            
            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();
            
            return Ok(new { success = true, message = "Cảm ơn bạn đã đóng góp ý kiến!" });
        }
    }
}
