using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FInd_Op_Web.Models
{
    public class Sport
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SportId { get; set; }

        [Required]
        [StringLength(100)]
        public string SportName { get; set; }

        [StringLength(50)]
        public string? Icon { get; set; }

        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;

        public bool HasScoring { get; set; } = true;

        [StringLength(20)]
        public string ScoringFormat { get; set; } = "Goals"; // "Goals" or "Sets"
    }
}
