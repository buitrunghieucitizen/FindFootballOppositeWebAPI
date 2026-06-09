using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace FInd_Op_Web.DTOs
{
        public class ApproveWithdrawalDto
        {
            public IFormFile? receiptImage { get; set; }
        }
    
            public class CreateUserDto
            {
                public string Username { get; set; } = string.Empty;
                public string FullName { get; set; } = string.Empty;
                public string? Phone { get; set; }
                public string? Password { get; set; }
                public string[]? Roles { get; set; }
            }
    
            public class UpdateUserDto
            {
                public string FullName { get; set; } = string.Empty;
                public string? Phone { get; set; }
                public string[]? Roles { get; set; }
            }
    
            public class CreateTeamDto
            {
                public string TeamName { get; set; } = string.Empty;
                public int? CaptainId { get; set; }
                public string? QualityLevel { get; set; }
                public string? HomeArea { get; set; }
                public string? History { get; set; }
                public bool? LookingForOpponent { get; set; }
                public int? SportId { get; set; }
            }
    
            public class CreateStadiumDto
            {
                public string StadiumName { get; set; } = string.Empty;
                public string? Address { get; set; }
                public string? Hotline { get; set; }
                public string? Description { get; set; }
                public int? OwnerId { get; set; }
                public List<CreatePitchDto>? Pitches { get; set; }
            }
    
            public class UpdateStadiumDto
            {
                public string StadiumName { get; set; } = string.Empty;
                public string? Address { get; set; }
                public string? Hotline { get; set; }
                public string? Description { get; set; }
                public List<CreatePitchDto>? AddPitches { get; set; }
            }
    
            public class CreatePitchDto
            {
                public string? PitchName { get; set; }
                public int? PitchSize { get; set; } // 5, 7, 9, 11
                public decimal PricePerHour { get; set; }
                public string? GrassType { get; set; }
                public bool? IsActive { get; set; }
                public int? SportId { get; set; }
            }
    
            public class CreateTournamentDto
            {
                public string TournamentName { get; set; } = string.Empty;
                public string? Format { get; set; }
                public int SportId { get; set; } = 1;
                public int? StadiumId { get; set; }
                public int? OrganizerId { get; set; }
                public DateTime? StartDate { get; set; }
                public DateTime? EndDate { get; set; }
                public string? Status { get; set; }
                public string? Description { get; set; }
            }
    
            public class UpdateTournamentDto
            {
                public string TournamentName { get; set; } = string.Empty;
                public string? Format { get; set; }
                public int SportId { get; set; } = 1;
                public int? StadiumId { get; set; }
                public int? OrganizerId { get; set; }
                public DateTime? StartDate { get; set; }
                public DateTime? EndDate { get; set; }
                public string? Status { get; set; }
                public string? Description { get; set; }
            }
    
            public class DeleteRecruitmentDto
            {
                public string Reason { get; set; } = string.Empty;
            }
    
}

