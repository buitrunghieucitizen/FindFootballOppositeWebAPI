using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FInd_Op_Web.Models
{
    public class SystemInvoice
    {
        [Key]
        public int InvoiceId { get; set; }

        public int StadiumOwnerId { get; set; }

        public int Month { get; set; }
        
        public int Year { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalRevenue { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalCommission { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPayableToOwner { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Generated"; // Generated, Sent, Paid

        [MaxLength(255)]
        public string? PdfUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public virtual User? StadiumOwner { get; set; }
    }
}
