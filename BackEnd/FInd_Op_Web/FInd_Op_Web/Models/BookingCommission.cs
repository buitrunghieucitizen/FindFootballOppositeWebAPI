using System;
using System.ComponentModel.DataAnnotations;

namespace FInd_Op_Web.Models;

/// <summary>
/// Hoa hồng đặt sân - Platform thu % hoa hồng mỗi lần đặt sân thành công
/// </summary>
public class BookingCommission
{
    [Key]
    public int CommissionId { get; set; }

    public int ScheduleId { get; set; }

    public int StadiumOwnerId { get; set; }

    public decimal BookingAmount { get; set; }

    public decimal CommissionRate { get; set; }

    public decimal CommissionAmount { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Collected, Paid

    public bool IsPaidToPlatform { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public virtual PitchSchedule Schedule { get; set; } = null!;

    public virtual User StadiumOwner { get; set; } = null!;
}
