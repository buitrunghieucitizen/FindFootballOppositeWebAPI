using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FInd_Op_Web.Models
{
    public class Feedback
    {
        [Key]
        public int FeedbackId { get; set; }

        public int? UserId { get; set; }

        [Required]
        [StringLength(50)]
        public string Category { get; set; }

        [Required]
        public string Content { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [StringLength(50)]
        public string Status { get; set; } = "New";

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
