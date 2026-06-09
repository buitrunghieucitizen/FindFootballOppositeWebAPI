USE master;
GO
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'FindFootballOppositeWeb')
BEGIN
    ALTER DATABASE FindFootballOppositeWeb SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE FindFootballOppositeWeb;
END
GO
CREATE DATABASE FindFootballOppositeWeb;
GO
USE FindFootballOppositeWeb;
GO

IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [MediaFiles] (
    [MediaID] int NOT NULL IDENTITY,
    [EntityType] nvarchar(50) NOT NULL,
    [EntityID] int NOT NULL,
    [FilePath] nvarchar(max) NOT NULL,
    [IsPrimary] bit NULL DEFAULT CAST(0 AS bit),
    [UploadedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK__MediaFil__B2C2B5AF86BF5F03] PRIMARY KEY ([MediaID])
);
GO

CREATE TABLE [Roles] (
    [RoleID] int NOT NULL IDENTITY,
    [RoleName] nvarchar(50) NOT NULL,
    CONSTRAINT [PK__Roles__8AFACE3A9A190F1D] PRIMARY KEY ([RoleID])
);
GO

CREATE TABLE [Sports] (
    [SportId] int NOT NULL IDENTITY,
    [SportName] nvarchar(100) NOT NULL,
    [Icon] nvarchar(50) NULL,
    [CreatedAt] datetime2 NULL,
    CONSTRAINT [PK_Sports] PRIMARY KEY ([SportId])
);
GO

CREATE TABLE [Users] (
    [UserID] int NOT NULL IDENTITY,
    [Username] nvarchar(100) NOT NULL,
    [PasswordHash] nvarchar(255) NOT NULL,
    [FullName] nvarchar(100) NOT NULL,
    [Phone] nvarchar(20) NULL,
    [IsFreeAgent] bit NULL DEFAULT CAST(0 AS bit),
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    [IsPremium] bit NOT NULL,
    [PremiumUntil] datetime2 NULL,
    [Tokens] int NULL,
    [PublicKey] nvarchar(max) NULL,
    CONSTRAINT [PK__Users__1788CCAC4609C301] PRIMARY KEY ([UserID])
);
GO

CREATE TABLE [Notifications] (
    [NotificationID] int NOT NULL IDENTITY,
    [UserID] int NULL,
    [Title] nvarchar(200) NOT NULL,
    [Message] nvarchar(max) NOT NULL,
    [RelatedLink] nvarchar(255) NULL,
    [IsRead] bit NULL DEFAULT CAST(0 AS bit),
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK__Notifica__20CF2E32935404C6] PRIMARY KEY ([NotificationID]),
    CONSTRAINT [FK__Notificat__UserI__6FE99F9F] FOREIGN KEY ([UserID]) REFERENCES [Users] ([UserID])
);
GO

CREATE TABLE [PaymentTransactions] (
    [TransactionId] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [Amount] int NOT NULL,
    [OrderCode] bigint NOT NULL,
    [TransactionType] nvarchar(50) NOT NULL DEFAULT N'Premium',
    [ReferenceId] int NULL,
    [Description] nvarchar(200) NULL,
    [Status] nvarchar(50) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_PaymentTransactions] PRIMARY KEY ([TransactionId]),
    CONSTRAINT [FK_PaymentTransactions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserID]) ON DELETE NO ACTION
);
GO

CREATE TABLE [PlayerSportProfiles] (
    [ProfileId] int NOT NULL IDENTITY,
    [PlayerId] int NULL,
    [SportId] int NULL,
    [SkillLevel] nvarchar(50) NULL,
    [PreferredPosition] nvarchar(100) NULL,
    [TotalMatches] int NULL DEFAULT 0,
    [RatingScore] decimal(5,2) NULL DEFAULT 0.0,
    CONSTRAINT [PK__PlayerSportProfile] PRIMARY KEY ([ProfileId]),
    CONSTRAINT [FK_PlayerSportProfile_Sports] FOREIGN KEY ([SportId]) REFERENCES [Sports] ([SportId]),
    CONSTRAINT [FK_PlayerSportProfile_Users] FOREIGN KEY ([PlayerId]) REFERENCES [Users] ([UserID])
);
GO

