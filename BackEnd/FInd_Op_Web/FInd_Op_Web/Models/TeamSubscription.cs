using System;
using System.ComponentModel.DataAnnotations;

namespace FInd_Op_Web.Models;

/// <summary>
/// Phí hoạt động hàng tháng cho đội bóng
/// </summary>
public class TeamSubscription
{
    [Key]
    public int SubscriptionId { get; set; }

    public int TeamId { get; set; }

    public int PaidByUserId { get; set; }

    public decimal Amount { get; set; }

    [MaxLength(50)]
    public string PlanType { get; set; } = "Basic"; // Basic, Premium

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Active, Expired, Cancelled

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public virtual Team Team { get; set; } = null!;

    public virtual User PaidByUser { get; set; } = null!;
}
