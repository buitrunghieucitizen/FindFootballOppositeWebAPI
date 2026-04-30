using System;
using System.Collections.Generic;

namespace FInd_Op_Web.Models;

public partial class Team
{
    public int TeamId { get; set; }

    public string TeamName { get; set; } = null!;

    public int? CaptainId { get; set; }

    public string? QualityLevel { get; set; }

    public string? History { get; set; }

    public bool? IsDisbanded { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? Captain { get; set; }

    public virtual ICollection<Match> MatchAwayTeams { get; set; } = new List<Match>();

    public virtual ICollection<Match> MatchCancelRequestedByNavigations { get; set; } = new List<Match>();

    public virtual ICollection<Match> MatchHomeTeams { get; set; } = new List<Match>();

    public virtual ICollection<RecruitmentAd> RecruitmentAds { get; set; } = new List<RecruitmentAd>();

    public virtual ICollection<RecurringBooking> RecurringBookings { get; set; } = new List<RecurringBooking>();

    public virtual ICollection<TeamMember> TeamMembers { get; set; } = new List<TeamMember>();
}
