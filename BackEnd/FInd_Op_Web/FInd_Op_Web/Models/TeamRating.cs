using System;
using System.ComponentModel.DataAnnotations;

namespace FInd_Op_Web.Models
{
    public class TeamRating
    {
        [Key]
        public int RatingId { get; set; }
        public int RatedTeamId { get; set; }
        public int ReviewerTeamId { get; set; }
        public int MatchId { get; set; }
        public int Score { get; set; } // 1-5 sao
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public virtual Team? RatedTeam { get; set; }
        public virtual Team? ReviewerTeam { get; set; }
        public virtual Match? Match { get; set; }
    }
}