CREATE TABLE [Stadiums] (
    [StadiumID] int NOT NULL IDENTITY,
    [OwnerID] int NULL,
    [StadiumName] nvarchar(100) NOT NULL,
    [Address] nvarchar(255) NULL,
    [Hotline] nvarchar(max) NULL,
    [Description] nvarchar(max) NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK__Stadiums__ED833038C8DC0ECE] PRIMARY KEY ([StadiumID]),
    CONSTRAINT [FK__Stadiums__OwnerI__4E88ABD4] FOREIGN KEY ([OwnerID]) REFERENCES [Users] ([UserID])
);
GO

CREATE TABLE [Teams] (
    [TeamID] int NOT NULL IDENTITY,
    [TeamName] nvarchar(100) NOT NULL,
    [CaptainID] int NULL,
    [SportId] int NULL,
    [QualityLevel] nvarchar(50) NULL,
    [History] nvarchar(max) NULL,
    [IsDisbanded] bit NULL DEFAULT CAST(0 AS bit),
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    [HomeArea] nvarchar(255) NULL,
    [FoundedDate] datetime NULL,
    [LookingForOpponent] bit NULL DEFAULT CAST(0 AS bit),
    [IsSubscriptionActive] bit NOT NULL DEFAULT CAST(0 AS bit),
    [SubscriptionEndDate] datetime NULL,
    [FundBalance] decimal(18,2) NULL DEFAULT 0.0,
    [IsFundUnlocked] bit NULL DEFAULT CAST(0 AS bit),
    [RankingScore] int NOT NULL DEFAULT 1000,
    [LogoUrl] nvarchar(500) NULL,
    CONSTRAINT [PK__Teams__123AE7B988944AE2] PRIMARY KEY ([TeamID]),
    CONSTRAINT [FK_Teams_Sports_SportId] FOREIGN KEY ([SportId]) REFERENCES [Sports] ([SportId]),
    CONSTRAINT [FK__Teams__CaptainID__44FF419A] FOREIGN KEY ([CaptainID]) REFERENCES [Users] ([UserID])
);
GO

CREATE TABLE [TokenTransactions] (
    [TransactionId] int NOT NULL IDENTITY,
    [UserId] int NULL,
    [Amount] int NULL,
    [TransactionType] nvarchar(max) NULL,
    [Description] nvarchar(max) NULL,
    [CreatedAt] datetime2 NULL,
    CONSTRAINT [PK_TokenTransactions] PRIMARY KEY ([TransactionId]),
    CONSTRAINT [FK_TokenTransactions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserID])
);
GO

CREATE TABLE [UserRoles] (
    [UserID] int NOT NULL,
    [RoleID] int NOT NULL,
    CONSTRAINT [PK__UserRole__AF27604FE3C98EF0] PRIMARY KEY ([UserID], [RoleID]),
    CONSTRAINT [FK__UserRoles__RoleI__403A8C7D] FOREIGN KEY ([RoleID]) REFERENCES [Roles] ([RoleID]),
    CONSTRAINT [FK__UserRoles__UserI__3F466844] FOREIGN KEY ([UserID]) REFERENCES [Users] ([UserID])
);
GO

CREATE TABLE [Pitches] (
    [PitchID] int NOT NULL IDENTITY,
    [StadiumID] int NULL,
    [SportId] int NULL,
    [PitchName] nvarchar(50) NULL,
    [PitchSize] int NULL,
    [PricePerHour] decimal(18,2) NOT NULL,
    [IsActive] bit NULL DEFAULT CAST(1 AS bit),
    [GrassType] nvarchar(50) NULL,
    CONSTRAINT [PK__Pitches__B68228186D58E2AE] PRIMARY KEY ([PitchID]),
    CONSTRAINT [FK_Pitches_Sports_SportId] FOREIGN KEY ([SportId]) REFERENCES [Sports] ([SportId]),
    CONSTRAINT [FK__Pitches__Stadium__5165187F] FOREIGN KEY ([StadiumID]) REFERENCES [Stadiums] ([StadiumID])
);
GO

