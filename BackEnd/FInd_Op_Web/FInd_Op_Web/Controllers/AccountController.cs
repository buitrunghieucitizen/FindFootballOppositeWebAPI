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

        public AccountController(Services.IAuthenticationService authService, IConfiguration configuration)
        {
            _authService = authService;
            _configuration = configuration;
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
            public string UserRole { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.UserRole))
            {
                ModelState.AddModelError("", "Vui lòng nhập đầy đủ tên đăng nhập, mật khẩu và chọn vai trò");
                return BadRequest(ModelState);
            }

            var user = await _authService.LoginAsync(request.Username, request.Password, request.UserRole);

            if (user == null)
            {
                ModelState.AddModelError("", "Tên đăng nhập, mật khẩu hoặc vai trò không đúng");
                return Unauthorized(new { message = "Tên đăng nhập, mật khẩu hoặc vai trò không đúng" });
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, request.UserRole)
            };

            var token = GenerateJwtToken(claims);
            return Ok(new { token = token, role = request.UserRole, username = user.FullName });
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
            public string UserRole { get; set; }
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
                public async Task<IActionResult> Logout()
        {
            // For JWT, logout is usually handled on the client side by deleting the token.
            return Ok(new { message = "Đăng xuất thành công. Vui lòng xóa token trên client." });
        }
    }
}
