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
        public async Task<IActionResult> GetTeams()
        {
            var teams = await _context.Teams
                .Include(t => t.Sport)
                .Where(t => t.IsDisbanded == false || t.IsDisbanded == null)
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
                    SportName = t.Sport != null ? t.Sport.SportName : null
                })
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(teams);
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
                    t.LookingForOpponent,
                    t.HomeArea,
                    CaptainName = t.Captain != null ? t.Captain.FullName : "N/A",
                    SportName = t.Sport != null ? t.Sport.SportName : "N/A"
                })
                .FirstOrDefaultAsync(t => t.TeamId == id);

            if (team == null) return NotFound(new { message = "Không tìm thấy đội." });
            return Ok(team);
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
        public async Task<IActionResult> GetStadiums()
        {
            var stadiums = await _context.Stadiums
                .Include(s => s.Pitches)
                    .ThenInclude(p => p.Sport)
                .Include(s => s.Owner)
                .Select(s => new
                {
                    s.StadiumId,
                    s.StadiumName,
                    s.Address,
                    s.Hotline,
                    s.Description,
                    s.OwnerId,
                    OwnerName = s.Owner != null ? s.Owner.FullName : "Chủ sân",
                    Sports = s.Pitches.Where(p => p.Sport != null).Select(p => p.Sport.SportName).Distinct(),
                    Pitches = s.Pitches.Select(p => new
                    {
                        p.PitchId,
                        p.PitchName,
                        p.PitchSize,
                        p.PricePerHour,
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
            var query = _context.Teams.Where(t => t.IsDisbanded == false || t.IsDisbanded == null);
            
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
        public async Task<IActionResult> GetMatches()
        {
            var matches = await _context.Matches
                .Include(m => m.HomeTeam)
                    .ThenInclude(t => t.Sport)
                .Include(m => m.AwayTeam)
                .Include(m => m.Schedule)
                    .ThenInclude(s => s.Pitch)
                        .ThenInclude(p => p.Stadium)
                .Select(m => new
                {
                    m.MatchId,
                    m.MatchStatus,
                    HomeTeamName = m.HomeTeam != null ? m.HomeTeam.TeamName : "Đội khách",
                    AwayTeamName = m.AwayTeam != null ? m.AwayTeam.TeamName : "Đang tìm đối thủ",
                    HomeTeamQuality = m.HomeTeam != null ? m.HomeTeam.QualityLevel : "",
                    AwayTeamQuality = m.AwayTeam != null ? m.AwayTeam.QualityLevel : "",
                    SportName = m.HomeTeam != null && m.HomeTeam.Sport != null ? m.HomeTeam.Sport.SportName : null,
                    StartTime = m.Schedule != null ? m.Schedule.StartTime : (DateTime?)null,
                    EndTime = m.Schedule != null ? m.Schedule.EndTime : (DateTime?)null,
                    StadiumName = m.Schedule != null && m.Schedule.Pitch != null && m.Schedule.Pitch.Stadium != null ? m.Schedule.Pitch.Stadium.StadiumName : "Chưa xác định",
                    PitchName = m.Schedule != null && m.Schedule.Pitch != null ? m.Schedule.Pitch.PitchName : "Chưa xác định"
                })
                .OrderByDescending(m => m.StartTime)
                .ToListAsync();

            return Ok(matches);
        }

        [HttpGet("Tournaments")]
        public async Task<IActionResult> GetTournaments()
        {
            var tournaments = await _context.Tournaments
                .Include(t => t.Stadium)
                .Include(t => t.TournamentTeams)
                .Select(t => new
                {
                    t.TournamentId,
                    t.TournamentName,
                    t.Format,
                    t.Status,
                    t.StartDate,
                    t.EndDate,
                    t.Description,
                    t.CreatedAt,
                    StadiumName = t.Stadium != null ? t.Stadium.StadiumName : "Chưa xác định",
                    RegisteredTeamIds = t.TournamentTeams.Select(tt => tt.TeamId).ToList()
                })
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(tournaments);
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
