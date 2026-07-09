using FInd_Op_Web.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FInd_Op_Web.Data;
using FInd_Op_Web.Models;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;
using System;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;

namespace FInd_Op_Web.Controllers
{



    [Authorize(Roles = "StadiumOwner")]
    [ApiController]
    [Route("api/[controller]")]
    public class StadiumOwnerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly Cloudinary _cloudinary;

        public StadiumOwnerController(ApplicationDbContext context, Cloudinary cloudinary)
        {
            _context = context;
            _cloudinary = cloudinary;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("Invalid user token");
        }

        [HttpGet("OwnerRevenue")]
        public async Task<IActionResult> GetOwnerRevenue([FromQuery] int year = 2024)
        {
            try
            {
                int ownerId = GetUserId();
                var monthlyData = new List<object>();

                for (int i = 1; i <= 12; i++)
                {
                    var ownerSchedules = await _context.PitchSchedules
                        .Include(ps => ps.Pitch)
                        .Where(ps => ps.Pitch != null && ps.Pitch.Stadium != null && ps.Pitch.Stadium.OwnerId == ownerId 
                                     && ps.ScheduleStatus == "Confirmed" 
                                     && ps.StartTime.Year == year && ps.StartTime.Month == i)
                        .ToListAsync();

                    decimal ownerRevenueSum = 0;
                    foreach (var s in ownerSchedules)
                    {
                        var durationHours = (decimal)(s.EndTime - s.StartTime).TotalHours;
                        ownerRevenueSum += durationHours * (s.Pitch?.PricePerSlot ?? 0);
                    }

                    // Include BookingCommissions if any
                    var commissionRevenueSum = await _context.BookingCommissions
                        .Where(c => c.StadiumOwnerId == ownerId && c.CreatedAt.Year == year && c.CreatedAt.Month == i)
                        .SumAsync(c => (decimal?)(c.BookingAmount - c.CommissionAmount)) ?? 0;

                    ownerRevenueSum += commissionRevenueSum;

                    monthlyData.Add(new
                    {
                        month = i,
                        revenue = ownerRevenueSum
                    });
                }

                return Ok(new
                {
                    year = year,
                    data = monthlyData
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("MyStadiums")]
        public async Task<IActionResult> GetMyStadiums()
        {
            var userId = GetUserId();
            var stadiums = await _context.Stadiums
                .Include(s => s.Pitches)
                .Where(s => s.OwnerId == userId)
                .Select(s => new
                {
                    s.StadiumId,
                    s.StadiumName,
                    s.Address,
                    s.Hotline,
                    s.Description,
                    s.CreatedAt,
                    Pitches = s.Pitches.Select(p => new { p.PitchId, p.PitchName, p.PitchSize, p.PricePerSlot, p.GrassType })
                })
                .ToListAsync();

            return Ok(stadiums);
        }

        // 2. POST api/StadiumOwner/Stadiums
        [HttpPost("Stadiums")]
        public async Task<IActionResult> CreateStadium([FromForm] OwnerCreateStadiumDto dto)
        {
            try
            {
                var userId = GetUserId();

                // Check how many stadiums the owner currently has
                var stadiumCount = await _context.Stadiums.CountAsync(s => s.OwnerId == userId);
                var paidCount = await _context.PaymentTransactions
                    .CountAsync(pt => pt.UserId == userId && pt.TransactionType == "PitchCreation" && pt.Status == "Paid");

                var allowedCount = 2 + paidCount;

                if (stadiumCount >= allowedCount)
                {
                    return StatusCode(402, new { message = "Bạn đã đạt giới hạn sân miễn phí (2 sân). Vui lòng thanh toán 30k để tạo sân thứ 3." });
                }

                string? imageUrl = null;
                if (dto.ImageFile != null && dto.ImageFile.Length > 0)
                {
                    if (_cloudinary == null)
                    {
                        return StatusCode(500, new { message = "Cấu hình Cloudinary bị thiếu trên máy chủ." });
                    }

                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(dto.ImageFile.FileName, dto.ImageFile.OpenReadStream()),
                        Folder = "stadiums"
                    };
                    var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                    if (uploadResult.Error != null)
                    {
                        return BadRequest(new { message = uploadResult.Error.Message });
                    }
                    imageUrl = uploadResult.SecureUrl.ToString();
                }

                double? parsedLat = null;
                if (!string.IsNullOrEmpty(dto.Latitude) && double.TryParse(dto.Latitude, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var lat))
                {
                    parsedLat = lat;
                }

                double? parsedLng = null;
                if (!string.IsNullOrEmpty(dto.Longitude) && double.TryParse(dto.Longitude, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var lng))
                {
                    parsedLng = lng;
                }

                var stadium = new Stadium
                {
                    OwnerId = userId,
                    StadiumName = dto.StadiumName,
                    Address = dto.Address,
                    Hotline = dto.Hotline,
                    Description = dto.Description,
                    Latitude = parsedLat,
                    Longitude = parsedLng,
                    ImageUrl = imageUrl,
                    CreatedAt = DateTime.Now
                };

                _context.Stadiums.Add(stadium);
                await _context.SaveChangesAsync();

                return Ok(stadium);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        // 3. POST api/StadiumOwner/Pitches
        [HttpPost("Pitches")]
        public async Task<IActionResult> CreatePitch([FromBody] OwnerCreatePitchDto dto)
        {
            var userId = GetUserId();
            var stadium = await _context.Stadiums.FirstOrDefaultAsync(s => s.StadiumId == dto.StadiumId && s.OwnerId == userId);
            
            if (stadium == null)
            {
                return BadRequest("Stadium not found or you do not have ownership.");
            }

            var pitch = new Pitch
            {
                StadiumId = dto.StadiumId,
                PitchName = dto.PitchName,
                GrassType = dto.PitchType,
                PricePerSlot = dto.HourlyRate,
                SportId = dto.SportId,
                IsActive = true
            };

            _context.Pitches.Add(pitch);
            await _context.SaveChangesAsync();

            return Ok(pitch);
        }

        [HttpGet("Bookings")]
        public async Task<IActionResult> GetBookings()
        {
            var userId = GetUserId();

            
            var bookings = await _context.PitchSchedules
                .Include(ps => ps.Pitch)
                    .ThenInclude(p => p.Stadium)
                .Include(ps => ps.BookedBy)
                .Include(ps => ps.Matches)
                .Where(ps => ps.Pitch != null && ps.Pitch.Stadium != null && ps.Pitch.Stadium.OwnerId == userId)
                .ToListAsync();

            var result = bookings.Select(ps => new {
                id = ps.ScheduleId,
                pitchId = ps.PitchId,
                pitchName = ps.Pitch != null ? ps.Pitch.PitchName : "Tên sân",
                stadiumName = ps.Pitch != null && ps.Pitch.Stadium != null ? ps.Pitch.Stadium.StadiumName : "Sân bóng",
                date = ps.StartTime.ToString("yyyy-MM-dd"),
                startTime = ps.StartTime.ToString("HH:mm"),
                endTime = ps.EndTime.ToString("HH:mm"),
                status = ps.ScheduleStatus,
                userName = ps.BookedBy != null ? (ps.BookedBy.FullName ?? ps.BookedBy.Username) : "Ẩn danh"
            });

            return Ok(result);
        }

        // 5. POST api/StadiumOwner/Bookings/{scheduleId}/Confirm
        [HttpPost("Bookings/{scheduleId}/Confirm")]
        public async Task<IActionResult> ConfirmBooking(int scheduleId)
        {
            var userId = GetUserId();
            var schedule = await _context.PitchSchedules
                .Include(ps => ps.Pitch)
                    .ThenInclude(p => p.Stadium)
                .FirstOrDefaultAsync(ps => ps.ScheduleId == scheduleId && ps.Pitch != null && ps.Pitch.Stadium != null && ps.Pitch.Stadium.OwnerId == userId);

            if (schedule == null)
            {
                return NotFound("Booking not found or access denied.");
            }

            schedule.ScheduleStatus = "Confirmed";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Booking confirmed", scheduleId });
        }

        // 6. POST api/StadiumOwner/Bookings/{scheduleId}/Reject
        [HttpPost("Bookings/{scheduleId}/Reject")]
        public async Task<IActionResult> RejectBooking(int scheduleId)
        {
            var userId = GetUserId();
            var schedule = await _context.PitchSchedules
                .Include(ps => ps.Pitch)
                    .ThenInclude(p => p.Stadium)
                .FirstOrDefaultAsync(ps => ps.ScheduleId == scheduleId && ps.Pitch != null && ps.Pitch.Stadium != null && ps.Pitch.Stadium.OwnerId == userId);

            if (schedule == null)
            {
                return NotFound("Booking not found or access denied.");
            }

            schedule.ScheduleStatus = "Rejected";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Booking rejected", scheduleId });
        }

        // 7. POST api/StadiumOwner/Pitches/{pitchId}/RecurringSchedules
        [HttpPost("Pitches/{pitchId}/RecurringSchedules")]
        public async Task<IActionResult> CreateRecurringSchedule(int pitchId, [FromBody] CreateRecurringScheduleDto dto)
        {
            var userId = GetUserId();

            // Verify owner
            var pitch = await _context.Pitches.Include(p => p.Stadium).FirstOrDefaultAsync(p => p.PitchId == pitchId);
            if (pitch == null || pitch.Stadium == null || pitch.Stadium.OwnerId != userId)
            {
                return Unauthorized(new { message = "Không có quyền thao tác trên sân này." });
            }

            if (dto.NumberOfWeeks <= 0 || dto.NumberOfWeeks > 12)
            {
                return BadRequest(new { message = "Số tuần phải từ 1 đến 12." });
            }

            var startDate = dto.FromDate.Date;
            
            // Advance startDate to the correct DayOfWeek
            while ((int)startDate.DayOfWeek != dto.DayOfWeek)
            {
                startDate = startDate.AddDays(1);
            }

            var generatedSchedules = new List<PitchSchedule>();

            for (int i = 0; i < dto.NumberOfWeeks; i++)
            {
                var targetDate = startDate.AddDays(i * 7);
                var startTime = targetDate.Add(dto.StartTime);
                var endTime = targetDate.Add(dto.EndTime);

                // Clash detection
                var isClash = await _context.PitchSchedules.AnyAsync(ps =>
                    ps.PitchId == pitchId &&
                    ps.ScheduleStatus != "Rejected" &&
                    ps.ScheduleStatus != "Cancelled" &&
                    ps.StartTime < endTime && ps.EndTime > startTime);

                if (isClash)
                {
                    return BadRequest(new { message = $"Trùng lịch vào ngày {targetDate:dd/MM/yyyy}. Vui lòng chọn khung giờ khác hoặc số tuần khác." });
                }

                // Temporary assignment to BookedBy (ideally we should have a field for Custom Name in PitchSchedule,
                // but since BookedBy is User ID, and StadiumOwner wants to block it manually:
                // If TeamId or CustomerName is used, we can just save it. For now, since the model only has BookedBy,
                // we leave BookedBy as null and maybe rely on ScheduleStatus = "Confirmed" to block the pitch.
                
                var schedule = new PitchSchedule
                {
                    PitchId = pitchId,
                    BookedById = userId, // Owner locks it for themselves/customer
                    StartTime = startTime,
                    EndTime = endTime,
                    ScheduleStatus = "Confirmed"
                };

                generatedSchedules.Add(schedule);
            }

            _context.PitchSchedules.AddRange(generatedSchedules);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã tạo thành công {dto.NumberOfWeeks} lịch đặt sân định kỳ.", count = dto.NumberOfWeeks });
        }

        // --- TOURNAMENT MANAGEMENT ---
        [HttpPost("CreateTournament")]
        public async Task<IActionResult> CreateTournament([FromBody] TournamentCreateDto dto)
        {
            var userId = GetUserId();
            var tournament = new Tournament
            {
                TournamentName = dto.Name,
                Format = dto.Format ?? "Knockout",
                SportId = dto.SportId,
                OrganizerId = userId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = "Upcoming",
                Description = $"Sport: {dto.SportId}, Scope: {dto.Scope}, Stadium: {dto.Stadium}, MaxTeams: {dto.MaxTeams}",
                CreatedAt = DateTime.Now
            };

            _context.Tournaments.Add(tournament);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tạo giải đấu thành công.", tournamentId = tournament.TournamentId });
        }

        [HttpGet("TournamentSettings/{id}")]
        public async Task<IActionResult> GetTournamentSettings(int id)
        {
            var userId = GetUserId();
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
                if (tournament.Description.Contains("MaxTeams: "))
                {
                    var parts = tournament.Description.Split(new[] { "MaxTeams: " }, StringSplitOptions.None);
                    if (parts.Length > 1 && int.TryParse(parts[1].Trim(), out int max)) maxTeams = max;
                }
                if (tournament.Description.Contains("Scope: Public")) scope = "Public";
                if (tournament.Description.Contains("Stadium: "))
                {
                    var stStart = tournament.Description.IndexOf("Stadium: ") + 9;
                    var stEnd = tournament.Description.IndexOf(", MaxTeams");
                    if (stEnd > stStart) stadium = tournament.Description.Substring(stStart, stEnd - stStart);
                }
            }

            return Ok(new TournamentSettingsDto
            {
                Name = tournament.TournamentName,
                Format = tournament.Format ?? "Swiss",
                Sport = sportName,
                Scope = scope,
                Stadium = stadium,
                MaxTeams = maxTeams
            });
        }

        [HttpPut("TournamentSettings/{id}")]
        public async Task<IActionResult> UpdateTournamentSettings(int id, [FromBody] TournamentSettingsDto dto)
        {
            var userId = GetUserId();
            var tournament = await _context.Tournaments.FirstOrDefaultAsync(t => t.TournamentId == id && t.OrganizerId == userId);
            if (tournament == null) return NotFound(new { message = "Tournament not found." });

            tournament.TournamentName = dto.Name;
            tournament.Format = dto.Format;
            tournament.Description = $"Sport: {dto.Sport}, Scope: {dto.Scope}, Stadium: {dto.Stadium}, MaxTeams: {dto.MaxTeams}";
            
            await _context.SaveChangesAsync();
            return Ok(new { message = "Settings updated." });
        }

        [HttpGet("Tournaments/{id}/Teams")]
        public async Task<IActionResult> GetTournamentTeams(int id)
        {
            var teams = await _context.TournamentTeams
                .Include(tt => tt.Team)
                .Where(tt => tt.TournamentId == id && tt.Status == "Approved")
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
            var userId = GetUserId();
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

        [HttpGet("Tournaments/{id}/Bracket")]
        public async Task<IActionResult> GetTournamentBracket(int id)
        {
            var tournament = await _context.Tournaments.FindAsync(id);
            if (tournament == null) return NotFound();

            return Ok(new { format = tournament.Format, rounds = new object[] { } });
        }

        [HttpPut("Tournaments/{id}/SwissMatches")]
        public async Task<IActionResult> UpdateSwissMatches(int id, [FromBody] object payload)
        {
            return Ok(new { message = "Swiss matches updated." });
        }

        [HttpPost("Tournaments/{id}/GenerateInternal")]
        public async Task<IActionResult> GenerateInternalTeams(int id, [FromBody] object payload)
        {
            return Ok(new { message = "Internal teams generated." });
        }

        [HttpGet("Tournaments")]
        public async Task<IActionResult> GetMyTournaments()
        {
            var userId = GetUserId();
            var tournaments = await _context.Tournaments
                .Where(t => t.OrganizerId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new
                {
                    id = t.TournamentId,
                    name = t.TournamentName,
                    format = t.Format,
                    status = t.Status,
                    startDate = t.StartDate.HasValue ? t.StartDate.Value.ToString("yyyy-MM-dd") : null,
                    endDate = t.EndDate.HasValue ? t.EndDate.Value.ToString("yyyy-MM-dd") : null
                })
                .ToListAsync();

            return Ok(tournaments);
        }

        [HttpGet("Tournaments/{id}/Registrations")]
        public async Task<IActionResult> GetTournamentRegistrations(int id)
        {
            var userId = GetUserId();
            var tournament = await _context.Tournaments.FindAsync(id);
            if (tournament == null || tournament.OrganizerId != userId) 
                return Forbid();

            var registrations = await _context.TournamentTeams
                .Include(tt => tt.Team)
                .ThenInclude(t => t.Captain)
                .Where(tt => tt.TournamentId == id && tt.Status == "Pending")
                .Select(tt => new {
                    TeamId = tt.TeamId,
                    TeamName = tt.Team.TeamName,
                    CaptainName = tt.Team.Captain.FullName ?? tt.Team.Captain.Username,
                    RegistrationDate = tt.RegistrationDate
                })
                .OrderBy(tt => tt.RegistrationDate)
                .ToListAsync();

            return Ok(registrations);
        }

        [HttpPost("Tournaments/{id}/Approve/{teamId}")]
        public async Task<IActionResult> ApproveRegistration(int id, int teamId)
        {
            var userId = GetUserId();
            var tournament = await _context.Tournaments.FindAsync(id);
            if (tournament == null || tournament.OrganizerId != userId) 
                return Forbid();

            var tt = await _context.TournamentTeams.FirstOrDefaultAsync(t => t.TournamentId == id && t.TeamId == teamId);
            if (tt == null) return NotFound(new { message = "Không tìm thấy yêu cầu đăng ký." });

            tt.Status = "Approved";
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã duyệt yêu cầu." });
        }

        [HttpPost("Tournaments/{id}/Reject/{teamId}")]
        public async Task<IActionResult> RejectRegistration(int id, int teamId)
        {
            var userId = GetUserId();
            var tournament = await _context.Tournaments.FindAsync(id);
            if (tournament == null || tournament.OrganizerId != userId) 
                return Forbid();

            var tt = await _context.TournamentTeams.FirstOrDefaultAsync(t => t.TournamentId == id && t.TeamId == teamId);
            if (tt == null) return NotFound(new { message = "Không tìm thấy yêu cầu đăng ký." });

            tt.Status = "Rejected";
            // Alternatively: _context.TournamentTeams.Remove(tt);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã từ chối yêu cầu." });
        }


        [HttpPut("Tournaments/Match/{matchId}")]
        public async Task<IActionResult> UpdateTournamentMatch(int matchId, [FromBody] UpdateTournamentMatchDto dto)
        {
            var userId = GetUserId();
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
            var userId = GetUserId();
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
    }
}

