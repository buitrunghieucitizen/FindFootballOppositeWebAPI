BEGIN TRANSACTION;
GO

ALTER TABLE [Users] ADD [Email] nvarchar(max) NULL;
GO

ALTER TABLE [TournamentTeams] ADD [NoBettingCommitment] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [Tournaments] ADD [MaxPlayersPerTeam] int NULL;
GO

ALTER TABLE [Stadiums] ADD [BankAccountName] nvarchar(max) NULL;
GO

ALTER TABLE [Stadiums] ADD [BankAccountNumber] nvarchar(max) NULL;
GO

ALTER TABLE [Stadiums] ADD [BankName] nvarchar(max) NULL;
GO

ALTER TABLE [Stadiums] ADD [Latitude] float NULL;
GO

ALTER TABLE [Stadiums] ADD [Longitude] float NULL;
GO

ALTER TABLE [Matches] ADD [EndTime] time NULL;
GO

ALTER TABLE [Matches] ADD [MatchDate] datetime2 NULL;
GO

ALTER TABLE [Matches] ADD [StartTime] time NULL;
GO

CREATE TABLE [Feedbacks] (
    [FeedbackId] int NOT NULL IDENTITY,
    [UserId] int NULL,
    [Category] nvarchar(50) NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [Status] nvarchar(50) NOT NULL,
    CONSTRAINT [PK_Feedbacks] PRIMARY KEY ([FeedbackId]),
    CONSTRAINT [FK_Feedbacks_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserID])
);
GO

CREATE TABLE [SystemInvoices] (
    [InvoiceId] int NOT NULL IDENTITY,
    [StadiumOwnerId] int NOT NULL,
    [Month] int NOT NULL,
    [Year] int NOT NULL,
    [TotalRevenue] decimal(18,2) NOT NULL,
    [TotalCommission] decimal(18,2) NOT NULL,
    [TotalPayableToOwner] decimal(18,2) NOT NULL,
    [Status] nvarchar(50) NOT NULL,
    [PdfUrl] nvarchar(255) NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_SystemInvoices] PRIMARY KEY ([InvoiceId]),
    CONSTRAINT [FK_SystemInvoices_Users_StadiumOwnerId] FOREIGN KEY ([StadiumOwnerId]) REFERENCES [Users] ([UserID]) ON DELETE CASCADE
);
GO

CREATE TABLE [TournamentTeamPlayers] (
    [Id] int NOT NULL IDENTITY,
    [TournamentId] int NOT NULL,
    [TeamId] int NOT NULL,
    [PlayerId] int NOT NULL,
    CONSTRAINT [PK_TournamentTeamPlayers] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_TournamentTeamPlayers_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [Teams] ([TeamID]) ON DELETE CASCADE,
    CONSTRAINT [FK_TournamentTeamPlayers_Tournaments_TournamentId] FOREIGN KEY ([TournamentId]) REFERENCES [Tournaments] ([TournamentId]) ON DELETE CASCADE,
    CONSTRAINT [FK_TournamentTeamPlayers_Users_PlayerId] FOREIGN KEY ([PlayerId]) REFERENCES [Users] ([UserID]) ON DELETE CASCADE
);
GO

CREATE TABLE [WithdrawalRequests] (
    [RequestId] int NOT NULL IDENTITY,
    [StadiumOwnerId] int NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Status] nvarchar(50) NOT NULL,
    [ReceiptImage] nvarchar(255) NULL,
    [RequestedAt] datetime2 NOT NULL,
    [ProcessedAt] datetime2 NULL,
    CONSTRAINT [PK_WithdrawalRequests] PRIMARY KEY ([RequestId]),
    CONSTRAINT [FK_WithdrawalRequests_Users_StadiumOwnerId] FOREIGN KEY ([StadiumOwnerId]) REFERENCES [Users] ([UserID]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_Feedbacks_UserId] ON [Feedbacks] ([UserId]);
GO

CREATE INDEX [IX_SystemInvoices_StadiumOwnerId] ON [SystemInvoices] ([StadiumOwnerId]);
GO

CREATE INDEX [IX_TournamentTeamPlayers_PlayerId] ON [TournamentTeamPlayers] ([PlayerId]);
GO

CREATE INDEX [IX_TournamentTeamPlayers_TeamId] ON [TournamentTeamPlayers] ([TeamId]);
GO

CREATE INDEX [IX_TournamentTeamPlayers_TournamentId] ON [TournamentTeamPlayers] ([TournamentId]);
GO

CREATE INDEX [IX_WithdrawalRequests_StadiumOwnerId] ON [WithdrawalRequests] ([StadiumOwnerId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260605020745_AddNewFeatures2', N'8.0.26');
GO

COMMIT;
GO

