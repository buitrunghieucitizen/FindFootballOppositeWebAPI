using System;
namespace FInd_Op_Web.Models
{
    public class JoinRequest {
        public int RequestId { get; set; }
        public int PlayerId { get; set; }
        public int TeamId { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Accepted, Rejected
        public string RequestType { get; set; } = "PlayerToTeam";
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? ProcessedAt { get; set; }
        
        public virtual User? Player { get; set; }
        public virtual Team? Team { get; set; }
    }
}
