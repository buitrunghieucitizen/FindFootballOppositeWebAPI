using System;
namespace FInd_Op_Web.Models
{
    public class PlayerRating {
        public int RatingId { get; set; }
        public int PlayerId { get; set; }
        public int RatedById { get; set; }
        public int? TeamId { get; set; }
        public int Score { get; set; } // 1-5
        public int Month { get; set; }
        public int Year { get; set; }
        public string? Comment { get; set; }
        
        public virtual User? Player { get; set; }
        public virtual User? RatedBy { get; set; }
        public virtual Team? Team { get; set; }
        public int? MatchId { get; set; }
        public virtual Match? Match { get; set; }
    }
}
