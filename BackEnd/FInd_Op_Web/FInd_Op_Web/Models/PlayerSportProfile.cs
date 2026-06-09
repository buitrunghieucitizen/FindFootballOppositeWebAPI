using System;
using System.Collections.Generic;

namespace FInd_Op_Web.Models;

public partial class PlayerSportProfile
{
    public int ProfileId { get; set; }

    public int? PlayerId { get; set; }

    public int? SportId { get; set; }

    public string? SkillLevel { get; set; }

    public string? PreferredPosition { get; set; }

    public int? TotalMatches { get; set; }

    public decimal? RatingScore { get; set; }

    public virtual User? Player { get; set; }

    public virtual Sport? Sport { get; set; }
}
