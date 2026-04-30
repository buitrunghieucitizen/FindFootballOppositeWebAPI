using System;
using System.Collections.Generic;

namespace FInd_Op_Web.Models;

public partial class RecurringBooking
{
    public int RecurringId { get; set; }

    public int? PitchId { get; set; }

    public int? TeamId { get; set; }

    public int DayOfWeek { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public DateOnly FromDate { get; set; }

    public DateOnly ToDate { get; set; }

    public bool? IsApproved { get; set; }

    public virtual Pitch? Pitch { get; set; }

    public virtual ICollection<PitchSchedule> PitchSchedules { get; set; } = new List<PitchSchedule>();

    public virtual Team? Team { get; set; }
}
