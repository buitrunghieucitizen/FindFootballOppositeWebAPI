using System;
using System.ComponentModel.DataAnnotations;

namespace FInd_Op_Web.Models;

/// <summary>
/// Phí tạo giải đấu - thu phí khi organizer tạo giải
/// </summary>
public class TournamentFee
{
    [Key]
    public int FeeId { get; set; }

    public int TournamentId { get; set; }

    public int PaidByUserId { get; set; }

    public decimal Amount { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Paid, Refunded

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public virtual Tournament Tournament { get; set; } = null!;

    public virtual User PaidByUser { get; set; } = null!;
}
