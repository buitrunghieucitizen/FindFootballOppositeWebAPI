using FInd_Op_Web.DTOs;
using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FInd_Op_Web.Data;
using FInd_Op_Web.Models;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;

namespace FInd_Op_Web.Controllers
{

    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly Cloudinary _cloudinary;
        private const int PageSize = 10;

        public AdminController(ApplicationDbContext context, Cloudinary cloudinary)
        {
            _context = context;
            _cloudinary = cloudinary;
        }

        // ============================================================
        // HELPER: Standardized Pagination Response
        // ============================================================
        private object CreatePaginatedResponse<T>(List<T> items, int totalItems, int currentPage)
        {
            return new
            {
                items,
                totalItems,
                currentPage,
                totalPages = (int)Math.Ceiling((double)totalItems / PageSize),
                pageSize = PageSize
            };
        }

        [HttpGet("DashboardStats")]
        public async Task<IActionResult> GetDashboardStats([FromQuery] string timeframe = "year")
        {
            var now = DateTime.Now;
            var data = new List<object>();

            if (timeframe == "week")
            {
                // Last 7 days
                for (int i = 6; i >= 0; i--)
                {
                    var date = now.Date.AddDays(-i);
                    var users = await _context.Users.CountAsync(u => u.CreatedAt != null && u.CreatedAt.Value.Date == date);
                    var bookings = await _context.PitchSchedules.CountAsync(ps => ps.StartTime.Date == date && ps.ScheduleStatus != "Rejected");
                    var revenue = await _context.PaymentTransactions
                        .Where(t => t.Status == "Paid" && t.CreatedAt.Date == date)
                        .SumAsync(t => (decimal?)t.Amount) ?? 0;

                    data.Add(new { label = date.ToString("dd/MM"), users, bookings, revenue });
                }
            }
            else if (timeframe == "month")
            {
                // Last 4 weeks
                for (int i = 3; i >= 0; i--)
                {
                    var weekStart = now.Date.AddDays(-(i * 7 + 7));
                    var weekEnd = now.Date.AddDays(-(i * 7));
                    var label = $"Tuần {4 - i}";

                    var users = await _context.Users.CountAsync(u => u.CreatedAt != null && u.CreatedAt.Value >= weekStart && u.CreatedAt.Value < weekEnd);
                    var bookings = await _context.PitchSchedules.CountAsync(ps => ps.StartTime >= weekStart && ps.StartTime < weekEnd && ps.ScheduleStatus != "Rejected");
                    var revenue = await _context.PaymentTransactions
                        .Where(t => t.Status == "Paid" && t.CreatedAt >= weekStart && t.CreatedAt < weekEnd)
                        .SumAsync(t => (decimal?)t.Amount) ?? 0;

                    data.Add(new { label, users, bookings, revenue });
                }
            }
            else if (timeframe == "quarter")
            {
                // Current quarter (3 months)
                int currentQuarter = (now.Month - 1) / 3 + 1;
                int startMonth = (currentQuarter - 1) * 3 + 1;
                for (int i = 0; i < 3; i++)
                {
                    int m = startMonth + i;
                    var label = $"Tháng {m}";

                    var users = await _context.Users.CountAsync(u => u.CreatedAt != null && u.CreatedAt.Value.Year == now.Year && u.CreatedAt.Value.Month == m);
                    var bookings = await _context.PitchSchedules.CountAsync(ps => ps.StartTime.Year == now.Year && ps.StartTime.Month == m && ps.ScheduleStatus != "Rejected");
                    var revenue = await _context.PaymentTransactions
                        .Where(t => t.Status == "Paid" && t.CreatedAt.Year == now.Year && t.CreatedAt.Month == m)
                        .SumAsync(t => (decimal?)t.Amount) ?? 0;

                    data.Add(new { label, users, bookings, revenue });
                }
            }
            else // year
            {
                for (int i = 1; i <= 12; i++)
                {
                    var label = $"Tháng {i}";

                    var users = await _context.Users.CountAsync(u => u.CreatedAt != null && u.CreatedAt.Value.Year == now.Year && u.CreatedAt.Value.Month == i);
                    var bookings = await _context.PitchSchedules.CountAsync(ps => ps.StartTime.Year == now.Year && ps.StartTime.Month == i && ps.ScheduleStatus != "Rejected");
                    var revenue = await _context.PaymentTransactions
                        .Where(t => t.Status == "Paid" && t.CreatedAt.Year == now.Year && t.CreatedAt.Month == i)
                        .SumAsync(t => (decimal?)t.Amount) ?? 0;

                    data.Add(new { label, users, bookings, revenue });
                }
            }

            return Ok(data);
        }

