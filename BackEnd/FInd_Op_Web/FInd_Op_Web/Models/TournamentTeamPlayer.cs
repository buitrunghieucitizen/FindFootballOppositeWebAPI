using System;

namespace FInd_Op_Web.Models
{
    public class TournamentTeamPlayer
    {
        [System.ComponentModel.DataAnnotations.Key]
        public int Id { get; set; }
        
        public int TournamentId { get; set; }
        public int TeamId { get; set; }
        public int PlayerId { get; set; }

        public virtual Tournament? Tournament { get; set; }
        public virtual Team? Team { get; set; }
        public virtual User? Player { get; set; }
    }
}
