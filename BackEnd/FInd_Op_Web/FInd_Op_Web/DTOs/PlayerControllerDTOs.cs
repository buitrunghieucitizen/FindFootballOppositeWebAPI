using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace FInd_Op_Web.DTOs
{
        public class PlayerCreateTeamDto
        {
            public string TeamName { get; set; } = null!;
            public string? HomeArea { get; set; }
            public string? QualityLevel { get; set; }
            public int SportId { get; set; } = 1;
        }
    
        public class RatePlayerDto
        {
            public int Score { get; set; }
            public int Month { get; set; }
            public int Year { get; set; }
            public string? Comment { get; set; }
        }
    
        public class VoteAttendanceDto
        {
            public bool IsAttending { get; set; }
        }
    
        public class CreateIndividualMatchDto
        {
            public int SportId { get; set; }
            public DateTime ExpiresAt { get; set; }
            public string? Location { get; set; }
            public string? QualityLevel { get; set; }
            public string? Description { get; set; }
        }
    
}

