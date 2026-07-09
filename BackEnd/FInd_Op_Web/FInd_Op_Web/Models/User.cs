using System;
using System.Collections.Generic;

namespace FInd_Op_Web.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Username { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string FullName { get; set; } = null!;

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? AvatarUrl { get; set; }

    public string? BackgroundUrl { get; set; }

    public bool? IsFreeAgent { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string? TwoFactorSecret { get; set; }

    public bool IsTwoFactorEnabled { get; set; } = false;

    public string? PublicKey { get; set; }

    public bool IsPremium { get; set; } = false;

    public DateTime? PremiumUntil { get; set; }

    public int? Tokens { get; set; } = 0;

    public string? IdCardFrontUrl { get; set; }
    public string? IdCardBackUrl { get; set; }
    public string? KycStatus { get; set; } = "Pending";

    public virtual ICollection<MatchPoll> MatchPolls { get; set; } = new List<MatchPoll>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<PitchSchedule> PitchSchedules { get; set; } = new List<PitchSchedule>();

    public virtual ICollection<Stadium> Stadia { get; set; } = new List<Stadium>();

    public virtual ICollection<TeamMember> TeamMembers { get; set; } = new List<TeamMember>();

    public virtual ICollection<Team> Teams { get; set; } = new List<Team>();

    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();
}
