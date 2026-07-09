namespace FInd_Op_Web.Models;

public sealed class PortalHubViewModel
{
    public string SeasonLabel { get; init; } = string.Empty;
    public PortalMetricsViewModel Metrics { get; init; } = new();
    public IReadOnlyList<ActorCapabilityViewModel> ActorCapabilities { get; init; } = Array.Empty<ActorCapabilityViewModel>();
    public IReadOnlyList<PlayerCardViewModel> Players { get; init; } = Array.Empty<PlayerCardViewModel>();
    public IReadOnlyList<TeamCardViewModel> Teams { get; init; } = Array.Empty<TeamCardViewModel>();
    public IReadOnlyList<StadiumCardViewModel> Stadiums { get; init; } = Array.Empty<StadiumCardViewModel>();
    public IReadOnlyList<RecurringBookingCardViewModel> RecurringBookings { get; init; } = Array.Empty<RecurringBookingCardViewModel>();
    public IReadOnlyList<ScheduleCardViewModel> UpcomingSchedules { get; init; } = Array.Empty<ScheduleCardViewModel>();
    public IReadOnlyList<MatchCardViewModel> Matches { get; init; } = Array.Empty<MatchCardViewModel>();
    public IReadOnlyList<RecruitmentAdCardViewModel> RecruitmentAds { get; init; } = Array.Empty<RecruitmentAdCardViewModel>();
    public IReadOnlyList<NotificationCardViewModel> Notifications { get; init; } = Array.Empty<NotificationCardViewModel>();
}

public sealed class PortalMetricsViewModel
{
    public int TeamCount { get; init; }
    public int PlayerCount { get; init; }
    public int FreeAgentCount { get; init; }
    public int StadiumCount { get; init; }
    public int PitchCount { get; init; }
    public int UpcomingMatchCount { get; init; }
    public int ActiveRecruitmentCount { get; init; }
}

public sealed class ActorCapabilityViewModel
{
    public string ActorName { get; init; } = string.Empty;
    public string Summary { get; init; } = string.Empty;
    public IReadOnlyList<string> Capabilities { get; init; } = Array.Empty<string>();
}

public sealed class PlayerCardViewModel
{
    public int UserId { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string Username { get; init; } = string.Empty;
    public string PreferredPosition { get; init; } = string.Empty;
    public string ActiveArea { get; init; } = string.Empty;
    public string AvailabilityNote { get; init; } = string.Empty;
    public string TeamName { get; init; } = string.Empty;
    public bool IsFreeAgent { get; init; }
    public IReadOnlyList<string> Roles { get; init; } = Array.Empty<string>();
}

public sealed class TeamCardViewModel
{
    public int TeamId { get; init; }
    public string TeamName { get; init; } = string.Empty;
    public string CaptainName { get; init; } = string.Empty;
    public string QualityLevel { get; init; } = string.Empty;
    public string History { get; init; } = string.Empty;
    public string HomeArea { get; init; } = string.Empty;
    public string RecentForm { get; init; } = string.Empty;
    public bool LookingForOpponent { get; init; }
    public IReadOnlyList<string> Members { get; init; } = Array.Empty<string>();
}

public sealed class StadiumCardViewModel
{
    public int StadiumId { get; init; }
    public string StadiumName { get; init; } = string.Empty;
    public string OwnerName { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string UtilizationLabel { get; init; } = string.Empty;
    public IReadOnlyList<PitchCardViewModel> Pitches { get; init; } = Array.Empty<PitchCardViewModel>();
}

public sealed class PitchCardViewModel
{
    public int PitchId { get; init; }
    public string PitchName { get; init; } = string.Empty;
    public int PitchSize { get; init; }
    public decimal PricePerSlot { get; init; }
    public string AvailabilityLabel { get; init; } = string.Empty;
}

public sealed class RecurringBookingCardViewModel
{
    public string TeamName { get; init; } = string.Empty;
    public string PitchName { get; init; } = string.Empty;
    public string WeeklySlot { get; init; } = string.Empty;
    public string DateRange { get; init; } = string.Empty;
    public bool IsApproved { get; init; }
}

public sealed class ScheduleCardViewModel
{
    public string PitchName { get; init; } = string.Empty;
    public string BookedByName { get; init; } = string.Empty;
    public string WindowLabel { get; init; } = string.Empty;
    public string TypeLabel { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
}

public sealed class MatchCardViewModel
{
    public int MatchId { get; init; }
    public string HomeTeamName { get; init; } = string.Empty;
    public string AwayTeamName { get; init; } = string.Empty;
    public string MatchStatus { get; init; } = string.Empty;
    public string VenueLabel { get; init; } = string.Empty;
    public string KickoffLabel { get; init; } = string.Empty;
    public string AttendanceSummary { get; init; } = string.Empty;
    public string CancelFlowSummary { get; init; } = string.Empty;
    public string BookingSummary { get; init; } = string.Empty;
}

public sealed class RecruitmentAdCardViewModel
{
    public int AdId { get; init; }
    public string TeamName { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Content { get; init; } = string.Empty;
    public string PositionNeeded { get; init; } = string.Empty;
    public string MatchLabel { get; init; } = string.Empty;
    public string UrgencyLabel { get; init; } = string.Empty;
}

public sealed class NotificationCardViewModel
{
    public string RecipientName { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string RelatedLink { get; init; } = string.Empty;
}
