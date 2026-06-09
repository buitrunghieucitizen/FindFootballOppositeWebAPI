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

