using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace FInd_Op_Web.DTOs
{
        public class CreatePaymentDto
        {
            public string Type { get; set; }
            public int? TeamId { get; set; }
            public int? PitchId { get; set; }
            public int? ScheduleId { get; set; }
            public int? TournamentId { get; set; }
            public int? InvoiceId { get; set; }
            public int? Amount { get; set; }
            public int? Tokens { get; set; }
        }
    
}

