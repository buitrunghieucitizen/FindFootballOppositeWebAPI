using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FInd_Op_Web.Models
{
    public class WithdrawalRequest
    {
        [Key]
        public int RequestId { get; set; }

        public int StadiumOwnerId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, Paid, Rejected

        [MaxLength(255)]
        public string? ReceiptImage { get; set; }

        public DateTime RequestedAt { get; set; } = DateTime.Now;

        public DateTime? ProcessedAt { get; set; }

        public virtual User? StadiumOwner { get; set; }
    }
}
