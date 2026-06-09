using System;
using System.ComponentModel.DataAnnotations;

namespace FInd_Op_Web.Models
{
    public class MatchRequest
    {
        [Key]
        public int RequestId { get; set; }
        
        public int MatchId { get; set; }
        public int RequestingTeamId { get; set; }
        
        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, Accepted, Rejected
        
        [MaxLength(500)]
        public string? Message { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public virtual Match? Match { get; set; }
        public virtual Team? RequestingTeam { get; set; }
    }
}
