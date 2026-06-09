using System;
namespace FInd_Op_Web.Models
{
    public class Post {
        public int PostId { get; set; }
        public int TeamId { get; set; }
        public int AuthorId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int? MatchId { get; set; }
        public string? ImageUrls { get; set; }
        public string PostType { get; set; } = "Recruitment"; // Recruitment, News, Challenge
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
        
        public virtual Team? Team { get; set; }
        public virtual User? Author { get; set; }
        public virtual Match? Match { get; set; }
    }
}
