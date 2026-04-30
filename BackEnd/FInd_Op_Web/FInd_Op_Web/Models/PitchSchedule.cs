using System;
using System.Collections.Generic;

namespace FInd_Op_Web.Models;

public partial class PitchSchedule
{
    public int ScheduleId { get; set; }

    public int? PitchId { get; set; }

    public int? BookedById { get; set; }

    public int? RecurringId { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    public string? ScheduleStatus { get; set; }

    public virtual User? BookedBy { get; set; }

    public virtual ICollection<Match> Matches { get; set; } = new List<Match>();

    public virtual Pitch? Pitch { get; set; }

    public virtual RecurringBooking? Recurring { get; set; }
}