CREATE TABLE [Tournaments] (
    [TournamentId] int NOT NULL IDENTITY,
    [TournamentName] nvarchar(200) NOT NULL,
    [Format] nvarchar(50) NULL,
    [SportId] int NULL,
    [StadiumId] int NULL,
    [OrganizerId] int NULL,
    [StartDate] datetime2 NULL,
    [EndDate] datetime NULL,
    [Status] nvarchar(50) NULL DEFAULT N'Upcoming',
    [Description] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [IsFeePaid] bit NOT NULL DEFAULT CAST(0 AS bit),
    [EntryFee] decimal(18,2) NULL,
    CONSTRAINT [PK_Tournaments] PRIMARY KEY ([TournamentId]),
    CONSTRAINT [FK_Tournaments_Sports_SportId] FOREIGN KEY ([SportId]) REFERENCES [Sports] ([SportId]),
    CONSTRAINT [FK_Tournaments_Stadiums_StadiumId] FOREIGN KEY ([StadiumId]) REFERENCES [Stadiums] ([StadiumID]) ON DELETE SET NULL,
    CONSTRAINT [FK_Tournaments_Users_OrganizerId] FOREIGN KEY ([OrganizerId]) REFERENCES [Users] ([UserID]) ON DELETE SET NULL
);
GO

