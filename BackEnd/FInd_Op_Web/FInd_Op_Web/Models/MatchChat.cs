using System;

namespace FInd_Op_Web.Models
{
    public class MatchChat
    {
        public int ChatId { get; set; }
        public int MatchId { get; set; }
        public int SenderTeamId { get; set; } // The team that sent the message
        
        // This will store the ENCRYPTED message content
        public string EncryptedMessage { get; set; } = null!;
        
        public DateTime SentAt { get; set; }

        public virtual Match? Match { get; set; }
        public virtual Team? SenderTeam { get; set; }
    }
}
