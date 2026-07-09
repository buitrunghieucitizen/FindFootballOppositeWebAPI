using System;
using System.Collections.Generic;

namespace FInd_Op_Web.Models;

public partial class TeamFundTransaction
{
    public int TransactionId { get; set; }

    public int? TeamId { get; set; }

    public int? PlayerId { get; set; }

    [System.ComponentModel.DataAnnotations.Schema.Column(TypeName = "decimal(18,2)")]
    public decimal? Amount { get; set; }

    public string? TransactionType { get; set; }

    public string? Description { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Team? Team { get; set; }

    public virtual User? Player { get; set; }
}
