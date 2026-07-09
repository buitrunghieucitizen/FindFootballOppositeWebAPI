BEGIN TRANSACTION;
GO

ALTER TABLE [Matches] ADD [AwayConfirmed] bit NULL;
GO

ALTER TABLE [Matches] ADD [AwayScore] int NULL;
GO

ALTER TABLE [Matches] ADD [ExpiresAt] datetime2 NULL;
GO

ALTER TABLE [Matches] ADD [HomeConfirmed] bit NULL;
GO

ALTER TABLE [Matches] ADD [HomeScore] int NULL;
GO

ALTER TABLE [Matches] ADD [MatchType] nvarchar(max) NULL;
GO

ALTER TABLE [Matches] ADD [ResultVisibility] nvarchar(max) NULL;
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

CREATE TABLE [Posts] (
    [PostId] int NOT NULL IDENTITY,
    [TeamId] int NOT NULL,
    [AuthorId] int NOT NULL,
    [Title] nvarchar(max) NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [MatchId] int NULL,
    [ImageUrls] nvarchar(max) NULL,
    [PostType] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_Posts] PRIMARY KEY ([PostId]),
    CONSTRAINT [FK_Posts_Matches_MatchId] FOREIGN KEY ([MatchId]) REFERENCES [Matches] ([MatchID]) ON DELETE SET NULL,
    CONSTRAINT [FK_Posts_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [Teams] ([TeamID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Posts_Users_AuthorId] FOREIGN KEY ([AuthorId]) REFERENCES [Users] ([UserID]) ON DELETE NO ACTION
);
GO

CREATE INDEX [IX_JoinRequests_PlayerId] ON [JoinRequests] ([PlayerId]);
GO

CREATE INDEX [IX_JoinRequests_TeamId] ON [JoinRequests] ([TeamId]);
GO

CREATE INDEX [IX_PlayerRatings_PlayerId] ON [PlayerRatings] ([PlayerId]);
GO

CREATE INDEX [IX_PlayerRatings_RatedById] ON [PlayerRatings] ([RatedById]);
GO

CREATE INDEX [IX_PlayerRatings_TeamId] ON [PlayerRatings] ([TeamId]);
GO

CREATE INDEX [IX_Posts_AuthorId] ON [Posts] ([AuthorId]);
GO

CREATE INDEX [IX_Posts_MatchId] ON [Posts] ([MatchId]);
GO

CREATE INDEX [IX_Posts_TeamId] ON [Posts] ([TeamId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260520013014_Phase3CaptainModule', N'8.0.26');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Users] ADD [IsPremium] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [Users] ADD [PremiumUntil] datetime2 NULL;
GO

ALTER TABLE [Tournaments] ADD [EntryFee] decimal(18,2) NULL;
GO

ALTER TABLE [Tournaments] ADD [IsFeePaid] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [Teams] ADD [IsSubscriptionActive] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [Teams] ADD [RankingScore] int NOT NULL DEFAULT 0;
GO

ALTER TABLE [Teams] ADD [SubscriptionEndDate] datetime NULL;
GO

ALTER TABLE [RecruitmentAds] ADD [BoostUntil] datetime NULL;
GO

ALTER TABLE [RecruitmentAds] ADD [IsBoosted] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [Posts] ADD [Status] nvarchar(max) NOT NULL DEFAULT N'';
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

CREATE TABLE [TournamentFees] (
    [FeeId] int NOT NULL IDENTITY,
    [TournamentId] int NOT NULL,
    [PaidByUserId] int NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Status] nvarchar(50) NOT NULL DEFAULT N'Pending',
    [CreatedAt] datetime NOT NULL DEFAULT ((getdate())),
    CONSTRAINT [PK_TournamentFees] PRIMARY KEY ([FeeId]),
    CONSTRAINT [FK_TournamentFees_Tournaments_TournamentId] FOREIGN KEY ([TournamentId]) REFERENCES [Tournaments] ([TournamentID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_TournamentFees_Users_PaidByUserId] FOREIGN KEY ([PaidByUserId]) REFERENCES [Users] ([UserID]) ON DELETE NO ACTION
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

CREATE INDEX [IX_PaymentTransactions_UserId] ON [PaymentTransactions] ([UserId]);
GO

CREATE INDEX [IX_TeamRatings_MatchId] ON [TeamRatings] ([MatchId]);
GO

CREATE INDEX [IX_TeamRatings_RatedTeamId] ON [TeamRatings] ([RatedTeamId]);
GO

CREATE INDEX [IX_TeamRatings_ReviewerTeamId] ON [TeamRatings] ([ReviewerTeamId]);
GO

CREATE INDEX [IX_TeamSubscriptions_PaidByUserId] ON [TeamSubscriptions] ([PaidByUserId]);
GO

CREATE INDEX [IX_TeamSubscriptions_TeamId] ON [TeamSubscriptions] ([TeamId]);
GO

CREATE INDEX [IX_TournamentFees_PaidByUserId] ON [TournamentFees] ([PaidByUserId]);
GO

CREATE INDEX [IX_TournamentFees_TournamentId] ON [TournamentFees] ([TournamentId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260522025648_AddTeamRatingAndRanking', N'8.0.26');
GO

COMMIT;
GO

