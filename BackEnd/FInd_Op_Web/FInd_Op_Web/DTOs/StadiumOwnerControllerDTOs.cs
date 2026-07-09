using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace FInd_Op_Web.DTOs
{
        public class OwnerCreateStadiumDto
        {
            public string StadiumName { get; set; } = null!;
            public string? Address { get; set; }
            public string? Hotline { get; set; }
            public string? Description { get; set; }
            public string? Latitude { get; set; }
            public string? Longitude { get; set; }
            public IFormFile? ImageFile { get; set; }
            
            // Configuration for generating slots
            public string? OpenTime { get; set; } // Format: HH:mm
            public string? CloseTime { get; set; } // Format: HH:mm
            public int? SlotDurationMinutes { get; set; }
        }
    
        public class OwnerCreatePitchDto
        {
            public int StadiumId { get; set; }
            public string? PitchName { get; set; }
            public string? PitchType { get; set; }
            public decimal HourlyRate { get; set; }
            public int SportId { get; set; } = 1;
        }
    
        public class CreateRecurringScheduleDto
        {
            public int PitchId { get; set; }
            public string? TeamName { get; set; }
            public string? CustomerName { get; set; }
            public string? CustomerPhone { get; set; }
            public int DayOfWeek { get; set; } // 0=Sunday, 1=Monday...
            public TimeSpan StartTime { get; set; }
            public TimeSpan EndTime { get; set; }
            public DateTime FromDate { get; set; }
            public int NumberOfWeeks { get; set; }
        }
    

}

