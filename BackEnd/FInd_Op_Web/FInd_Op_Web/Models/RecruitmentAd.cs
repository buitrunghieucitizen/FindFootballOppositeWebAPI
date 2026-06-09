using System;
using System.Collections.Generic;

namespace FInd_Op_Web.Models;

public partial class RecruitmentAd
{
    public int AdId { get; set; }

    public int? TeamId { get; set; }

    public int? SportId { get; set; }

    public int? MatchId { get; set; }

    public string Title { get; set; } = null!;

    public string Content { get; set; } = null!;

    public string? PositionNeeded { get; set; }

    public DateTime? CreatedAt { get; set; }

    public bool? IsActive { get; set; }

    public bool IsBoosted { get; set; } = false;

    public DateTime? BoostUntil { get; set; }

    public virtual Match? Match { get; set; }

    public virtual Team? Team { get; set; }

    public virtual Sport? Sport { get; set; }
}
