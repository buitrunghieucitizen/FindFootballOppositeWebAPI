using System;
using System.Collections.Generic;

namespace FInd_Op_Web.Models;

public partial class MediaFile
{
    public int MediaId { get; set; }

    public string EntityType { get; set; } = null!;

    public int EntityId { get; set; }

    public string FilePath { get; set; } = null!;

    public bool? IsPrimary { get; set; }

    public DateTime? UploadedAt { get; set; }
}
