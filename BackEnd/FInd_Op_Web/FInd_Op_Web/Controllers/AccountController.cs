using FInd_Op_Web.Data;
using FInd_Op_Web.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace FInd_Op_Web.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class AccountController : ControllerBase
    {
        private string GenerateJwtToken(List<Claim> claims)
        {
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

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private readonly Services.IAuthenticationService _authService;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;

        public AccountController(Services.IAuthenticationService authService, IConfiguration configuration, ApplicationDbContext context)
        {
            _authService = authService;
            _configuration = configuration;
            _context = context;
        }

        [HttpGet]
        public IActionResult Login()
        {
            if (User.Identity.IsAuthenticated)
                return Ok();

            return Ok(new { view = "~/Views/Home/Authentication/Login.cshtml" });
        }

        public class LoginRequest
        {
            public string Username { get; set; }
            public string Password { get; set; }
            public string? UserRole { get; set; }
        }

        public class UpdatePublicKeyDto
        {
            public string PublicKey { get; set; }
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> PublicKey([FromBody] UpdatePublicKeyDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("Người dùng không tồn tại");

            user.PublicKey = dto.PublicKey;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật PublicKey thành công" });
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                ModelState.AddModelError("", "Vui lòng nhập đầy đủ tên đăng nhập, mật khẩu");
                return BadRequest(ModelState);
            }

            var user = await _authService.LoginAsync(request.Username, request.Password);

            if (user == null)
            {
                ModelState.AddModelError("", "Tên đăng nhập, mật khẩu không đúng");
                return Unauthorized(new { message = "Tên đăng nhập, mật khẩu không đúng" });
            }

            var userRole = user.Roles?.FirstOrDefault()?.RoleName ?? "Player";

            if (userRole == "Admin")
            {
                if (!user.IsTwoFactorEnabled || string.IsNullOrEmpty(user.TwoFactorSecret))
                {
                    return Ok(new { requiresSetup2FA = true, username = user.Username });
                }
                else
                {
                    return Ok(new { requires2FA = true, username = user.Username });
                }
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.FullName ?? user.Username),
                new Claim(ClaimTypes.Role, userRole)
            };

            var token = GenerateJwtToken(claims);
            return Ok(new { token = token, role = userRole, username = user.FullName ?? user.Username });
        }

        [HttpGet]
        public IActionResult Register()
        {
            if (User.Identity.IsAuthenticated)
                return Ok();

            return Ok(new { view = "~/Views/Home/Authentication/Register.cshtml" });
        }

        public class RegisterRequest
        {
            public string Username { get; set; }
            public string FullName { get; set; }
            public string Phone { get; set; }
            public string Password { get; set; }
            public string ConfirmPassword { get; set; }
            public string? UserRole { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (request == null || request.Password != request.ConfirmPassword)
            {
                ModelState.AddModelError("", "Mật khẩu xác nhận không khớp");
                return BadRequest(new { message = "Mật khẩu xác nhận không khớp" });
            }

            var userRole = string.IsNullOrWhiteSpace(request.UserRole) ? "Player" : request.UserRole;
            var user = await _authService.RegisterAsync(request.Username, request.FullName, request.Phone, request.Password, userRole);

            if (user == null)
            {
                ModelState.AddModelError("", "Tên đăng nhập đã tồn tại hoặc thông tin không hợp lệ");
                return BadRequest(new { message = "Tên đăng nhập đã tồn tại hoặc thông tin không hợp lệ (Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số)" });
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, userRole)
            };

            var token = GenerateJwtToken(claims);
            return Ok(new { token = token, role = userRole, username = user.FullName });
        }

        [HttpPost]
        public async Task<IActionResult> Setup2FA([FromBody] LoginRequest request)
        {
            var user = await _authService.LoginAsync(request.Username, request.Password);
            if (user == null || user.Roles?.FirstOrDefault()?.RoleName != "Admin")
                return Unauthorized(new { message = "Tài khoản không hợp lệ hoặc không phải Admin" });

            var tfa = new Google.Authenticator.TwoFactorAuthenticator();
            var secret = Guid.NewGuid().ToString().Replace("-", "").Substring(0, 10);
            var setupInfo = tfa.GenerateSetupCode("SportifyX", user.Username, secret, false, 3);
            
            var dbUser = await _context.Users.FindAsync(user.UserId);
            dbUser.TwoFactorSecret = secret;
            await _context.SaveChangesAsync();

            return Ok(new { secret = secret, qrCodeUrl = setupInfo.QrCodeSetupImageUrl });
        }

        public class Verify2FARequest
        {
            public string Username { get; set; }
            public string Password { get; set; }
            public string Code { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> Verify2FALogin([FromBody] Verify2FARequest request)
        {
            var user = await _authService.LoginAsync(request.Username, request.Password);
            if (user == null) return Unauthorized(new { message = "Tài khoản không hợp lệ" });

            if (user.Roles?.FirstOrDefault()?.RoleName == "Admin" && !user.IsTwoFactorEnabled)
            {
                var dbUser = await _context.Users.FindAsync(user.UserId);
                dbUser.IsTwoFactorEnabled = true;
                await _context.SaveChangesAsync();
                user.IsTwoFactorEnabled = true;
            }

            var tfa = new Google.Authenticator.TwoFactorAuthenticator();
            bool isCorrectPIN = tfa.ValidateTwoFactorPIN(user.TwoFactorSecret, request.Code);
            if (!isCorrectPIN)
                return BadRequest(new { message = "Mã xác thực không đúng" });

            var userRole = user.Roles?.FirstOrDefault()?.RoleName ?? "Player";
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.FullName ?? user.Username),
                new Claim(ClaimTypes.Role, userRole)
            };
            var token = GenerateJwtToken(claims);
            return Ok(new { token = token, role = userRole, username = user.FullName ?? user.Username });
        }

        [HttpPost]
                public async Task<IActionResult> Logout()
        {
            // For JWT, logout is usually handled on the client side by deleting the token.
            return Ok(new { message = "Đăng xuất thành công. Vui lòng xóa token trên client." });
        }
    }
}
