using BCrypt.Net;
using FInd_Op_Web.Data;
using FInd_Op_Web.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace FInd_Op_Web.Services
{
    public interface IAuthenticationService
    {
        Task<User> LoginAsync(string username, string password, string roleName);
        Task<User> RegisterAsync(string username, string fullName, string phone, string password, string roleName);
        Task<bool> VerifyPasswordAsync(string password, string hash);
        string HashPassword(string password);
    }

    public class AuthenticationService : IAuthenticationService
    {
        private readonly ApplicationDbContext _context;
        private const int MinPasswordLength = 8;

        public AuthenticationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User> LoginAsync(string username, string password, string roleName)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(roleName))
                return null;

            var user = await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
                return null;

            if (!await VerifyPasswordAsync(password, user.PasswordHash))
                return null;

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);
            if (role == null)
                return null;

            var userHasRole = user.Roles.Any(r => r.RoleName == roleName);

            if (!userHasRole)
                return null;

            return user;
        }

        public async Task<User> RegisterAsync(string username, string fullName, string phone, string password, string roleName)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(fullName) || 
                string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(roleName))
                return null;

            if (!IsValidPassword(password))
                return null;

            if (!string.IsNullOrWhiteSpace(phone) && !IsValidPhoneNumber(phone))
                return null;

            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);

            if (existingUser != null)
                return null;

            // Create User
            var user = new User
            {
                Username = username,
                FullName = fullName,
                Phone = phone,
                PasswordHash = HashPassword(password),
                IsFreeAgent = false,
                CreatedAt = System.DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync(); // To get the generated UserId

            // Assign Role
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);
            if (role != null)
            {
                user.Roles.Add(role);
                await _context.SaveChangesAsync();
            }

            return user;
        }

        public async Task<bool> VerifyPasswordAsync(string password, string hash)
        {
            try
            {
                return await Task.FromResult(BCrypt.Net.BCrypt.Verify(password, hash));
            }
            catch (System.Exception ex) when (ex.Message.Contains("Invalid salt version") || ex is BCrypt.Net.SaltParseException)
            {
                // Xảy ra khi dữ liệu giả định trong DB không phải là BCrypt hash hợp lệ (VD: 'hash_123')
                return false;
            }
        }

        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, 12);
        }

        private bool IsValidPassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password) || password.Length < MinPasswordLength)
                return false;

            bool hasUpperCase = password.Any(char.IsUpper);
            bool hasLowerCase = password.Any(char.IsLower);
            bool hasDigit = password.Any(char.IsDigit);

            return hasUpperCase && hasLowerCase && hasDigit;
        }

        private bool IsValidPhoneNumber(string phone)
        {
            string digitsOnly = new string(phone.Where(char.IsDigit).ToArray());
            return digitsOnly.Length >= 10 && digitsOnly.Length <= 11;
        }
    }
}
