using System;
using System.Collections.Generic;

namespace FInd_Op_Web.Models;

public partial class TeamMember
{
    public int TeamId { get; set; }

    public int PlayerId { get; set; }

    public string? RoleInTeam { get; set; }

    public string? Status { get; set; }

    public DateTime? JoinedDate { get; set; }

    public virtual User Player { get; set; } = null!;

    public virtual Team Team { get; set; } = null!;
}
