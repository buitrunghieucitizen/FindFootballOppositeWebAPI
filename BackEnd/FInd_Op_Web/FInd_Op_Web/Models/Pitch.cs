using System;
using System.Collections.Generic;

namespace FInd_Op_Web.Models;

public partial class Pitch
{
    public int PitchId { get; set; }

    public int? StadiumId { get; set; }

    public string? PitchName { get; set; }

    public int? PitchSize { get; set; }

    public decimal PricePerHour { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<PitchSchedule> PitchSchedules { get; set; } = new List<PitchSchedule>();

    public virtual ICollection<RecurringBooking> RecurringBookings { get; set; } = new List<RecurringBooking>();

    public virtual Stadium? Stadium { get; set; }
}
