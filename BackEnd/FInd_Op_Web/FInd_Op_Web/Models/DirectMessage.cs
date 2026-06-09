using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FInd_Op_Web.Models
{
    public class DirectMessage
    {
        [Key]
        public int MessageId { get; set; }

        public int SenderId { get; set; }
        
        public int ReceiverId { get; set; }

        [Required]
        public string Content { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public bool IsRead { get; set; } = false;

        [ForeignKey("SenderId")]
        [JsonIgnore]
        public virtual User? Sender { get; set; }

        [ForeignKey("ReceiverId")]
        [JsonIgnore]
        public virtual User? Receiver { get; set; }
    }
}
