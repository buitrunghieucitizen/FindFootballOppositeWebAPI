using System;
using System.ComponentModel.DataAnnotations;

namespace FInd_Op_Web.Models;

public partial class PaymentTransaction
{
    [Key]
    public int TransactionId { get; set; }

    public int UserId { get; set; }

    public int Amount { get; set; }

    public long OrderCode { get; set; }

    [MaxLength(50)]
    public string TransactionType { get; set; } = "Premium";
    // Types: Premium, BookingCommission, TeamSubscription, AdBoost, TournamentFee

    public int? ReferenceId { get; set; }

    [MaxLength(200)]
    public string? Description { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public virtual User User { get; set; } = null!;
}
