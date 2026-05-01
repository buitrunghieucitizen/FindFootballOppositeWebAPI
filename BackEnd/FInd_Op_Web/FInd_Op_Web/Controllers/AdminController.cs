using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FInd_Op_Web.Data;
using FInd_Op_Web.Models;

namespace FInd_Op_Web.Controllers
{
    // [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private const int PageSize = 8;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Index()
        {
            return Ok();
        }

        // ============================
        // 1. User Management CRUD
        // ============================
        [HttpGet]
        public async Task<IActionResult> Users(string? search, int page = 1)
        {
            var query = _context.Users.Include(u => u.Roles).AsQueryable();
            
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(u => u.FullName.Contains(search) || u.Username.Contains(search) || u.Phone.Contains(search));
                // ViewBag.Search = search;
            }

            var totalItems = await query.CountAsync();
            var users = await query.OrderBy(u => u.UserId).Skip((page - 1) * PageSize).Take(PageSize).ToListAsync();

            // ViewBag.TotalItems = totalItems;
            // ViewBag.CurrentPage = page;
            // ViewBag.TotalPages = (int)Math.Ceiling((double)totalItems / PageSize);

            return Ok(users);
        }

        [HttpGet]
        public async Task<IActionResult> EditUserRole(int id)
        {
            var user = await _context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null) return NotFound();

            // ViewBag.Roles = await _context.Roles.ToListAsync();
            var userRoles = user.Roles.Select(ur => ur.RoleId).ToList();
            // ViewBag.UserRoleIds = userRoles;

            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> EditUserRole(int id, int[] roleIds)
        {
            var user = await _context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null) return NotFound();

            user.Roles.Clear();

            if (roleIds != null && roleIds.Length > 0)
            {
                var roles = await _context.Roles.Where(r => roleIds.Contains(r.RoleId)).ToListAsync();
                foreach (var r in roles)
                {
                    user.Roles.Add(r);
                }
            }

            await _context.SaveChangesAsync();
            // TempData["SuccessMessage"] = "Cập nhật phân quyền thành công!";
            return Ok();
        }

        [HttpGet]
        public IActionResult CreateUser()
        {
            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser(User user)
        {
            if (ModelState.IsValid)
            {
                user.CreatedAt = DateTime.Now;
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash ?? "Pass12345", 12);
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                // TempData["SuccessMessage"] = "Thêm người dùng thành công!";
                return Ok();
            }
            return Ok(user);
        }

        [HttpGet]
        public async Task<IActionResult> EditUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> EditUser(int id, User user)
        {
            if (id != user.UserId) return NotFound();

            if (ModelState.IsValid)
            {
                var existingUser = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.UserId == id);
                if (existingUser != null)
                {
                    user.PasswordHash = existingUser.PasswordHash;
                }
                
                _context.Update(user);
                await _context.SaveChangesAsync();
                // TempData["SuccessMessage"] = "Cập nhật thông tin người dùng thành công!";
                return Ok();
            }
            return Ok(user);
        }

        [HttpGet]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.UserId == id);
            if (user != null)
            {
                user.Roles.Clear();
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                // TempData["SuccessMessage"] = "Xóa người dùng thành công!";
            }
            return Ok();
        }

        // ============================
        // 2. Team Management CRUD
        // ============================
        [HttpGet]
        public async Task<IActionResult> Teams(string? search, int page = 1)
        {
            var query = _context.Teams.Include(t => t.Captain).AsQueryable();
            
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(t => t.TeamName.Contains(search) || t.QualityLevel.Contains(search));
                // ViewBag.Search = search;
            }

            var totalItems = await query.CountAsync();
            var teams = await query.OrderBy(t => t.TeamId).Skip((page - 1) * PageSize).Take(PageSize).ToListAsync();

            // ViewBag.TotalItems = totalItems;
            // ViewBag.CurrentPage = page;
            // ViewBag.TotalPages = (int)Math.Ceiling((double)totalItems / PageSize);

            return Ok(teams);
        }

        [HttpGet]
        public IActionResult CreateTeam()
        {
            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> CreateTeam(Team team)
        {
            if (ModelState.IsValid)
            {
                team.CreatedAt = DateTime.Now;
                _context.Teams.Add(team);
                await _context.SaveChangesAsync();
                // TempData["SuccessMessage"] = "Thêm đội bóng thành công!";
                return Ok();
            }
            return Ok(team);
        }

        [HttpGet]
        public async Task<IActionResult> EditTeam(int id)
        {
            var team = await _context.Teams.FindAsync(id);
            if (team == null) return NotFound();
            return Ok(team);
        }

        [HttpPost]
        public async Task<IActionResult> EditTeam(int id, Team team)
        {
            if (id != team.TeamId) return NotFound();

            if (ModelState.IsValid)
            {
                _context.Update(team);
                await _context.SaveChangesAsync();
                // TempData["SuccessMessage"] = "Cập nhật đội bóng thành công!";
                return Ok();
            }
            return Ok(team);
        }

        [HttpGet]
        public async Task<IActionResult> DeleteTeam(int id)
        {
            var team = await _context.Teams.FindAsync(id);
            if (team != null)
            {
                _context.Teams.Remove(team);
                await _context.SaveChangesAsync();
                // TempData["SuccessMessage"] = "Xóa đội bóng thành công!";
            }
            return Ok();
        }

        // ============================
        // 3. Stadium Management CRUD
        // ============================
        [HttpGet]
        public async Task<IActionResult> Stadiums(string? search, int page = 1)
        {
            var query = _context.Stadiums.Include(s => s.Owner).AsQueryable();
            
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(s => s.StadiumName.Contains(search) || s.Address.Contains(search));
                // ViewBag.Search = search;
            }

            var totalItems = await query.CountAsync();
            var stadiums = await query.OrderBy(s => s.StadiumId).Skip((page - 1) * PageSize).Take(PageSize).ToListAsync();

            // ViewBag.TotalItems = totalItems;
            // ViewBag.CurrentPage = page;
            // ViewBag.TotalPages = (int)Math.Ceiling((double)totalItems / PageSize);

            return Ok(stadiums);
        }

        [HttpGet]
        public async Task<IActionResult> StadiumDetails(int id)
        {
            var stadium = await _context.Stadiums.Include(s => s.Owner).Include(s => s.Pitches).FirstOrDefaultAsync(s => s.StadiumId == id);
            if (stadium == null) return NotFound();
            return Ok(stadium);
        }

        [HttpGet]
        public IActionResult CreateStadium()
        {
            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> CreateStadium(Stadium stadium)
        {
            if (ModelState.IsValid)
            {
                stadium.CreatedAt = DateTime.Now;
                _context.Stadiums.Add(stadium);
                await _context.SaveChangesAsync();
                // TempData["SuccessMessage"] = "Thêm sân bóng thành công!";
                return Ok();
            }
            return Ok(stadium);
        }

        [HttpGet]
        public async Task<IActionResult> EditStadium(int id)
        {
            var stadium = await _context.Stadiums.FindAsync(id);
            if (stadium == null) return NotFound();
            return Ok(stadium);
        }

        [HttpPost]
        public async Task<IActionResult> EditStadium(int id, Stadium stadium)
        {
            if (id != stadium.StadiumId) return NotFound();

            if (ModelState.IsValid)
            {
                _context.Update(stadium);
                await _context.SaveChangesAsync();
                // TempData["SuccessMessage"] = "Cập nhật sân bóng thành công!";
                return Ok();
            }
            return Ok(stadium);
        }

        [HttpGet]
        public async Task<IActionResult> DeleteStadium(int id)
        {
            var stadium = await _context.Stadiums.FindAsync(id);
            if (stadium != null)
            {
                _context.Stadiums.Remove(stadium);
                await _context.SaveChangesAsync();
                // TempData["SuccessMessage"] = "Xóa sân bóng thành công!";
            }
            return Ok();
        }

        // ============================
        // 4. Match Management CRUD
        // ============================
        [HttpGet]
        public async Task<IActionResult> Matches(string? search, int page = 1)
        {
            var query = _context.Matches.Include(m => m.HomeTeam).Include(m => m.AwayTeam).Include(m => m.Schedule).AsQueryable();
            
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(m => m.MatchStatus.Contains(search) || m.HomeTeam.TeamName.Contains(search) || m.AwayTeam.TeamName.Contains(search));
                // ViewBag.Search = search;
            }

            var totalItems = await query.CountAsync();
            var matches = await query.OrderBy(m => m.MatchId).Skip((page - 1) * PageSize).Take(PageSize).ToListAsync();

            // ViewBag.TotalItems = totalItems;
            // ViewBag.CurrentPage = page;
            // ViewBag.TotalPages = (int)Math.Ceiling((double)totalItems / PageSize);

            return Ok(matches);
        }

        [HttpGet]
        public IActionResult CreateMatch()
        {
            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> CreateMatch(Match match)
        {
            if (ModelState.IsValid)
            {
                _context.Matches.Add(match);
                await _context.SaveChangesAsync();
                // TempData["SuccessMessage"] = "Thêm trận đấu thành công!";
                return Ok();
            }
            return Ok(match);
        }

        [HttpGet]
        public async Task<IActionResult> EditMatch(int id)
        {
            var match = await _context.Matches.FindAsync(id);
            if (match == null) return NotFound();
            return Ok(match);
        }

        [HttpPost]
        public async Task<IActionResult> EditMatch(int id, Match match)
        {
            if (id != match.MatchId) return NotFound();

            if (ModelState.IsValid)
            {
                _context.Update(match);
                await _context.SaveChangesAsync();
                // TempData["SuccessMessage"] = "Cập nhật trận đấu thành công!";
                return Ok();
            }
            return Ok(match);
        }

        [HttpGet]
        public async Task<IActionResult> DeleteMatch(int id)
        {
            var match = await _context.Matches.FindAsync(id);
            if (match != null)
            {
                _context.Matches.Remove(match);
                await _context.SaveChangesAsync();
                // TempData["SuccessMessage"] = "Xóa trận đấu thành công!";
            }
            return Ok();
        }
    }
}
