using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FInd_Op_Web.Models;

public partial class Match
{
    public int MatchId { get; set; }

    public int? HomeTeamId { get; set; }

    public int? AwayTeamId { get; set; }

    public int? HomePlayerId { get; set; }

    public int? AwayPlayerId { get; set; }

    public bool IsIndividualMatch { get; set; } = false;

    public int? SportId { get; set; }

    public int? ScheduleId { get; set; }

    public int? TournamentId { get; set; }
    
    public string? TournamentStage { get; set; }

    public string? MatchStatus { get; set; }

    public int? CancelRequestedBy { get; set; }

    public string? CancelReason { get; set; }

    public int? HomeScore { get; set; }

    public int? AwayScore { get; set; }

    [MaxLength(100)]
    public string? SetScores { get; set; }

    public string? ResultVisibility { get; set; } = "Public";

    public bool? HomeConfirmed { get; set; }

    public bool? AwayConfirmed { get; set; }

    public DateTime? ExpiresAt { get; set; }

    public string? MatchType { get; set; } = "Friendly";

    public DateTime? MatchDate { get; set; }
    public TimeSpan? StartTime { get; set; }
    public TimeSpan? EndTime { get; set; }
    public string? Location { get; set; }
    public string? Notes { get; set; }
    public string? BookingType { get; set; }
    public int? DurationMinutes { get; set; }
    public bool? HasExtraTime { get; set; }
    public int? PitchId { get; set; }

    public virtual Team? AwayTeam { get; set; }

    public virtual Team? CancelRequestedByNavigation { get; set; }

    public virtual Team? HomeTeam { get; set; }

    public virtual User? HomePlayer { get; set; }

    public virtual User? AwayPlayer { get; set; }

    public virtual ICollection<MatchPoll> MatchPolls { get; set; } = new List<MatchPoll>();

    public virtual ICollection<RecruitmentAd> RecruitmentAds { get; set; } = new List<RecruitmentAd>();

    public virtual PitchSchedule? Schedule { get; set; }

    public virtual Sport? Sport { get; set; }

    public virtual Tournament? Tournament { get; set; }
}
