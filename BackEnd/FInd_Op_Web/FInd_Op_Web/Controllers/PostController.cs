using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FInd_Op_Web.Data;
using FInd_Op_Web.Models;

namespace FInd_Op_Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PostController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // DTOs
        // ==========================================
        public class CreatePostDto
        {
            public string Title { get; set; } = string.Empty;
            public string Content { get; set; } = string.Empty;
            public string PostType { get; set; } = "Recruitment"; // Recruitment, News, Challenge, Advertisement
            public int? TeamId { get; set; }
            public string? ImageUrls { get; set; }
        }

        public class UpdatePostDto
        {
            public string Title { get; set; } = string.Empty;
            public string Content { get; set; } = string.Empty;
            public string? ImageUrls { get; set; }
        }

        // ==========================================
        // GET ENDPOINTS
        // ==========================================
        
        [HttpGet]
        public async Task<IActionResult> GetPosts([FromQuery] string? type, [FromQuery] int page = 1)
        {
            int pageSize = 10;
            var query = _context.Posts
                .Include(p => p.Author)
                .Include(p => p.Team)
                .Where(p => p.Status == "Approved"); // Only fetch approved posts for the feed

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(p => p.PostType == type);
            }

            var totalItems = await query.CountAsync();
            var posts = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    p.PostId,
                    p.Title,
                    p.Content,
                    p.PostType,
                    p.CreatedAt,
                    p.UpdatedAt,
                    p.ImageUrls,
                    Author = p.Author != null ? new { p.Author.UserId, p.Author.FullName, p.Author.Username } : null,
                    Team = p.Team != null ? new { p.Team.TeamId, p.Team.TeamName } : null
                })
                .ToListAsync();

            return Ok(new
            {
                items = posts,
                totalItems,
                currentPage = page,
                totalPages = (int)Math.Ceiling((double)totalItems / pageSize),
                pageSize
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPost(int id)
        {
            var post = await _context.Posts
                .Include(p => p.Author)
                .Include(p => p.Team)
                .Where(p => p.PostId == id)
                .Select(p => new
                {
                    p.PostId,
                    p.Title,
                    p.Content,
                    p.PostType,
                    p.CreatedAt,
                    p.UpdatedAt,
                    p.ImageUrls,
                    Author = p.Author != null ? new { p.Author.UserId, p.Author.FullName, p.Author.Username } : null,
                    Team = p.Team != null ? new { p.Team.TeamId, p.Team.TeamName } : null
                })
                .FirstOrDefaultAsync();

            if (post == null) return NotFound(new { message = "Post not found." });

            return Ok(post);
        }

        // ==========================================
        // WRITE ENDPOINTS (Require Auth)
        // ==========================================
        
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreatePost([FromBody] CreatePostDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var isAdmin = User.IsInRole("Admin");

            var post = new Post
            {
                Title = dto.Title,
                Content = dto.Content,
                PostType = dto.PostType,
                AuthorId = userId,
                TeamId = dto.TeamId ?? 0, // 0 if not team related
                ImageUrls = dto.ImageUrls,
                CreatedAt = DateTime.Now,
                Status = isAdmin ? "Approved" : "Pending" // Admins auto-approve
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPost), new { id = post.PostId }, new { 
                message = isAdmin ? "Bài viết đã được đăng!" : "Bài viết đã được gửi và chờ Admin duyệt.", 
                post 
            });
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePost(int id, [FromBody] UpdatePostDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound(new { message = "Post not found." });

            var isAdmin = User.IsInRole("Admin");

            if (post.AuthorId != userId && !isAdmin)
            {
                return Forbid();
            }

            post.Title = dto.Title;
            post.Content = dto.Content;
            if (dto.ImageUrls != null) post.ImageUrls = dto.ImageUrls;
            post.UpdatedAt = DateTime.Now;
            
            // Optional: Re-eval status on edit?
            // post.Status = isAdmin ? "Approved" : "Pending";

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật bài viết thành công." });
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound(new { message = "Post not found." });

            var isAdmin = User.IsInRole("Admin");

            if (post.AuthorId != userId && !isAdmin)
            {
                return Forbid();
            }

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa bài viết." });
        }
    }
}