        /// <summary>
        /// GET api/Admin/profile
        /// Lấy thông tin cá nhân của Admin
        /// </summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return BadRequest(new { message = "Không thể xác định người dùng từ token." });
            }

            var user = await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng." });
            }

            return Ok(new
            {
                userId = user.UserId,
                username = user.Username,
                fullName = user.FullName,
                phone = user.Phone,
                isFreeAgent = user.IsFreeAgent,
                createdAt = user.CreatedAt,
                roles = user.Roles.Select(r => r.RoleName).ToList()
            });
        }

        // ============================================================
        // 1. USER MANAGEMENT (Full CRUD)
        // ============================================================

        [HttpPost("RemindCommissionDebt")]
        public async Task<IActionResult> RemindCommissionDebt()
        {
            // Calculate debts for all owners
            var ownersWithDebt = await _context.BookingCommissions
                .Where(c => !c.IsPaidToPlatform)
                .GroupBy(c => c.StadiumOwnerId)
                .Select(g => new {
                    OwnerId = g.Key,
                    TotalDebt = g.Sum(c => c.CommissionAmount)
                })
                .Where(x => x.TotalDebt > 0)
                .ToListAsync();

            int count = 0;
            foreach (var item in ownersWithDebt)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = item.OwnerId,
                    Title = "Nhắc nhở nộp tiền hoa hồng",
                    Message = $"Hệ thống thông báo: Bạn đang có khoản nợ hoa hồng chưa thanh toán là {item.TotalDebt:N0}đ. Vui lòng thanh toán sớm để không bị gián đoạn dịch vụ.",
                    RelatedLink = "/stadium-owner",
                    IsRead = false,
                    CreatedAt = DateTime.Now
                });
                count++;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã gửi thông báo nhắc nhở đến {count} chủ sân." });
        }

        /// <summary>
        /// GET api/Admin/users?search=&page=1&role=
        /// Danh sách người dùng có phân trang, tìm kiếm, lọc theo role
        /// </summary>
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers(string? search, int page = 1, string? role = null)
        {
            var query = _context.Users.Include(u => u.Roles).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(u =>
                    u.FullName.Contains(search) ||
                    u.Username.Contains(search) ||
                    (u.Phone != null && u.Phone.Contains(search)));
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                query = query.Where(u => u.Roles.Any(r => r.RoleName == role));
            }

            var totalItems = await query.CountAsync();
            var users = await query
                .OrderBy(u => u.UserId)
                .Skip((page - 1) * PageSize)
                .Take(PageSize)
                .Select(u => new
                {
                    u.UserId,
                    u.Username,
                    u.FullName,
                    u.Phone,
                    u.IsFreeAgent,
                    u.CreatedAt,
                    roles = u.Roles.Select(r => new { r.RoleId, r.RoleName })
                })
                .ToListAsync();

            return Ok(CreatePaginatedResponse(users, totalItems, page));
        }

        /// <summary>
        /// GET api/Admin/users/{id}
        /// Lấy thông tin chi tiết người dùng theo ID
        /// </summary>
        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Roles)
                .Where(u => u.UserId == id)
                .Select(u => new
                {
                    u.UserId,
                    u.Username,
                    u.FullName,
                    u.Phone,
                    u.IsFreeAgent,
                    u.CreatedAt,
                    roles = u.Roles.Select(r => new { r.RoleId, r.RoleName })
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng." });

            return Ok(user);
        }

        /// <summary>
        /// POST api/Admin/users
        /// Tạo người dùng mới
        /// </summary>
        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            // Validate username unique
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                return BadRequest(new { message = "Tên đăng nhập đã tồn tại." });

            // Validate phone unique (if provided)
            if (!string.IsNullOrWhiteSpace(dto.Phone))
            {
                if (!Regex.IsMatch(dto.Phone, @"^\d{10,11}$"))
                    return BadRequest(new { message = "Số điện thoại phải có 10-11 chữ số." });

                if (await _context.Users.AnyAsync(u => u.Phone == dto.Phone))
                    return BadRequest(new { message = "Số điện thoại đã được sử dụng." });
            }

            var user = new User
            {
                Username = dto.Username,
                FullName = dto.FullName,
                Phone = dto.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(
                    string.IsNullOrWhiteSpace(dto.Password) ? "Pass12345" : dto.Password, 12),
                CreatedAt = DateTime.Now,
                IsFreeAgent = false
            };

            // Assign roles
            if (dto.Roles != null && dto.Roles.Length > 0)
            {
                var roles = await _context.Roles
                    .Where(r => dto.Roles.Contains(r.RoleName))
                    .ToListAsync();
                foreach (var role in roles)
                {
                    user.Roles.Add(role);
                }
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, new
            {
                user.UserId,
                user.Username,
                user.FullName,
                user.Phone,
                user.IsFreeAgent,
                user.CreatedAt,
                roles = user.Roles.Select(r => new { r.RoleId, r.RoleName }),
                message = "Tạo người dùng thành công!"
            });
        }

        /// <summary>
        /// PUT api/Admin/users/{id}
        /// Cập nhật thông tin người dùng (không cho đổi username, password)
        /// </summary>
        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
        {
            var user = await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng." });

            // Validate phone
            if (!string.IsNullOrWhiteSpace(dto.Phone))
            {
                if (!Regex.IsMatch(dto.Phone, @"^\d{10,11}$"))
                    return BadRequest(new { message = "Số điện thoại phải có 10-11 chữ số." });

                if (await _context.Users.AnyAsync(u => u.Phone == dto.Phone && u.UserId != id))
                    return BadRequest(new { message = "Số điện thoại đã được sử dụng." });
            }

            // Update fields
            user.FullName = dto.FullName;
            user.Phone = dto.Phone;

            // Update roles if provided
            if (dto.Roles != null)
            {
                user.Roles.Clear();
                if (dto.Roles.Length > 0)
                {
                    var roles = await _context.Roles
                        .Where(r => dto.Roles.Contains(r.RoleName))
                        .ToListAsync();
                    foreach (var role in roles)
                    {
                        user.Roles.Add(role);
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                user.UserId,
                user.Username,
                user.FullName,
                user.Phone,
                user.IsFreeAgent,
                user.CreatedAt,
                roles = user.Roles.Select(r => new { r.RoleId, r.RoleName }),
                message = "Cập nhật người dùng thành công!"
            });
        }

        /// <summary>
        /// DELETE api/Admin/users/{id}
        /// Xóa người dùng
        /// </summary>
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng." });

            try
            {
                user.Roles.Clear();
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException)
            {
                return BadRequest(new { message = "Không thể xóa tài khoản này vì còn dữ liệu liên quan (Đội bóng, Sân bãi, Giao dịch,...). Vui lòng gỡ bỏ dữ liệu trước." });
            }
        }

        // ============================================================
        // 2. TEAM MANAGEMENT (List, Detail, Create, Delete)
        // ============================================================

        /// <summary>
        /// GET api/Admin/teams?search=&page=1
        /// Danh sách đội bóng có phân trang, tìm kiếm
        /// </summary>
        [HttpGet("teams")]
        public async Task<IActionResult> GetTeams(string? search, int page = 1)
        {
            var query = _context.Teams
                .Include(t => t.Captain)
                .Include(t => t.TeamMembers)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(t => t.TeamName.Contains(search));
            }

            var totalItems = await query.CountAsync();
            var teams = await query
                .OrderBy(t => t.TeamId)
                .Skip((page - 1) * PageSize)
                .Take(PageSize)
                .Select(t => new
                {
                    t.TeamId,
                    t.TeamName,
                    t.CaptainId,
                    captain = t.Captain == null ? null : new
                    {
                        t.Captain.FullName,
                        t.Captain.Username
                    },
                    t.QualityLevel,
                    t.IsDisbanded,
                    t.CreatedAt,
                    memberCount = t.TeamMembers.Count,
                    t.LookingForOpponent,
                    t.HomeArea,
                    t.FoundedDate,
                    t.RankingScore
                })
                .ToListAsync();

            return Ok(CreatePaginatedResponse(teams, totalItems, page));
        }

        /// <summary>
        /// GET api/Admin/teams/{id}
        /// Chi tiết đội bóng
        /// </summary>
        [HttpGet("teams/{id}")]
        public async Task<IActionResult> GetTeam(int id)
        {
            var team = await _context.Teams
                .Include(t => t.Captain)
                .Include(t => t.TeamMembers).ThenInclude(tm => tm.Player)
                .FirstOrDefaultAsync(t => t.TeamId == id);

            if (team == null)
                return NotFound(new { message = "Không tìm thấy đội bóng." });

            // Lấy lịch sử trận đấu
            var matches = await _context.Matches
                .Include(m => m.HomeTeam)
                .Include(m => m.AwayTeam)
                .Include(m => m.Schedule)
                .Where(m => m.HomeTeamId == id || m.AwayTeamId == id)
                .Select(m => new
                {
                    m.MatchId,
                    m.HomeTeamId,
                    homeTeamName = m.HomeTeam != null ? m.HomeTeam.TeamName : null,
                    m.AwayTeamId,
                    awayTeamName = m.AwayTeam != null ? m.AwayTeam.TeamName : null,
                    m.MatchStatus,
                    schedule = m.Schedule == null ? null : new
                    {
                        m.Schedule.StartTime,
                        m.Schedule.EndTime
                    }
                })
                .ToListAsync();

            return Ok(new
            {
                team.TeamId,
                team.TeamName,
                team.CaptainId,
                captain = team.Captain == null ? null : new
                {
                    team.Captain.FullName,
                    team.Captain.Username
                },
                team.QualityLevel,
                team.History,
                team.IsDisbanded,
                team.CreatedAt,
                team.HomeArea,
                team.FoundedDate,
                team.LookingForOpponent,
                members = team.TeamMembers.Select(tm => new
                {
                    tm.PlayerId,
                    playerName = tm.Player.FullName,
                    playerUsername = tm.Player.Username,
                    tm.RoleInTeam,
                    tm.Status,
                    tm.JoinedDate
                }),
                matchHistory = matches
            });
        }

        /// <summary>
        /// POST api/Admin/teams
        /// Tạo đội bóng mới
        /// </summary>
        [HttpPost("teams")]
        public async Task<IActionResult> CreateTeam([FromBody] CreateTeamDto dto)
        {
            // Validate captain exists
            if (!await _context.Users.AnyAsync(u => u.UserId == dto.CaptainId))
                return BadRequest(new { message = "Đội trưởng không tồn tại trong hệ thống." });

            var team = new Team
            {
                TeamName = dto.TeamName,
                CaptainId = dto.CaptainId,
                QualityLevel = dto.QualityLevel,
                HomeArea = dto.HomeArea,
                History = dto.History,
                LookingForOpponent = dto.LookingForOpponent,
                SportId = dto.SportId,
                RankingScore = dto.RankingScore,
                FoundedDate = dto.FoundedDate,
                CreatedAt = DateTime.Now,
                IsDisbanded = false
            };

            _context.Teams.Add(team);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTeam), new { id = team.TeamId }, new
            {
                team.TeamId,
                team.TeamName,
                team.CaptainId,
                team.QualityLevel,
                team.HomeArea,
                team.LookingForOpponent,
                team.CreatedAt,
                message = "Tạo đội bóng thành công!"
            });
        }

        /// <summary>
        /// PUT api/Admin/teams/{id}
        /// Cập nhật đội bóng
        /// </summary>
        [HttpPut("teams/{id}")]
        public async Task<IActionResult> UpdateTeam(int id, [FromBody] UpdateTeamDto dto)
        {
            var team = await _context.Teams.FindAsync(id);
            if (team == null)
                return NotFound(new { message = "Không tìm thấy đội bóng." });

            team.TeamName = dto.TeamName;
            team.QualityLevel = dto.QualityLevel;
            team.HomeArea = dto.HomeArea;
            team.History = dto.History;
            team.RankingScore = dto.RankingScore;
            team.FoundedDate = dto.FoundedDate;
            if (dto.LookingForOpponent.HasValue)
            {
                team.LookingForOpponent = dto.LookingForOpponent.Value;
            }
            if (dto.SportId.HasValue)
            {
                team.SportId = dto.SportId.Value;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                team.TeamId,
                team.TeamName,
                team.QualityLevel,
                team.HomeArea,
                team.LookingForOpponent,
                message = "Cập nhật đội bóng thành công!"
            });
        }

        /// <summary>
        /// DELETE api/Admin/teams/{id}
        /// Xóa đội bóng
        /// </summary>
        [HttpDelete("teams/{id}")]
        public async Task<IActionResult> DeleteTeam(int id)
        {
            var team = await _context.Teams.FindAsync(id);
            if (team == null)
                return NotFound(new { message = "Không tìm thấy đội bóng." });

            try
            {
                _context.Teams.Remove(team);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException)
            {
                return BadRequest(new { message = "Không thể xóa đội bóng này do còn dữ liệu liên quan (Thành viên, Trận đấu, Bài đăng,...). Vui lòng gỡ bỏ dữ liệu trước." });
            }
        }

        // ============================================================
        // 3. STADIUM MANAGEMENT (Full CRUD)
        // ============================================================

        /// <summary>
        /// GET api/Admin/stadiums?search=&page=1
        /// Danh sách sân vận động có phân trang, tìm kiếm
        /// </summary>
        [HttpGet("stadiums")]
        public async Task<IActionResult> GetStadiums(string? search, int? month, int? year, int page = 1)
        {
            var query = _context.Stadiums
                .Include(s => s.Owner)
                .Include(s => s.Pitches)
                    .ThenInclude(p => p.PitchSchedules)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(s =>
                    s.StadiumName.Contains(search) ||
                    (s.Address != null && s.Address.Contains(search)));
            }

            var totalItems = await query.CountAsync();

            int targetMonth = month ?? DateTime.Now.Month;
            int targetYear = year ?? DateTime.Now.Year;

            var stadiumsList = await query
                .OrderBy(s => s.StadiumId)
                .Skip((page - 1) * PageSize)
                .Take(PageSize)
                .ToListAsync();

            var result = stadiumsList.Select(s => new
            {
                s.StadiumId,
                s.StadiumName,
                s.Address,
                s.Hotline,
                s.OwnerId,
                owner = s.Owner == null ? null : new { s.Owner.FullName },
                s.Description,
                pitchCount = s.Pitches.Count,
                monthlyBookingCount = s.Pitches.SelectMany(p => p.PitchSchedules).Count(ps => 
                    ps.StartTime.Month == targetMonth && 
                    ps.StartTime.Year == targetYear && 
                    (ps.ScheduleStatus == "Booked" || ps.ScheduleStatus == "Confirmed" || ps.ScheduleStatus == "Completed")),
                totalBookingCount = s.Pitches.SelectMany(p => p.PitchSchedules).Count(ps => 
                    ps.ScheduleStatus == "Booked" || ps.ScheduleStatus == "Confirmed" || ps.ScheduleStatus == "Completed"),
                s.CreatedAt
            }).ToList();

            return Ok(CreatePaginatedResponse(result, totalItems, page));
        }

        /// <summary>
        /// GET api/Admin/stadiums/{id}
        /// Chi tiết sân vận động
        /// </summary>
        [HttpGet("stadiums/{id}")]
        public async Task<IActionResult> GetStadium(int id)
        {
            var stadium = await _context.Stadiums
                .Include(s => s.Owner)
                .Include(s => s.Pitches)
                .Where(s => s.StadiumId == id)
                .Select(s => new
                {
                    s.StadiumId,
                    s.StadiumName,
                    s.Address,
                    s.Hotline,
                    s.OwnerId,
                    owner = s.Owner == null ? null : new
                    {
                        s.Owner.UserId,
                        s.Owner.FullName,
                        s.Owner.Username
                    },
                    s.Description,
                    s.CreatedAt,
                    pitches = s.Pitches.Select(p => new
                    {
                        p.PitchId,
                        p.PitchName,
                        p.PitchSize,
                        p.PricePerSlot,
                        p.GrassType,
                        p.IsActive
                    })
                })
                .FirstOrDefaultAsync();

            if (stadium == null)
                return NotFound(new { message = "Không tìm thấy sân vận động." });

            return Ok(stadium);
        }

        /// <summary>
        /// POST api/Admin/stadiums
        /// Tạo sân vận động mới (kèm sân con)
        /// </summary>
        [HttpPost("stadiums")]
        public async Task<IActionResult> CreateStadium([FromBody] CreateStadiumDto dto)
        {
            // Validate owner exists if provided
            if (dto.OwnerId.HasValue && !await _context.Users.AnyAsync(u => u.UserId == dto.OwnerId))
                return BadRequest(new { message = "Chủ sân không tồn tại trong hệ thống." });

            var stadium = new Stadium
            {
                StadiumName = dto.StadiumName,
                Address = dto.Address,
                Hotline = dto.Hotline,
                Description = dto.Description,
                OwnerId = dto.OwnerId,
                CreatedAt = DateTime.Now
            };

            // Thêm sân con (pitches)
            if (dto.Pitches != null && dto.Pitches.Count > 0)
            {
                foreach (var pitchDto in dto.Pitches)
                {
                    stadium.Pitches.Add(new Pitch
                    {
                        PitchName = pitchDto.PitchName,
                        PitchSize = pitchDto.PitchSize,
                        PricePerSlot = pitchDto.PricePerSlot,
                        GrassType = pitchDto.GrassType,
                        SportId = pitchDto.SportId ?? 1,
                        IsActive = pitchDto.IsActive ?? true
                    });
                }
            }

            _context.Stadiums.Add(stadium);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetStadium), new { id = stadium.StadiumId }, new
            {
                stadium.StadiumId,
                stadium.StadiumName,
                stadium.Address,
                stadium.Hotline,
                stadium.Description,
                stadium.OwnerId,
                stadium.CreatedAt,
                pitches = stadium.Pitches.Select(p => new
                {
                    p.PitchId,
                    p.PitchName,
                    p.PitchSize,
                    p.PricePerSlot,
                    p.GrassType,
                    p.IsActive
                }),
                message = "Tạo sân vận động thành công!"
            });
        }

        /// <summary>
        /// PUT api/Admin/stadiums/{id}
        /// Cập nhật thông tin sân vận động (có thể thêm sân con mới)
        /// </summary>
        [HttpPut("stadiums/{id}")]
        public async Task<IActionResult> UpdateStadium(int id, [FromBody] UpdateStadiumDto dto)
        {
            var stadium = await _context.Stadiums
                .Include(s => s.Pitches)
                .FirstOrDefaultAsync(s => s.StadiumId == id);

            if (stadium == null)
                return NotFound(new { message = "Không tìm thấy sân vận động." });

            // Update stadium info
            stadium.StadiumName = dto.StadiumName;
            stadium.Address = dto.Address;
            stadium.Hotline = dto.Hotline;
            stadium.Description = dto.Description;

            // Add new pitches if provided
            if (dto.AddPitches != null && dto.AddPitches.Count > 0)
            {
                foreach (var pitchDto in dto.AddPitches)
                {
                    stadium.Pitches.Add(new Pitch
                    {
                        PitchName = pitchDto.PitchName,
                        PitchSize = pitchDto.PitchSize,
                        PricePerSlot = pitchDto.PricePerSlot,
                        GrassType = pitchDto.GrassType,
                        SportId = pitchDto.SportId ?? 1,
                        IsActive = pitchDto.IsActive ?? true
                    });
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                stadium.StadiumId,
                stadium.StadiumName,
                stadium.Address,
                stadium.Hotline,
                stadium.Description,
                stadium.CreatedAt,
                pitches = stadium.Pitches.Select(p => new
                {
                    p.PitchId,
                    p.PitchName,
                    p.PitchSize,
                    p.PricePerSlot,
                    p.GrassType,
                    p.IsActive
                }),
                message = "Cập nhật sân vận động thành công!"
            });
        }

        /// <summary>
        /// DELETE api/Admin/stadiums/{id}
        /// Xóa sân vận động và tất cả sân con
        /// </summary>
        [HttpDelete("stadiums/{id}")]
        public async Task<IActionResult> DeleteStadium(int id)
        {
            var stadium = await _context.Stadiums
                .Include(s => s.Pitches)
                .FirstOrDefaultAsync(s => s.StadiumId == id);

            if (stadium == null)
                return NotFound(new { message = "Không tìm thấy sân vận động." });

            // Remove all pitches first
            _context.Pitches.RemoveRange(stadium.Pitches);
            _context.Stadiums.Remove(stadium);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ============================================================
        // 4. MATCH MANAGEMENT (View + Delete only)
        // ============================================================

        /// <summary>
        /// GET api/Admin/matches?search=&page=1&status=
        /// Danh sách trận đấu có phân trang, tìm kiếm, lọc theo trạng thái
        /// </summary>
        [HttpGet("matches")]
        public async Task<IActionResult> GetMatches(string? search, int page = 1, string? status = null)
        {
            var query = _context.Matches
                .Include(m => m.HomeTeam)
                .Include(m => m.AwayTeam)
                .Include(m => m.Schedule)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(m =>
                    (m.MatchStatus != null && m.MatchStatus.Contains(search)) ||
                    (m.HomeTeam != null && m.HomeTeam.TeamName.Contains(search)) ||
                    (m.AwayTeam != null && m.AwayTeam.TeamName.Contains(search)));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(m => m.MatchStatus == status);
            }

            var totalItems = await query.CountAsync();
            var matches = await query
                .OrderByDescending(m => m.MatchId)
                .Skip((page - 1) * PageSize)
                .Take(PageSize)
                .Select(m => new
                {
                    m.MatchId,
                    m.HomeTeamId,
                    homeTeamName = m.HomeTeam != null ? m.HomeTeam.TeamName : null,
                    m.AwayTeamId,
                    awayTeamName = m.AwayTeam != null ? m.AwayTeam.TeamName : null,
                    m.MatchStatus,
                    m.CancelRequestedBy,
                    m.CancelReason,
                    schedule = m.Schedule == null ? null : new
                    {
                        m.Schedule.ScheduleId,
                        m.Schedule.StartTime,
                        m.Schedule.EndTime,
                        m.Schedule.ScheduleStatus
                    }
                })
                .ToListAsync();

            return Ok(CreatePaginatedResponse(matches, totalItems, page));
        }

        /// <summary>
        /// GET api/Admin/matches/{id}
        /// Chi tiết trận đấu
        /// </summary>
        [HttpGet("matches/{id}")]
        public async Task<IActionResult> GetMatch(int id)
        {
            var match = await _context.Matches
                .Include(m => m.HomeTeam)
                .Include(m => m.AwayTeam)
                .Include(m => m.Schedule).ThenInclude(s => s.Pitch)
                .Where(m => m.MatchId == id)
                .Select(m => new
                {
                    m.MatchId,
                    m.HomeTeamId,
                    homeTeam = m.HomeTeam == null ? null : new
                    {
                        m.HomeTeam.TeamId,
                        m.HomeTeam.TeamName,
                        m.HomeTeam.QualityLevel
                    },
                    m.AwayTeamId,
                    awayTeam = m.AwayTeam == null ? null : new
                    {
                        m.AwayTeam.TeamId,
                        m.AwayTeam.TeamName,
                        m.AwayTeam.QualityLevel
                    },
                    m.MatchStatus,
                    m.CancelRequestedBy,
                    m.CancelReason,
                    schedule = m.Schedule == null ? null : new
                    {
                        m.Schedule.ScheduleId,
                        m.Schedule.StartTime,
                        m.Schedule.EndTime,
                        m.Schedule.ScheduleStatus,
                        pitch = m.Schedule.Pitch == null ? null : new
                        {
                            m.Schedule.Pitch.PitchId,
                            m.Schedule.Pitch.PitchName,
                            m.Schedule.Pitch.PitchSize
                        }
                    }
                })
                .FirstOrDefaultAsync();

            if (match == null)
                return NotFound(new { message = "Không tìm thấy trận đấu." });

            return Ok(match);
        }

        /// <summary>
        /// DELETE api/Admin/matches/{id}
        /// Xóa trận đấu
        /// </summary>
        [HttpDelete("matches/{id}")]
        public async Task<IActionResult> DeleteMatch(int id)
        {
            var match = await _context.Matches.FindAsync(id);
            if (match == null)
                return NotFound(new { message = "Không tìm thấy trận đấu." });

            _context.Matches.Remove(match);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ============================================================
        // 5. TOURNAMENT MANAGEMENT (Full CRUD)
        // ============================================================

        /// <summary>
        /// GET api/Admin/tournaments?search=&page=1
        /// Danh sách giải đấu có phân trang
        /// </summary>
        [HttpGet("tournaments")]
        public async Task<IActionResult> GetTournaments(string? search, int page = 1)
        {
            var query = _context.Tournaments
                .Include(t => t.Stadium)
                .Include(t => t.Organizer)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(t => t.TournamentName.Contains(search));
            }

            var totalItems = await query.CountAsync();
            var tournaments = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((page - 1) * PageSize)
                .Take(PageSize)
                .Select(t => new
                {
                    t.TournamentId,
                    t.TournamentName,
                    t.Format,
                    t.StadiumId,
                    stadiumName = t.Stadium != null ? t.Stadium.StadiumName : null,
                    t.OrganizerId,
                    organizerName = t.Organizer != null ? t.Organizer.FullName : null,
                    t.StartDate,
                    t.EndDate,
                    t.Status,
                    t.ApprovalStatus,
                    t.OrganizerCccd,
                    t.OrganizerDriverLicense,
                    t.IsFeePaid,
                    t.EntryFee,
                    t.Scope,
                    t.Description,
                    t.CreatedAt
                })
                .ToListAsync();

            return Ok(CreatePaginatedResponse(tournaments, totalItems, page));
        }

        [HttpGet("tournaments/{id}")]
        public async Task<IActionResult> GetTournament(int id)
        {
            var tournament = await _context.Tournaments
                .Include(t => t.Stadium)
                .Include(t => t.Organizer)
                .Where(t => t.TournamentId == id)
                .Select(t => new
                {
                    t.TournamentId,
                    t.TournamentName,
                    t.Format,
                    t.StadiumId,
                    stadium = t.Stadium == null ? null : new
                    {
                        t.Stadium.StadiumId,
                        t.Stadium.StadiumName,
                        t.Stadium.Address
                    },
                    t.OrganizerId,
                    organizer = t.Organizer == null ? null : new
                    {
                        t.Organizer.UserId,
                        t.Organizer.FullName,
                        t.Organizer.Username
                    },
                    t.StartDate,
                    t.EndDate,
                    t.Status,
                    t.ApprovalStatus,
                    t.OrganizerCccd,
                    t.OrganizerDriverLicense,
                    t.IsFeePaid,
                    t.EntryFee,
                    t.Scope,
                    t.Description,
                    t.CreatedAt,
                    t.MaxTeams
                })
                .FirstOrDefaultAsync();

            if (tournament == null)
                return NotFound(new { message = "Không tìm thấy giải đấu." });

            return Ok(tournament);
        }

        [HttpGet("tournaments/refund-requests")]
        public async Task<IActionResult> GetRefundRequests()
        {
            var requests = await _context.Tournaments
                .Where(t => t.RefundStatus == "Requested")
                .Select(t => new
                {
                    t.TournamentId,
                    t.TournamentName,
                    t.OrganizerId,
                    t.RefundStatus,
                    PlatformFee = t.MaxTeams <= 8 ? 130000 : (t.MaxTeams <= 16 ? 200000 : 500000),
                    RefundAmount = (t.MaxTeams <= 8 ? 130000 : (t.MaxTeams <= 16 ? 200000 : 500000)) * 0.8m
                })
                .ToListAsync();
            return Ok(requests);
        }

        [HttpPost("tournaments/{id}/process-refund")]
        public async Task<IActionResult> ProcessRefund(int id)
        {
            var tournament = await _context.Tournaments.FindAsync(id);
            if (tournament == null) return NotFound();

            if (tournament.RefundStatus != "Requested")
                return BadRequest("Not requested for refund");

            tournament.RefundStatus = "AdminRefunded";
            
            _context.Notifications.Add(new Notification
            {
                UserId = tournament.OrganizerId ?? 0,
                Title = "Đã hoàn tiền giải đấu",
                Message = $"Admin đã hoàn tiền 80% cho giải đấu '{tournament.TournamentName}'. Vui lòng xác nhận.",
                IsRead = false,
                CreatedAt = DateTime.Now
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Processed" });
        }

        /// <summary>
        /// POST api/Admin/tournaments/{id}/approve
        /// Duyệt giải đấu (KYC)
        /// </summary>
        [HttpPost("tournaments/{id}/approve")]
        public async Task<IActionResult> ApproveTournament(int id)
        {
            var tournament = await _context.Tournaments.FindAsync(id);
            if (tournament == null) return NotFound(new { message = "Không tìm thấy giải đấu." });

            if (tournament.ApprovalStatus != "Pending")
                return BadRequest(new { message = "Giải đấu không ở trạng thái chờ duyệt." });

            tournament.ApprovalStatus = "Approved";

            if (tournament.OrganizerId.HasValue)
            {
                var notification = new Notification
                {
                    UserId = tournament.OrganizerId.Value,
                    Title = "Giải đấu được duyệt",
                    Message = $"Giải đấu '{tournament.TournamentName}' của bạn đã được quản trị viên phê duyệt. Hãy vào mục Quản lý giải để thanh toán lệ phí (nếu có) và bắt đầu.",
                    IsRead = false,
                    CreatedAt = DateTime.Now
                };
                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã duyệt giải đấu.", status = tournament.ApprovalStatus });
        }

        /// <summary>
        /// POST api/Admin/tournaments/{id}/reject
        /// Từ chối giải đấu
        /// </summary>
        [HttpPost("tournaments/{id}/reject")]
        public async Task<IActionResult> RejectTournament(int id)
        {
            var tournament = await _context.Tournaments.FindAsync(id);
            if (tournament == null) return NotFound(new { message = "Không tìm thấy giải đấu." });

            if (tournament.ApprovalStatus != "Pending")
                return BadRequest(new { message = "Giải đấu không ở trạng thái chờ duyệt." });

            tournament.ApprovalStatus = "Rejected";
            tournament.Status = "Cancelled";

            if (tournament.OrganizerId.HasValue)
            {
                var notification = new Notification
                {
                    UserId = tournament.OrganizerId.Value,
                    Title = "Giải đấu bị từ chối",
                    Message = $"Giải đấu '{tournament.TournamentName}' của bạn đã bị từ chối do không đạt đủ tiêu chuẩn hoặc thông tin xác thực không hợp lệ.",
                    IsRead = false,
                    CreatedAt = DateTime.Now
                };
                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã từ chối giải đấu." });
        }

        /// <summary>
        /// POST api/Admin/tournaments
        /// Tạo giải đấu mới
        /// </summary>
        [HttpPost("tournaments")]
        public async Task<IActionResult> CreateTournament([FromBody] CreateTournamentDto dto)
        {
            // Validate stadium exists if provided
            if (dto.StadiumId.HasValue && !await _context.Stadiums.AnyAsync(s => s.StadiumId == dto.StadiumId))
                return BadRequest(new { message = "Sân vận động không tồn tại." });

            // Validate organizer exists if provided
            if (dto.OrganizerId.HasValue && !await _context.Users.AnyAsync(u => u.UserId == dto.OrganizerId))
                return BadRequest(new { message = "Người tổ chức không tồn tại." });

            if (dto.StartDate?.Date < DateTime.Now.Date || dto.EndDate?.Date < dto.StartDate?.Date)
            {
                return BadRequest(new { message = "Ngày bắt đầu hoặc ngày kết thúc không hợp lệ." });
            }

            var tournament = new Tournament
            {
                TournamentName = dto.TournamentName,
                Format = dto.Format,
                SportId = dto.SportId,
                StadiumId = dto.StadiumId,
                OrganizerId = dto.OrganizerId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = dto.Status ?? "Upcoming",
                Description = dto.Description,
                CreatedAt = DateTime.Now
            };

            _context.Tournaments.Add(tournament);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTournament), new { id = tournament.TournamentId }, new
            {
                tournament.TournamentId,
                tournament.TournamentName,
                tournament.Format,
                tournament.StadiumId,
                tournament.OrganizerId,
                tournament.StartDate,
                tournament.EndDate,
                tournament.Status,
                tournament.Description,
                tournament.CreatedAt,
                message = "Tạo giải đấu thành công!"
            });
        }

        /// <summary>
        /// PUT api/Admin/tournaments/{id}
        /// Cập nhật giải đấu
        /// </summary>
        [HttpPut("tournaments/{id}")]
        public async Task<IActionResult> UpdateTournament(int id, [FromBody] UpdateTournamentDto dto)
        {
            var tournament = await _context.Tournaments.FindAsync(id);
            if (tournament == null)
                return NotFound(new { message = "Không tìm thấy giải đấu." });

            // Validate stadium if changed
            if (dto.StadiumId.HasValue && !await _context.Stadiums.AnyAsync(s => s.StadiumId == dto.StadiumId))
                return BadRequest(new { message = "Sân vận động không tồn tại." });

            // Validate organizer if changed
            if (dto.OrganizerId.HasValue && !await _context.Users.AnyAsync(u => u.UserId == dto.OrganizerId))
                return BadRequest(new { message = "Người tổ chức không tồn tại." });

            tournament.TournamentName = dto.TournamentName;
            tournament.Format = dto.Format;
            tournament.SportId = dto.SportId;
            tournament.StadiumId = dto.StadiumId;
            tournament.OrganizerId = dto.OrganizerId;
            tournament.StartDate = dto.StartDate;
            tournament.EndDate = dto.EndDate;
            tournament.Status = dto.Status;
            tournament.Description = dto.Description;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                tournament.TournamentId,
                tournament.TournamentName,
                tournament.Format,
                tournament.StadiumId,
                tournament.OrganizerId,
                tournament.StartDate,
                tournament.EndDate,
                tournament.Status,
                tournament.Description,
                tournament.CreatedAt,
                message = "Cập nhật giải đấu thành công!"
            });
        }

        /// <summary>
        /// DELETE api/Admin/tournaments/{id}
        /// Xóa giải đấu
        /// </summary>
        [HttpDelete("tournaments/{id}")]
        public async Task<IActionResult> DeleteTournament(int id)
        {
            var tournament = await _context.Tournaments
                .Include(t => t.TournamentTeams)
                .FirstOrDefaultAsync(t => t.TournamentId == id);

            if (tournament == null)
                return NotFound(new { message = "Không tìm thấy giải đấu." });

            // Explicitly remove related TournamentTeams
            _context.TournamentTeams.RemoveRange(tournament.TournamentTeams);

            // Explicitly remove related TournamentTeamPlayers
            var teamPlayers = await _context.TournamentTeamPlayers.Where(p => p.TournamentId == id).ToListAsync();
            _context.TournamentTeamPlayers.RemoveRange(teamPlayers);

            // Explicitly remove related TournamentFees
            var fees = await _context.TournamentFees.Where(f => f.TournamentId == id).ToListAsync();
            _context.TournamentFees.RemoveRange(fees);

            _context.Tournaments.Remove(tournament);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ============================================================
        // 6. RECRUITMENT MANAGEMENT (View + Soft Delete)
        // ============================================================

        /// <summary>
        /// GET api/Admin/recruitment?search=&page=1
        /// Danh sách tin tuyển quân có phân trang
        /// </summary>
        [HttpGet("recruitment")]
        public async Task<IActionResult> GetRecruitmentAds(string? search, int page = 1)
        {
            var query = _context.RecruitmentAds
                .Include(r => r.Team)
                .Include(r => r.Match)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(r =>
                    r.Title.Contains(search) ||
                    r.Content.Contains(search) ||
                    (r.Team != null && r.Team.TeamName.Contains(search)));
            }

            var totalItems = await query.CountAsync();
            var ads = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * PageSize)
                .Take(PageSize)
                .Select(r => new
                {
                    r.AdId,
                    r.TeamId,
                    teamName = r.Team != null ? r.Team.TeamName : null,
                    r.MatchId,
                    r.Title,
                    r.Content,
                    r.PositionNeeded,
                    r.IsActive,
                    r.CreatedAt
                })
                .ToListAsync();

            return Ok(CreatePaginatedResponse(ads, totalItems, page));
        }

        /// <summary>
        /// DELETE api/Admin/recruitment/{id}
        /// Soft delete tin tuyển quân (yêu cầu lý do)
        /// </summary>
        [HttpDelete("recruitment/{id}")]
        public async Task<IActionResult> DeleteRecruitmentAd(int id, [FromBody] DeleteRecruitmentDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto?.Reason))
                return BadRequest(new { message = "Vui lòng cung cấp lý do gỡ tin tuyển quân." });

            var ad = await _context.RecruitmentAds.FindAsync(id);
            if (ad == null)
                return NotFound(new { message = "Không tìm thấy tin tuyển quân." });

            // Soft delete: chỉ set IsActive = false
            ad.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ============================================================
        // DTO CLASSES
        // ============================================================

        #region DTOs










        // ============================================================
        // POST MANAGEMENT
        // ============================================================

        [HttpGet("posts/pending")]
        public async Task<IActionResult> GetPendingPosts()
        {
            var posts = await _context.Posts
                .Include(p => p.Team)
                .Include(p => p.Author)
                .Where(p => p.Status == "Pending")
                .Select(p => new
                {
                    p.PostId,
                    p.Title,
                    p.Content,
                    p.PostType,
                    p.CreatedAt,
                    TeamName = p.Team != null ? p.Team.TeamName : null,
                    AuthorName = p.Author != null ? p.Author.FullName : null
                })
                .ToListAsync();

            return Ok(posts);
        }

        [HttpPost("posts/{id}/approve")]
        public async Task<IActionResult> ApprovePost(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound(new { message = "Post not found." });

            post.Status = "Approved";
            await _context.SaveChangesAsync();
            return Ok(new { message = "Post approved successfully." });
        }

        [HttpPost("posts/{id}/reject")]
        public async Task<IActionResult> RejectPost(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound(new { message = "Post not found." });

            post.Status = "Rejected";
            await _context.SaveChangesAsync();
            return Ok(new { message = "Post rejected." });
        }

        #endregion

        // ============================================================
        // WITHDRAWAL REQUESTS
        // ============================================================

        [HttpGet("WithdrawalRequests")]
        public async Task<IActionResult> GetWithdrawalRequests([FromQuery] string status = "All")
        {
            var query = _context.Set<WithdrawalRequest>()
                .Include(w => w.StadiumOwner)
                .AsQueryable();

            if (status != "All")
            {
                query = query.Where(w => w.Status == status);
            }

            var requests = await query
                .OrderByDescending(w => w.RequestedAt)
                .Select(w => new
                {
                    w.RequestId,
                    w.StadiumOwnerId,
                    OwnerName = w.StadiumOwner != null ? w.StadiumOwner.FullName : "Unknown",
                    OwnerBankName = _context.Stadiums.Where(s => s.OwnerId == w.StadiumOwnerId).Select(s => s.BankName).FirstOrDefault(),
                    OwnerBankAccount = _context.Stadiums.Where(s => s.OwnerId == w.StadiumOwnerId).Select(s => s.BankAccountNumber).FirstOrDefault(),
                    OwnerAccountName = _context.Stadiums.Where(s => s.OwnerId == w.StadiumOwnerId).Select(s => s.BankAccountName).FirstOrDefault(),
                    w.Amount,
                    w.Status,
                    w.ReceiptImage,
                    w.RequestedAt,
                    w.ProcessedAt
                })
                .ToListAsync();

            return Ok(requests);
        }

        [HttpPut("WithdrawalRequests/{id}/Approve")]
        public async Task<IActionResult> ApproveWithdrawal(int id, [FromForm] ApproveWithdrawalDto dto)
        {
            var request = await _context.Set<WithdrawalRequest>().FindAsync(id);
            if (request == null) return NotFound("Request not found");
            if (request.Status != "Pending") return BadRequest("Request is not pending");

            string? receiptUrl = null;
            if (dto.receiptImage != null && dto.receiptImage.Length > 0)
            {
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(dto.receiptImage.FileName, dto.receiptImage.OpenReadStream()),
                    Folder = "receipts"
                };
                var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                if (uploadResult.Error != null)
                {
                    return BadRequest(new { message = uploadResult.Error.Message });
                }
                receiptUrl = uploadResult.SecureUrl.ToString();
            }

            request.Status = "Paid";
            request.ProcessedAt = DateTime.Now;
            request.ReceiptImage = receiptUrl;

            await _context.SaveChangesAsync();
            return Ok(request);
        }

        [HttpPut("WithdrawalRequests/{id}/Reject")]
        public async Task<IActionResult> RejectWithdrawal(int id)
        {
            var request = await _context.Set<WithdrawalRequest>().FindAsync(id);
            if (request == null) return NotFound("Request not found");
            if (request.Status != "Pending") return BadRequest("Request is not pending");

            request.Status = "Rejected";
            request.ProcessedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(request);
        }
        // ============================================================
        // 10. FEEDBACK MANAGEMENT
        // ============================================================

        [HttpGet("feedbacks")]
        public async Task<IActionResult> GetFeedbacks([FromQuery] string? status, [FromQuery] int page = 1)
        {
            var query = _context.Set<Feedback>().Include(f => f.User).AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(f => f.Status == status);
            }

            var totalItems = await query.CountAsync();
            var feedbacks = await query
                .OrderByDescending(f => f.CreatedAt)
                .Skip((page - 1) * PageSize)
                .Take(PageSize)
                .Select(f => new
                {
                    f.FeedbackId,
                    f.Category,
                    f.Content,
                    f.Status,
                    f.CreatedAt,
                    f.UserId,
                    User = f.User != null ? new { f.User.FullName, f.User.Username } : null
                })
                .ToListAsync();

            return Ok(CreatePaginatedResponse(feedbacks, totalItems, page));
        }

        public class UpdateFeedbackStatusDto
        {
            public string Status { get; set; } = string.Empty;
        }

        [HttpPut("feedbacks/{id}/status")]
        public async Task<IActionResult> UpdateFeedbackStatus(int id, [FromBody] UpdateFeedbackStatusDto dto)
        {
            var feedback = await _context.Set<Feedback>().FindAsync(id);
            if (feedback == null) return NotFound(new { message = "Feedback not found." });

            feedback.Status = dto.Status;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Status updated successfully.", feedback });
        }

        [HttpPost("RemindCommissions")]
        public async Task<IActionResult> RemindCommissions()
        {
            var hubContext = HttpContext.RequestServices.GetService<Microsoft.AspNetCore.SignalR.IHubContext<FInd_Op_Web.Hubs.NotificationHub>>();
            var unpaidCommissions = await _context.BookingCommissions
                .Where(c => !c.IsPaidToPlatform)
                .GroupBy(c => c.StadiumOwnerId)
                .Select(g => new {
                    OwnerId = g.Key,
                    TotalAmount = g.Sum(c => c.CommissionAmount)
                })
                .ToListAsync();

            int count = 0;
            foreach(var item in unpaidCommissions)
            {
                if (item.TotalAmount > 0)
                {
                    var notif = new Notification
                    {
                        UserId = item.OwnerId,
                        Title = "Nhắc nhở nộp hoa hồng",
                        Message = $"Hôm nay là mùng 1. Vui lòng thanh toán số tiền hoa hồng còn nợ hệ thống là: {item.TotalAmount:N0} VNĐ. Cảm ơn bạn!",
                        CreatedAt = DateTime.Now,
                        IsRead = false
                    };
                    _context.Notifications.Add(notif);
                    count++;
                    
                    if (hubContext != null)
                    {
                        var connId = FInd_Op_Web.Hubs.NotificationHub.GetConnectionIdForUser(item.OwnerId.ToString());
                        if (!string.IsNullOrEmpty(connId))
                        {
                            await hubContext.Clients.Client(connId).SendAsync("ReceiveNotification", notif.Message);
                        }
                    }
                }
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã gửi nhắc nhở cho {count} chủ sân." });
        }
    }
}
