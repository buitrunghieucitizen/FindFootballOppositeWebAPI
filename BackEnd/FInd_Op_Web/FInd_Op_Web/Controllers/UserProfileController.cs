using FInd_Op_Web.DTOs;
using FInd_Op_Web.Data;
using FInd_Op_Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.RegularExpressions;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace FInd_Op_Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly Cloudinary _cloudinary;

        public UserProfileController(ApplicationDbContext context, Cloudinary cloudinary)
        {
            _context = context;
            _cloudinary = cloudinary;
        }

        // ======================== DTO Classes ========================



        // ======================== Endpoints ========================

        [HttpGet("notifications")]
        public async Task<IActionResult> GetNotifications()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new {
                    n.NotificationId,
                    n.Title,
                    n.Message,
                    n.RelatedLink,
                    n.CreatedAt,
                    n.IsRead
                })
                .ToListAsync();

            return Ok(notifications);
        }



        [HttpPut("notifications/readall")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            var notifications = await _context.Notifications.Where(n => n.UserId == userId && n.IsRead != true).ToListAsync();
            foreach (var n in notifications)
            {
                n.IsRead = true;
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã đánh dấu tất cả đã đọc." });
        }

        [HttpPut("notifications/{id}/read")]
        public async Task<IActionResult> MarkNotificationRead(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.NotificationId == id && n.UserId == userId);
            if (notification != null)
            {
                notification.IsRead = true;
                await _context.SaveChangesAsync();
            }

            return Ok();
        }

        /// <summary>
        /// GET api/UserProfile - Lấy thông tin hồ sơ người dùng hiện tại
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
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

            var userTeams = await _context.TeamMembers
                .Where(tm => tm.PlayerId == userId && tm.Status == "Active")
                .Select(tm => tm.TeamId)
                .ToListAsync();

            var matches = await _context.Matches
                .Include(m => m.HomeTeam)
                .Include(m => m.AwayTeam)
                .Include(m => m.Schedule)
                .Where(m => (m.HomeTeamId != null && userTeams.Contains((int)m.HomeTeamId)) || 
                            (m.AwayTeamId != null && userTeams.Contains((int)m.AwayTeamId)))
                .OrderByDescending(m => m.Schedule != null ? m.Schedule.StartTime : new DateTime(1900, 1, 1))
                .Select(m => new {
                    m.MatchId,
                    m.MatchStatus,
                    HomeTeamName = m.HomeTeam != null ? m.HomeTeam.TeamName : null,
                    AwayTeamName = m.AwayTeam != null ? m.AwayTeam.TeamName : null,
                    m.HomeScore,
                    m.AwayScore,
                    Date = m.Schedule != null ? m.Schedule.StartTime : (DateTime?)null
                })
                .Take(10)
                .ToListAsync();

            return Ok(new
            {
                userId = user.UserId,
                username = user.Username,
                fullName = user.FullName,
                phone = user.Phone,
                isFreeAgent = user.IsFreeAgent,
                createdAt = user.CreatedAt,
                roles = user.Roles.Select(r => r.RoleName).ToList(),
                matchHistory = matches,
                avatarUrl = user.AvatarUrl,
                backgroundUrl = user.BackgroundUrl
            });
        }

        /// <summary>
        /// PUT api/UserProfile - Cập nhật thông tin hồ sơ người dùng hiện tại
        /// </summary>
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Dữ liệu không hợp lệ." });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
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

            // Cập nhật FullName nếu có
            if (!string.IsNullOrWhiteSpace(request.FullName))
            {
                user.FullName = request.FullName.Trim();
            }

            // Cập nhật Phone nếu có
            if (request.Phone != null)
            {
                // Chuẩn hóa số điện thoại: loại bỏ ký tự không phải số
                var normalizedPhone = Regex.Replace(request.Phone, @"[^\d]", "");

                if (string.IsNullOrEmpty(normalizedPhone))
                {
                    // Cho phép xóa số điện thoại
                    user.Phone = null;
                }
                else
                {
                    // Kiểm tra định dạng: 10-11 chữ số
                    if (normalizedPhone.Length < 10 || normalizedPhone.Length > 11)
                    {
                        return BadRequest(new { message = "Số điện thoại phải có 10-11 chữ số." });
                    }

                    // Kiểm tra tính duy nhất của số điện thoại
                    var phoneExists = await _context.Users
                        .AnyAsync(u => u.Phone == normalizedPhone && u.UserId != userId);

                    if (phoneExists)
                    {
                        return BadRequest(new { message = "Số điện thoại này đã được sử dụng bởi tài khoản khác." });
                    }

                    user.Phone = normalizedPhone;
                }
            }

            if (!string.IsNullOrWhiteSpace(request.AvatarUrl))
            {
                user.AvatarUrl = request.AvatarUrl;
            }

            if (!string.IsNullOrWhiteSpace(request.BackgroundUrl))
            {
                user.BackgroundUrl = request.BackgroundUrl;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật hồ sơ thành công.",
                userId = user.UserId,
                username = user.Username,
                fullName = user.FullName,
                phone = user.Phone,
                avatarUrl = user.AvatarUrl,
                isFreeAgent = user.IsFreeAgent,
                createdAt = user.CreatedAt,
                roles = user.Roles.Select(r => r.RoleName).ToList(),
                backgroundUrl = user.BackgroundUrl
            });
        }

        /// <summary>
        /// PUT api/UserProfile/ChangePassword - Đổi mật khẩu
        /// </summary>
        [HttpPut("ChangePassword")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Dữ liệu không hợp lệ." });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return BadRequest(new { message = "Không thể xác định người dùng từ token." });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng." });
            }

            // Xác minh mật khẩu hiện tại
            if (string.IsNullOrWhiteSpace(request.CurrentPassword))
            {
                return BadRequest(new { message = "Vui lòng nhập mật khẩu hiện tại." });
            }

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            {
                return BadRequest(new { message = "Mật khẩu hiện tại không đúng." });
            }

            // Kiểm tra mật khẩu mới
            if (string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new { message = "Vui lòng nhập mật khẩu mới." });
            }

            if (request.NewPassword.Length < 8)
            {
                return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 8 ký tự." });
            }

            if (!Regex.IsMatch(request.NewPassword, @"[A-Z]"))
            {
                return BadRequest(new { message = "Mật khẩu mới phải chứa ít nhất một chữ cái viết hoa." });
            }

            if (!Regex.IsMatch(request.NewPassword, @"[a-z]"))
            {
                return BadRequest(new { message = "Mật khẩu mới phải chứa ít nhất một chữ cái viết thường." });
            }

            if (!Regex.IsMatch(request.NewPassword, @"[0-9]"))
            {
                return BadRequest(new { message = "Mật khẩu mới phải chứa ít nhất một chữ số." });
            }

            // Kiểm tra xác nhận mật khẩu
            if (request.NewPassword != request.ConfirmNewPassword)
            {
                return BadRequest(new { message = "Mật khẩu xác nhận không khớp." });
            }

            // Hash và lưu mật khẩu mới
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, 12);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật mật khẩu thành công." });
        }

        /// <summary>
        /// POST api/UserProfile/UploadAvatar - Upload avatar to Cloudinary
        /// </summary>
        [HttpPost("UploadAvatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded." });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(file.FileName, file.OpenReadStream()),
                Folder = "avatars",
                Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            if (uploadResult.Error != null)
            {
                return BadRequest(new { message = uploadResult.Error.Message });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.AvatarUrl = uploadResult.SecureUrl.ToString();
                await _context.SaveChangesAsync();
            }

            return Ok(new { url = uploadResult.SecureUrl.ToString() });
        }
    }
}
