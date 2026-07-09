using System;
using System.Collections.Generic;
namespace FInd_Op_Web.Models
{
    public class Tournament
    {
        public int TournamentId { get; set; }
        public string TournamentName { get; set; } = string.Empty;
        public string? Format { get; set; } // League, Knockout, GroupStage
        public int? SportId { get; set; }
        public int? StadiumId { get; set; }
        public int? OrganizerId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Status { get; set; } = "Upcoming"; // Upcoming, InProgress, Completed
        public string? Scope { get; set; } = "Public"; // Public, Internal
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public int? MaxPlayersPerTeam { get; set; }

        public bool IsFeePaid { get; set; } = false;

        public int MaxTeams { get; set; } = 4;
        public string? BankQrCodeUrl { get; set; }
        public decimal? EntryFee { get; set; }
        public string? BracketJson { get; set; }

        // New Verification & Approval Fields
        public string? OrganizerCccd { get; set; }
        public string? OrganizerDriverLicense { get; set; }
        public string ApprovalStatus { get; set; } = "Pending"; // Pending, Approved, Rejected
        public string? RefundStatus { get; set; } // Requested, AdminRefunded, Completed

        public virtual Stadium? Stadium { get; set; }
        public virtual User? Organizer { get; set; }
        public virtual Sport? Sport { get; set; }

        public virtual ICollection<TournamentTeam> TournamentTeams { get; set; } = new List<TournamentTeam>();
        public virtual ICollection<Match> Matches { get; set; } = new List<Match>();
    }
}
