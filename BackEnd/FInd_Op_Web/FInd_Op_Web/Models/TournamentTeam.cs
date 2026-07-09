using System;

namespace FInd_Op_Web.Models
{
    public class TournamentTeam
    {
        public int TournamentId { get; set; }
        public int TeamId { get; set; }
        
        public DateTime RegistrationDate { get; set; } = DateTime.Now;
        
        // Status of registration: e.g., "Pending", "Approved", "Rejected"
        public string Status { get; set; } = "Pending";

        public bool NoBettingCommitment { get; set; } = false;

        public string? TeamAbbreviation { get; set; }

        public virtual Tournament? Tournament { get; set; }
        public virtual Team? Team { get; set; }
    }
}
