using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FInd_Op_Web.Models;

public partial class Team
{
    public int TeamId { get; set; }

    public string TeamName { get; set; } = null!;

    public int? CaptainId { get; set; }

    public int? SportId { get; set; }

    public string? QualityLevel { get; set; }

    public string? History { get; set; }

    public bool? IsDisbanded { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string? HomeArea { get; set; }

    public DateTime? FoundedDate { get; set; }

    public bool? LookingForOpponent { get; set; }

    [StringLength(500)]
    public string? LogoUrl { get; set; }

    public string? BackgroundUrl { get; set; }

    public bool IsSubscriptionActive { get; set; } = false;

    public DateTime? SubscriptionEndDate { get; set; }

    public decimal? FundBalance { get; set; } = 0;

    public bool? IsFundUnlocked { get; set; } = false;

    public int RankingScore { get; set; } = 0;

    public int Points { get; set; } = 0;

    public int FairplayScore { get; set; } = 100;

    public int FairplayWarnings { get; set; } = 0;

    public string? RankingTier { get; set; }

    public bool IsInternal { get; set; } = false;

    public virtual User? Captain { get; set; }

    public virtual Sport? Sport { get; set; }

    public virtual ICollection<Match> MatchAwayTeams { get; set; } = new List<Match>();

    public virtual ICollection<Match> MatchCancelRequestedByNavigations { get; set; } = new List<Match>();

    public virtual ICollection<Match> MatchHomeTeams { get; set; } = new List<Match>();

    public virtual ICollection<RecruitmentAd> RecruitmentAds { get; set; } = new List<RecruitmentAd>();

    public virtual ICollection<RecurringBooking> RecurringBookings { get; set; } = new List<RecurringBooking>();

    public virtual ICollection<TeamMember> TeamMembers { get; set; } = new List<TeamMember>();

    public virtual ICollection<TeamRating> RatedTeamRatings { get; set; } = new List<TeamRating>();
    
    public virtual ICollection<TeamRating> ReviewerTeamRatings { get; set; } = new List<TeamRating>();

    public virtual ICollection<TournamentTeam> TournamentTeams { get; set; } = new List<TournamentTeam>();
}
