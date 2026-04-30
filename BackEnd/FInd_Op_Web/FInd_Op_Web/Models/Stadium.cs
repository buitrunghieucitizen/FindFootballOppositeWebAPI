using System;
using System.Collections.Generic;

namespace FInd_Op_Web.Models;

public partial class Stadium
{
    public int StadiumId { get; set; }

    public int? OwnerId { get; set; }

    public string StadiumName { get; set; } = null!;

    public string? Address { get; set; }

    public string? Description { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? Owner { get; set; }

    public virtual ICollection<Pitch> Pitches { get; set; } = new List<Pitch>();
}
