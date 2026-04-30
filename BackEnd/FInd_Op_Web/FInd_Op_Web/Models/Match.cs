using System;
using System.Collections.Generic;

namespace FInd_Op_Web.Models;

public partial class Match
{
    public int MatchId { get; set; }

    public int? HomeTeamId { get; set; }

    public int? AwayTeamId { get; set; }

    public int? ScheduleId { get; set; }

    public string? MatchStatus { get; set; }

    public int? CancelRequestedBy { get; set; }

    public string? CancelReason { get; set; }

    public virtual Team? AwayTeam { get; set; }

    public virtual Team? CancelRequestedByNavigation { get; set; }

    public virtual Team? HomeTeam { get; set; }

    public virtual ICollection<MatchPoll> MatchPolls { get; set; } = new List<MatchPoll>();

    public virtual ICollection<RecruitmentAd> RecruitmentAds { get; set; } = new List<RecruitmentAd>();

    public virtual PitchSchedule? Schedule { get; set; }
}
