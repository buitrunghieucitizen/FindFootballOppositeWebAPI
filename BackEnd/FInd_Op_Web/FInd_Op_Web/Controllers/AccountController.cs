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

        [HttpPost]
                public async Task<IActionResult> Login(string username, string password, string userRole)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(userRole))
            {
                ModelState.AddModelError("", "Vui lòng nhập đầy đủ tên đăng nhập, mật khẩu và chọn vai trò");
                return Ok(new { view = "~/Views/Home/Authentication/Login.cshtml" });
            }

            var user = await _authService.LoginAsync(username, password, userRole);

            if (user == null)
            {
                ModelState.AddModelError("", "Tên đăng nhập, mật khẩu hoặc vai trò không đúng");
                return Ok(new { view = "~/Views/Home/Authentication/Login.cshtml" });
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

        [HttpGet]
        public IActionResult Register()
        {
            if (User.Identity.IsAuthenticated)
                return Ok();

            return Ok(new { view = "~/Views/Home/Authentication/Register.cshtml" });
        }

        [HttpPost]
                public async Task<IActionResult> Register(string username, string fullName, string phone, string password, string confirmPassword, string userRole)
        {
            if (password != confirmPassword)
            {
                ModelState.AddModelError("", "Mật khẩu xác nhận không khớp");
                return Ok(new { view = "~/Views/Home/Authentication/Register.cshtml" });
            }

            var user = await _authService.RegisterAsync(username, fullName, phone, password, userRole ?? "Player");

            if (user == null)
            {
                ModelState.AddModelError("", "Tên đăng nhập đã tồn tại hoặc thông tin không hợp lệ");
                return Ok(new { view = "~/Views/Home/Authentication/Register.cshtml" });
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, userRole ?? "Player")
            };

            var token = GenerateJwtToken(claims);
            return Ok(new { token = token, role = userRole ?? "Player", username = user.FullName });
        }

        [HttpPost]
                public async Task<IActionResult> Logout()
        {
            // For JWT, logout is usually handled on the client side by deleting the token.
            return Ok(new { message = "Đăng xuất thành công. Vui lòng xóa token trên client." });
        }
    }
}
