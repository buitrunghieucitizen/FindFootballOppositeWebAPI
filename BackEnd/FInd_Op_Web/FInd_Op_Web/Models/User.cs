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

    public bool? IsFreeAgent { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<MatchPoll> MatchPolls { get; set; } = new List<MatchPoll>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<PitchSchedule> PitchSchedules { get; set; } = new List<PitchSchedule>();

    public virtual ICollection<Stadium> Stadia { get; set; } = new List<Stadium>();

    public virtual ICollection<TeamMember> TeamMembers { get; set; } = new List<TeamMember>();

    public virtual ICollection<Team> Teams { get; set; } = new List<Team>();

    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();
}