CREATE TABLE [JoinRequests] (
    [RequestId] int NOT NULL IDENTITY,
    [PlayerId] int NOT NULL,
    [TeamId] int NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [RequestType] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [ProcessedAt] datetime2 NULL,
    CONSTRAINT [PK_JoinRequests] PRIMARY KEY ([RequestId]),
    CONSTRAINT [FK_JoinRequests_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [Teams] ([TeamID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_JoinRequests_Users_PlayerId] FOREIGN KEY ([PlayerId]) REFERENCES [Users] ([UserID]) ON DELETE NO ACTION
);
GO

CREATE TABLE [PlayerRatings] (
    [RatingId] int NOT NULL IDENTITY,
    [PlayerId] int NOT NULL,
    [RatedById] int NOT NULL,
    [TeamId] int NOT NULL,
    [Score] int NOT NULL,
    [Month] int NOT NULL,
    [Year] int NOT NULL,
    [Comment] nvarchar(max) NULL,
    CONSTRAINT [PK_PlayerRatings] PRIMARY KEY ([RatingId]),
    CONSTRAINT [FK_PlayerRatings_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [Teams] ([TeamID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_PlayerRatings_Users_PlayerId] FOREIGN KEY ([PlayerId]) REFERENCES [Users] ([UserID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_PlayerRatings_Users_RatedById] FOREIGN KEY ([RatedById]) REFERENCES [Users] ([UserID]) ON DELETE NO ACTION
);
GO

CREATE TABLE [TeamFundTransactions] (
    [TransactionId] int NOT NULL IDENTITY,
    [TeamId] int NULL,
    [PlayerId] int NULL,
    [Amount] decimal(18,2) NULL,
    [TransactionType] nvarchar(max) NULL,
    [Description] nvarchar(max) NULL,
    [CreatedAt] datetime2 NULL,
    CONSTRAINT [PK_TeamFundTransactions] PRIMARY KEY ([TransactionId]),
    CONSTRAINT [FK_TeamFundTransactions_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [Teams] ([TeamID]),
    CONSTRAINT [FK_TeamFundTransactions_Users_PlayerId] FOREIGN KEY ([PlayerId]) REFERENCES [Users] ([UserID])
);
GO

CREATE TABLE [TeamMembers] (
    [TeamID] int NOT NULL,
    [PlayerID] int NOT NULL,
    [RoleInTeam] nvarchar(50) NULL DEFAULT N'Member',
    [Status] nvarchar(50) NULL DEFAULT N'Active',
    [JoinedDate] datetime NULL DEFAULT ((getdate())),
    CONSTRAINT [PK__TeamMemb__869E00F323A341A2] PRIMARY KEY ([TeamID], [PlayerID]),
    CONSTRAINT [FK__TeamMembe__Playe__48CFD27E] FOREIGN KEY ([PlayerID]) REFERENCES [Users] ([UserID]),
    CONSTRAINT [FK__TeamMembe__TeamI__47DBAE45] FOREIGN KEY ([TeamID]) REFERENCES [Teams] ([TeamID])
);
GO

CREATE TABLE [TeamSubscriptions] (
    [SubscriptionId] int NOT NULL IDENTITY,
    [TeamId] int NOT NULL,
    [PaidByUserId] int NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [PlanType] nvarchar(50) NOT NULL DEFAULT N'Basic',
    [StartDate] datetime NOT NULL,
    [EndDate] datetime NOT NULL,
    [Status] nvarchar(50) NOT NULL DEFAULT N'Pending',
    [CreatedAt] datetime NOT NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_TeamSubscriptions] PRIMARY KEY ([SubscriptionId]),
    CONSTRAINT [FK_TeamSubscriptions_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [Teams] ([TeamID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_TeamSubscriptions_Users_PaidByUserId] FOREIGN KEY ([PaidByUserId]) REFERENCES [Users] ([UserID]) ON DELETE NO ACTION
);
GO

CREATE TABLE [RecurringBookings] (
    [RecurringID] int NOT NULL IDENTITY,
    [PitchID] int NULL,
    [TeamID] int NULL,
    [DayOfWeek] int NOT NULL,
    [StartTime] time NOT NULL,
    [EndTime] time NOT NULL,
    [FromDate] date NOT NULL,
    [ToDate] date NOT NULL,
    [IsApproved] bit NULL DEFAULT CAST(0 AS bit),
    CONSTRAINT [PK__Recurrin__738186825283E687] PRIMARY KEY ([RecurringID]),
    CONSTRAINT [FK__Recurring__Pitch__5629CD9C] FOREIGN KEY ([PitchID]) REFERENCES [Pitches] ([PitchID]),
    CONSTRAINT [FK__Recurring__TeamI__571DF1D5] FOREIGN KEY ([TeamID]) REFERENCES [Teams] ([TeamID])
);
GO

CREATE TABLE [TournamentFees] (
    [FeeId] int NOT NULL IDENTITY,
    [TournamentId] int NOT NULL,
    [PaidByUserId] int NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Status] nvarchar(50) NOT NULL DEFAULT N'Pending',
    [CreatedAt] datetime NOT NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_TournamentFees] PRIMARY KEY ([FeeId]),
    CONSTRAINT [FK_TournamentFees_Tournaments_TournamentId] FOREIGN KEY ([TournamentId]) REFERENCES [Tournaments] ([TournamentId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_TournamentFees_Users_PaidByUserId] FOREIGN KEY ([PaidByUserId]) REFERENCES [Users] ([UserID]) ON DELETE NO ACTION
);
GO

CREATE TABLE [PitchSchedules] (
    [ScheduleID] int NOT NULL IDENTITY,
    [PitchID] int NULL,
    [BookedByID] int NULL,
    [RecurringID] int NULL,
    [StartTime] datetime NOT NULL,
    [EndTime] datetime NOT NULL,
    [ScheduleStatus] nvarchar(50) NULL DEFAULT N'Confirmed',
    CONSTRAINT [PK__PitchSch__9C8A5B694BB6F176] PRIMARY KEY ([ScheduleID]),
    CONSTRAINT [FK__PitchSche__Booke__5BE2A6F2] FOREIGN KEY ([BookedByID]) REFERENCES [Users] ([UserID]),
    CONSTRAINT [FK__PitchSche__Pitch__5AEE82B9] FOREIGN KEY ([PitchID]) REFERENCES [Pitches] ([PitchID]),
    CONSTRAINT [FK__PitchSche__Recur__5CD6CB2B] FOREIGN KEY ([RecurringID]) REFERENCES [RecurringBookings] ([RecurringID])
);
GO

CREATE TABLE [BookingCommissions] (
    [CommissionId] int NOT NULL IDENTITY,
    [ScheduleId] int NOT NULL,
    [StadiumOwnerId] int NOT NULL,
    [BookingAmount] decimal(18,2) NOT NULL,
    [CommissionRate] decimal(5,4) NOT NULL,
    [CommissionAmount] decimal(18,2) NOT NULL,
    [Status] nvarchar(50) NOT NULL DEFAULT N'Pending',
    [CreatedAt] datetime NOT NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_BookingCommissions] PRIMARY KEY ([CommissionId]),
    CONSTRAINT [FK_BookingCommissions_PitchSchedules_ScheduleId] FOREIGN KEY ([ScheduleId]) REFERENCES [PitchSchedules] ([ScheduleID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_BookingCommissions_Users_StadiumOwnerId] FOREIGN KEY ([StadiumOwnerId]) REFERENCES [Users] ([UserID]) ON DELETE NO ACTION
);
GO

CREATE TABLE [Matches] (
    [MatchID] int NOT NULL IDENTITY,
    [HomeTeamID] int NULL,
    [AwayTeamID] int NULL,
    [SportId] int NULL,
    [ScheduleID] int NULL,
    [MatchStatus] nvarchar(50) NULL,
    [CancelRequestedBy] int NULL,
    [CancelReason] nvarchar(max) NULL,
    [HomeScore] int NULL,
    [AwayScore] int NULL,
    [ResultVisibility] nvarchar(50) NULL DEFAULT N'Public',
    [HomeConfirmed] bit NULL,
    [AwayConfirmed] bit NULL,
    [ExpiresAt] datetime NULL,
    [MatchType] nvarchar(50) NULL DEFAULT N'Friendly',
    [MatchDate] datetime2 NULL,
    [StartTime] time NULL,
    [EndTime] time NULL,
    CONSTRAINT [PK__Matches__4218C8373268C8E4] PRIMARY KEY ([MatchID]),
    CONSTRAINT [FK_Matches_Sports_SportId] FOREIGN KEY ([SportId]) REFERENCES [Sports] ([SportId]),
    CONSTRAINT [FK__Matches__AwayTea__6383C8BA] FOREIGN KEY ([AwayTeamID]) REFERENCES [Teams] ([TeamID]),
    CONSTRAINT [FK__Matches__CancelR__656C112C] FOREIGN KEY ([CancelRequestedBy]) REFERENCES [Teams] ([TeamID]),
    CONSTRAINT [FK__Matches__HomeTea__628FA481] FOREIGN KEY ([HomeTeamID]) REFERENCES [Teams] ([TeamID]),
    CONSTRAINT [FK__Matches__Schedul__6477ECF3] FOREIGN KEY ([ScheduleID]) REFERENCES [PitchSchedules] ([ScheduleID])
);
GO

CREATE TABLE [MatchPolls] (
    [MatchID] int NOT NULL,
    [PlayerID] int NOT NULL,
    [IsAttending] bit NULL,
    CONSTRAINT [PK__MatchPol__D6BC2F7D6D6D5E38] PRIMARY KEY ([MatchID], [PlayerID]),
    CONSTRAINT [FK__MatchPoll__Match__66603565] FOREIGN KEY ([MatchID]) REFERENCES [Matches] ([MatchID]),
    CONSTRAINT [FK__MatchPoll__Playe__6754599E] FOREIGN KEY ([PlayerID]) REFERENCES [Users] ([UserID])
);
GO

CREATE TABLE [Posts] (
    [PostId] int NOT NULL IDENTITY,
    [TeamId] int NOT NULL,
    [AuthorId] int NOT NULL,
    [Title] nvarchar(max) NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [MatchId] int NULL,
    [ImageUrls] nvarchar(max) NULL,
    [PostType] nvarchar(max) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_Posts] PRIMARY KEY ([PostId]),
    CONSTRAINT [FK_Posts_Matches_MatchId] FOREIGN KEY ([MatchId]) REFERENCES [Matches] ([MatchID]) ON DELETE SET NULL,
    CONSTRAINT [FK_Posts_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [Teams] ([TeamID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Posts_Users_AuthorId] FOREIGN KEY ([AuthorId]) REFERENCES [Users] ([UserID]) ON DELETE NO ACTION
);
GO

CREATE TABLE [RecruitmentAds] (
    [AdID] int NOT NULL IDENTITY,
    [TeamID] int NULL,
    [SportId] int NULL,
    [MatchID] int NULL,
    [Title] nvarchar(255) NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [PositionNeeded] nvarchar(100) NULL,
    [CreatedAt] datetime NULL DEFAULT ((getdate())),
    [IsActive] bit NULL DEFAULT CAST(1 AS bit),
    [IsBoosted] bit NOT NULL DEFAULT CAST(0 AS bit),
    [BoostUntil] datetime NULL,
    CONSTRAINT [PK__Recruitm__7130D58EB18579EB] PRIMARY KEY ([AdID]),
    CONSTRAINT [FK_RecruitmentAds_Sports_SportId] FOREIGN KEY ([SportId]) REFERENCES [Sports] ([SportId]),
    CONSTRAINT [FK__Recruitme__Match__6EF57B66] FOREIGN KEY ([MatchID]) REFERENCES [Matches] ([MatchID]),
    CONSTRAINT [FK__Recruitme__TeamI__6E01572D] FOREIGN KEY ([TeamID]) REFERENCES [Teams] ([TeamID])
);
GO

CREATE TABLE [TeamRatings] (
    [RatingId] int NOT NULL IDENTITY,
    [RatedTeamId] int NOT NULL,
    [ReviewerTeamId] int NOT NULL,
    [MatchId] int NOT NULL,
    [Score] int NOT NULL,
    [Comment] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_TeamRatings] PRIMARY KEY ([RatingId]),
    CONSTRAINT [FK_TeamRatings_Matches_MatchId] FOREIGN KEY ([MatchId]) REFERENCES [Matches] ([MatchID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_TeamRatings_Teams_RatedTeamId] FOREIGN KEY ([RatedTeamId]) REFERENCES [Teams] ([TeamID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_TeamRatings_Teams_ReviewerTeamId] FOREIGN KEY ([ReviewerTeamId]) REFERENCES [Teams] ([TeamID]) ON DELETE NO ACTION
);
GO

CREATE TABLE [AdBoosts] (
    [BoostId] int NOT NULL IDENTITY,
    [RecruitmentAdId] int NULL,
    [PostId] int NULL,
    [BoostedByUserId] int NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [BoostStartDate] datetime NOT NULL,
    [BoostEndDate] datetime NOT NULL,
    [Status] nvarchar(50) NOT NULL DEFAULT N'Pending',
    [IsPriority] bit NOT NULL DEFAULT CAST(0 AS bit),
    [CreatedAt] datetime NOT NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_AdBoosts] PRIMARY KEY ([BoostId]),
    CONSTRAINT [FK_AdBoosts_Posts_PostId] FOREIGN KEY ([PostId]) REFERENCES [Posts] ([PostId]) ON DELETE SET NULL,
    CONSTRAINT [FK_AdBoosts_RecruitmentAds_RecruitmentAdId] FOREIGN KEY ([RecruitmentAdId]) REFERENCES [RecruitmentAds] ([AdID]) ON DELETE SET NULL,
    CONSTRAINT [FK_AdBoosts_Users_BoostedByUserId] FOREIGN KEY ([BoostedByUserId]) REFERENCES [Users] ([UserID]) ON DELETE NO ACTION
);
GO

CREATE INDEX [IX_AdBoosts_BoostedByUserId] ON [AdBoosts] ([BoostedByUserId]);
GO

CREATE INDEX [IX_AdBoosts_PostId] ON [AdBoosts] ([PostId]);
GO

CREATE INDEX [IX_AdBoosts_RecruitmentAdId] ON [AdBoosts] ([RecruitmentAdId]);
GO

CREATE INDEX [IX_BookingCommissions_ScheduleId] ON [BookingCommissions] ([ScheduleId]);
GO

CREATE INDEX [IX_BookingCommissions_StadiumOwnerId] ON [BookingCommissions] ([StadiumOwnerId]);
GO

CREATE INDEX [IX_JoinRequests_PlayerId] ON [JoinRequests] ([PlayerId]);
GO

CREATE INDEX [IX_JoinRequests_TeamId] ON [JoinRequests] ([TeamId]);
GO

CREATE INDEX [IX_Matches_AwayTeamID] ON [Matches] ([AwayTeamID]);
GO

CREATE INDEX [IX_Matches_CancelRequestedBy] ON [Matches] ([CancelRequestedBy]);
GO

CREATE INDEX [IX_Matches_HomeTeamID] ON [Matches] ([HomeTeamID]);
GO

CREATE INDEX [IX_Matches_ScheduleID] ON [Matches] ([ScheduleID]);
GO

CREATE INDEX [IX_Matches_SportId] ON [Matches] ([SportId]);
GO

CREATE INDEX [IX_MatchPolls_PlayerID] ON [MatchPolls] ([PlayerID]);
GO

CREATE INDEX [IX_Notifications_UserID] ON [Notifications] ([UserID]);
GO

CREATE INDEX [IX_PaymentTransactions_UserId] ON [PaymentTransactions] ([UserId]);
GO

CREATE INDEX [IX_Pitches_SportId] ON [Pitches] ([SportId]);
GO

CREATE INDEX [IX_Pitches_StadiumID] ON [Pitches] ([StadiumID]);
GO

CREATE INDEX [IX_PitchSchedules_BookedByID] ON [PitchSchedules] ([BookedByID]);
GO

CREATE INDEX [IX_PitchSchedules_PitchID] ON [PitchSchedules] ([PitchID]);
GO

CREATE INDEX [IX_PitchSchedules_RecurringID] ON [PitchSchedules] ([RecurringID]);
GO

CREATE INDEX [IX_PlayerRatings_PlayerId] ON [PlayerRatings] ([PlayerId]);
GO

CREATE INDEX [IX_PlayerRatings_RatedById] ON [PlayerRatings] ([RatedById]);
GO

CREATE INDEX [IX_PlayerRatings_TeamId] ON [PlayerRatings] ([TeamId]);
GO

CREATE INDEX [IX_PlayerSportProfiles_PlayerId] ON [PlayerSportProfiles] ([PlayerId]);
GO

CREATE INDEX [IX_PlayerSportProfiles_SportId] ON [PlayerSportProfiles] ([SportId]);
GO

CREATE INDEX [IX_Posts_AuthorId] ON [Posts] ([AuthorId]);
GO

CREATE INDEX [IX_Posts_MatchId] ON [Posts] ([MatchId]);
GO

CREATE INDEX [IX_Posts_TeamId] ON [Posts] ([TeamId]);
GO

CREATE INDEX [IX_RecruitmentAds_MatchID] ON [RecruitmentAds] ([MatchID]);
GO

CREATE INDEX [IX_RecruitmentAds_SportId] ON [RecruitmentAds] ([SportId]);
GO

CREATE INDEX [IX_RecruitmentAds_TeamID] ON [RecruitmentAds] ([TeamID]);
GO

CREATE INDEX [IX_RecurringBookings_PitchID] ON [RecurringBookings] ([PitchID]);
GO

CREATE INDEX [IX_RecurringBookings_TeamID] ON [RecurringBookings] ([TeamID]);
GO

CREATE UNIQUE INDEX [UQ__Roles__8A2B61607CAA59C5] ON [Roles] ([RoleName]);
GO

CREATE INDEX [IX_Stadiums_OwnerID] ON [Stadiums] ([OwnerID]);
GO

CREATE INDEX [IX_TeamFundTransactions_PlayerId] ON [TeamFundTransactions] ([PlayerId]);
GO

CREATE INDEX [IX_TeamFundTransactions_TeamId] ON [TeamFundTransactions] ([TeamId]);
GO

CREATE INDEX [IX_TeamMembers_PlayerID] ON [TeamMembers] ([PlayerID]);
GO

CREATE INDEX [IX_TeamRatings_MatchId] ON [TeamRatings] ([MatchId]);
GO

CREATE INDEX [IX_TeamRatings_RatedTeamId] ON [TeamRatings] ([RatedTeamId]);
GO

CREATE INDEX [IX_TeamRatings_ReviewerTeamId] ON [TeamRatings] ([ReviewerTeamId]);
GO

CREATE INDEX [IX_Teams_CaptainID] ON [Teams] ([CaptainID]);
GO

CREATE INDEX [IX_Teams_SportId] ON [Teams] ([SportId]);
GO

CREATE INDEX [IX_TeamSubscriptions_PaidByUserId] ON [TeamSubscriptions] ([PaidByUserId]);
GO

CREATE INDEX [IX_TeamSubscriptions_TeamId] ON [TeamSubscriptions] ([TeamId]);
GO

CREATE INDEX [IX_TokenTransactions_UserId] ON [TokenTransactions] ([UserId]);
GO

CREATE INDEX [IX_TournamentFees_PaidByUserId] ON [TournamentFees] ([PaidByUserId]);
GO

CREATE INDEX [IX_TournamentFees_TournamentId] ON [TournamentFees] ([TournamentId]);
GO

CREATE INDEX [IX_Tournaments_OrganizerId] ON [Tournaments] ([OrganizerId]);
GO

CREATE INDEX [IX_Tournaments_SportId] ON [Tournaments] ([SportId]);
GO

CREATE INDEX [IX_Tournaments_StadiumId] ON [Tournaments] ([StadiumId]);
GO

CREATE INDEX [IX_UserRoles_RoleID] ON [UserRoles] ([RoleID]);
GO

CREATE UNIQUE INDEX [UQ__Users__536C85E42A2264E0] ON [Users] ([Username]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260523114136_InitialCreate', N'8.0.26');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [PitchSchedules] ADD [LockedUntil] datetime2 NULL;
GO

ALTER TABLE [BookingCommissions] ADD [IsPaidToPlatform] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260525032342_Phase2And3Updates', N'8.0.26');
GO

COMMIT;
GO



-- =============================================
-- SEED DATA
-- =============================================

INSERT INTO Sports (SportName, Icon) VALUES 
(N'Bóng đá', N'⚽'),
(N'Cầu lông', N'🏸'),
(N'Pickleball', N'🏓'),
(N'Khác', N'🏆');
GO

INSERT INTO Roles (RoleName) VALUES 
('Admin'), 
('StadiumOwner'), 
('Captain'), 
('Player'), 
('Guest');
GO

INSERT INTO Users (Username, PasswordHash, FullName, Phone, IsFreeAgent, IsPremium) VALUES 
('admin_system', 'hash_123', N'Quản Trị Viên', '0900000000', 0, 1);
GO

INSERT INTO UserRoles (UserID, RoleID) VALUES 
(1, 1); -- Admin
GO
BEGIN TRANSACTION;
GO

ALTER TABLE [Matches] ADD [TournamentId] int NULL;
GO

ALTER TABLE [Matches] ADD [TournamentStage] nvarchar(max) NULL;
GO

CREATE TABLE [TournamentTeams] (
    [TournamentId] int NOT NULL,
    [TeamId] int NOT NULL,
    [RegistrationDate] datetime NOT NULL DEFAULT ((getdate())),
    [Status] nvarchar(50) NOT NULL DEFAULT N'Pending',
    CONSTRAINT [PK_TournamentTeams] PRIMARY KEY ([TournamentId], [TeamId]),
    CONSTRAINT [FK_TournamentTeams_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [Teams] ([TeamID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_TournamentTeams_Tournaments_TournamentId] FOREIGN KEY ([TournamentId]) REFERENCES [Tournaments] ([TournamentId]) ON DELETE NO ACTION
);
GO

CREATE INDEX [IX_Matches_TournamentId] ON [Matches] ([TournamentId]);
GO

CREATE INDEX [IX_TournamentTeams_TeamId] ON [TournamentTeams] ([TeamId]);
GO

ALTER TABLE [Matches] ADD CONSTRAINT [FK_Matches_Tournaments_TournamentId] FOREIGN KEY ([TournamentId]) REFERENCES [Tournaments] ([TournamentId]) ON DELETE SET NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260601145607_AddTournamentRelations', N'8.0.26');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Feedbacks] (
    [FeedbackId] int NOT NULL IDENTITY,
    [UserId] int NULL,
    [Category] nvarchar(50) NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT ((getdate())),
    [Status] nvarchar(50) NOT NULL DEFAULT N'New',
    CONSTRAINT [PK_Feedbacks] PRIMARY KEY ([FeedbackId]),
    CONSTRAINT [FK_Feedbacks_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserID]) ON DELETE SET NULL
);
GO


GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260602000000_AddFeedbacksAndMatchDates', N'8.0.26');
GO

COMMIT;
GO
