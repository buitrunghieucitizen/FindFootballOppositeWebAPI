using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace FInd_Op_Web.DTOs
{
        public class RateOpponentDto
        {
            public int MatchId { get; set; }
            public int Score { get; set; }
            public string? Comment { get; set; }
        }
    
        public class TournamentCreateDto
        {
            public string Name { get; set; } = string.Empty;
            public string Format { get; set; } = "League";
            public decimal EntryFee { get; set; } = 0;
            public int MaxTeams { get; set; } = 8;
            public string AssignmentType { get; set; } = "Manual";
            
            public DateTime? StartDate { get; set; }
            public DateTime? EndDate { get; set; }
            public int SportId { get; set; } = 1;
            public string Scope { get; set; } = "Internal";
            public string? OrganizerCccd { get; set; }
            public string? OrganizerDriverLicense { get; set; }
            public int MaxPlayersPerTeam { get; set; } = 5;
            public string Stadium { get; set; } = string.Empty;
            public string? Phone { get; set; }
            public string? IdCardFrontUrl { get; set; }
            public string? IdCardBackUrl { get; set; }
            public string? BankQrCodeUrl { get; set; }
        }
    
        public class TournamentSettingsDto
        {
            public string Name { get; set; } = string.Empty;
            public string Sport { get; set; } = "Bóng đá";
            public string Stadium { get; set; } = string.Empty;
            public int? StadiumId { get; set; }
            public string Format { get; set; } = "Swiss";
            public string Scope { get; set; } = "Internal";
            public int MaxTeams { get; set; } = 16;
            public DateTime? StartDate { get; set; }
            public DateTime? EndDate { get; set; }
            public string? Status { get; set; }
        }

        public class MatchScheduleDto
        {
            public int? PitchId { get; set; }
            public DateTime? MatchDate { get; set; }
            public TimeSpan? StartTime { get; set; }
            public int? DurationMinutes { get; set; }
            public bool? HasExtraTime { get; set; }
            public int? HomeScore { get; set; }
            public int? AwayScore { get; set; }
            public string? MatchStatus { get; set; }
        }
    
        public class TournamentAddTeamDto
        {
            public int? TeamId { get; set; }
            public string? Name { get; set; }
            public string? Abbr { get; set; }
        }
    
        public class UpdateTournamentMatchDto
        {
            public DateTime? MatchDate { get; set; }
            public TimeSpan? StartTime { get; set; }
            public TimeSpan? EndTime { get; set; }
            public int? PitchId { get; set; }
            public string? Location { get; set; }
            public int? DurationMinutes { get; set; }
            public bool? HasExtraTime { get; set; }
            public int? HomeScore { get; set; }
            public int? AwayScore { get; set; }
            public string? SetScores { get; set; }
            public string? MatchStatus { get; set; }
        }
    
        public class MatchRequestDto
        {
            public string? Message { get; set; }
        }
    
        public class RecruitmentDto
        {
            public string Title { get; set; } = string.Empty;
            public string Content { get; set; } = string.Empty;
            public string PositionNeeded { get; set; } = string.Empty;
        }
    
        public class PostDto
        {
            public string Title { get; set; } = string.Empty;
            public string Content { get; set; } = string.Empty;
            public int? MatchId { get; set; }
            public string? ImageUrls { get; set; }
            public string? PostType { get; set; }
        }
    
        public class ScoreDto
        {
            public int HomeScore { get; set; }
            public int AwayScore { get; set; }
            public string? SetScores { get; set; }
        }
    
        public class CancelDto
        {
            public string Reason { get; set; } = string.Empty;
        }
    
        public class ChallengeDto
        {
            public DateTime? MatchDate { get; set; }
            public TimeSpan? StartTime { get; set; }
            public string? Location { get; set; }
            public string? Notes { get; set; }
            public int? ScheduleId { get; set; }
        }

        public class UpdateChallengeDto
        {
            public DateTime? MatchDate { get; set; }
            public TimeSpan? StartTime { get; set; }
            public string? Location { get; set; }
            public string? Notes { get; set; }
        }
    
        public class RegisterTournamentDto
        {
            public List<int>? PlayerIds { get; set; }
            public bool NoBettingCommitment { get; set; }
            public string? TeamAbbreviation { get; set; }
        }
    
        public class BookPitchDto
        {
            public int PitchId { get; set; }
            public DateTime StartTime { get; set; }
            public DateTime EndTime { get; set; }
            public int? MatchId { get; set; }
            public string? BookingType { get; set; }
            public int? NumberOfWeeks { get; set; }
            public string? SenderBankAccountNumber { get; set; }
            public string? SenderBankAccountName { get; set; }
        }
    
        public class CaptainCreateTeamDto
        {
            public string TeamName { get; set; } = null!;
            public string? HomeArea { get; set; }
            public string? Introduction { get; set; }
            public bool IsClubOwner { get; set; } = false;
            public int SportId { get; set; } = 1;
            public string? LogoUrl { get; set; }
            public string? BackgroundUrl { get; set; }
        }
        
        public class CaptainUpdateTeamDto
        {
            public string TeamName { get; set; } = null!;
            public string? HomeArea { get; set; }
            public string? Introduction { get; set; }
            public string? QualityLevel { get; set; }
            public string? LogoUrl { get; set; }
            public string? BackgroundUrl { get; set; }
        }
    
        public class TransferRoleDto
        {
            public int NewCaptainId { get; set; }
            public string NewRoleForOldCaptain { get; set; } = "Player"; // "Owner" or "Player"
        }

        public class BookRecurringPitchDto
        {
            public int PitchId { get; set; }
            public int DayOfWeek { get; set; } // 0 = Sunday, 1 = Monday...
            public string StartTime { get; set; } = null!; // "HH:mm:ss"
            public string EndTime { get; set; } = null!;   // "HH:mm:ss"
            public string FromDate { get; set; } = null!;  // "yyyy-MM-dd"
            public string ToDate { get; set; } = null!;    // "yyyy-MM-dd"
        }
}
