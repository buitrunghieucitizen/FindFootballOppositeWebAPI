using System;
using System.ComponentModel.DataAnnotations;

namespace FInd_Op_Web.Models;

/// <summary>
/// Phí boost quảng cáo/bài đăng lên top hiển thị ưu tiên
/// </summary>
public class AdBoost
{
    [Key]
    public int BoostId { get; set; }

    public int? RecruitmentAdId { get; set; }

    public int? PostId { get; set; }

    public int BoostedByUserId { get; set; }

    public decimal Amount { get; set; }

    public DateTime BoostStartDate { get; set; }

    public DateTime BoostEndDate { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Active, Expired

    public bool IsPriority { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public virtual RecruitmentAd? RecruitmentAd { get; set; }

    public virtual Post? Post { get; set; }

    public virtual User BoostedByUser { get; set; } = null!;
}
