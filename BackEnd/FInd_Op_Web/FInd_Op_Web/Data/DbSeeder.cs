using System.Linq;
using FInd_Op_Web.Models;

namespace FInd_Op_Web.Data
{
    public static class DbSeeder
    {
        public static void Seed(ApplicationDbContext context)
        {
            // Add Sports if not exist
            var defaultSports = new[] {
                new Sport { SportName = "Bóng đá", Icon = "⚽", ScoringFormat = "Goals" },
                new Sport { SportName = "Bóng rổ", Icon = "🏀", ScoringFormat = "Goals" },
                new Sport { SportName = "Cầu lông", Icon = "🏸", ScoringFormat = "Sets" },
                new Sport { SportName = "Bóng bàn", Icon = "🏓", ScoringFormat = "Sets" },
                new Sport { SportName = "Pickleball", Icon = "🏓", ScoringFormat = "Sets" },
                new Sport { SportName = "Tennis", Icon = "🎾", ScoringFormat = "Sets" },
                new Sport { SportName = "Khác", Icon = "🏆", ScoringFormat = "Goals" }
            };

            foreach (var sport in defaultSports)
            {
                var existing = context.Sports.FirstOrDefault(s => s.SportName == sport.SportName);
                if (existing == null)
                {
                    context.Sports.Add(sport);
                }
                else
                {
                    existing.ScoringFormat = sport.ScoringFormat;
                    existing.Icon = sport.Icon;
                }
            }
            context.SaveChanges();

            // Add roles if not exist
            string[] roles = { "Admin", "StadiumOwner", "Captain", "Player" };
            foreach (var role in roles)
            {
                if (!context.Roles.Any(r => r.RoleName == role))
                {
                    context.Roles.Add(new Role { RoleName = role });
                }
            }
            context.SaveChanges();

            // Add test users
            AddUser(context, "admin", "Admin System", "Admin");
            AddUser(context, "stadiumowner", "Tran Chu San", "StadiumOwner");
            AddUser(context, "captain", "Doi Truong", "Captain");
            AddUser(context, "player", "Cau Thu", "Player");
        }

        private static void AddUser(ApplicationDbContext context, string username, string fullName, string roleName)
        {
            var user = context.Users.FirstOrDefault(u => u.Username == username);
            if (user == null)
            {
                user = new User
                {
                    Username = username,
                    FullName = fullName,
                    Phone = "0987654321",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass12345", 12),
                    IsFreeAgent = false,
                    CreatedAt = System.DateTime.UtcNow
                };
                context.Users.Add(user);
                context.SaveChanges();

                var role = context.Roles.FirstOrDefault(r => r.RoleName == roleName);
                if (role != null)
                {
                    user.Roles.Add(role);
                    context.SaveChanges();
                }
            }
            else
            {
                // Force update password to BCrypt hash if user exists (to fix old plaintext passwords)
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass12345", 12);
                context.SaveChanges();
            }
        }
    }
}
