using System;
using System.Collections.Generic;

namespace FInd_Op_Web.Models;

public partial class TokenTransaction
{
    public int TransactionId { get; set; }

    public int? UserId { get; set; }

    public int? Amount { get; set; }

    public string? TransactionType { get; set; }

    public string? Description { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? User { get; set; }
}
