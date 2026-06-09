using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FInd_Op_Web.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MediaFiles",
                columns: table => new
                {
                    MediaID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EntityType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EntityID = table.Column<int>(type: "int", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__MediaFil__B2C2B5AF86BF5F03", x => x.MediaID);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    RoleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Roles__8AFACE3A9A190F1D", x => x.RoleID);
                });

            migrationBuilder.CreateTable(
                name: "Sports",
                columns: table => new
                {
                    SportId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SportName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sports", x => x.SportId);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    IsFreeAgent = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    IsPremium = table.Column<bool>(type: "bit", nullable: false),
                    PremiumUntil = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Tokens = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Users__1788CCAC4609C301", x => x.UserID);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    NotificationID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RelatedLink = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Notifica__20CF2E32935404C6", x => x.NotificationID);
                    table.ForeignKey(
                        name: "FK__Notificat__UserI__6FE99F9F",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "PaymentTransactions",
                columns: table => new
                {
                    TransactionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<int>(type: "int", nullable: false),
                    OrderCode = table.Column<long>(type: "bigint", nullable: false),
                    TransactionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Premium"),
                    ReferenceId = table.Column<int>(type: "int", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentTransactions", x => x.TransactionId);
                    table.ForeignKey(
                        name: "FK_PaymentTransactions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PlayerSportProfiles",
                columns: table => new
                {
                    ProfileId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlayerId = table.Column<int>(type: "int", nullable: true),
                    SportId = table.Column<int>(type: "int", nullable: true),
                    SkillLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PreferredPosition = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TotalMatches = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    RatingScore = table.Column<decimal>(type: "decimal(5,2)", nullable: true, defaultValue: 0m)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__PlayerSportProfile", x => x.ProfileId);
                    table.ForeignKey(
                        name: "FK_PlayerSportProfile_Sports",
                        column: x => x.SportId,
                        principalTable: "Sports",
                        principalColumn: "SportId");
                    table.ForeignKey(
                        name: "FK_PlayerSportProfile_Users",
                        column: x => x.PlayerId,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "Stadiums",
                columns: table => new
                {
                    StadiumID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OwnerID = table.Column<int>(type: "int", nullable: true),
                    StadiumName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Hotline = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Stadiums__ED833038C8DC0ECE", x => x.StadiumID);
                    table.ForeignKey(
                        name: "FK__Stadiums__OwnerI__4E88ABD4",
                        column: x => x.OwnerID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "Teams",
                columns: table => new
                {
                    TeamID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TeamName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CaptainID = table.Column<int>(type: "int", nullable: true),
                    SportId = table.Column<int>(type: "int", nullable: true),
                    QualityLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    History = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDisbanded = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    HomeArea = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FoundedDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    LookingForOpponent = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    IsSubscriptionActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SubscriptionEndDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    FundBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    IsFundUnlocked = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    RankingScore = table.Column<int>(type: "int", nullable: false, defaultValue: 1000)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Teams__123AE7B988944AE2", x => x.TeamID);
                    table.ForeignKey(
                        name: "FK_Teams_Sports_SportId",
                        column: x => x.SportId,
                        principalTable: "Sports",
                        principalColumn: "SportId");
                    table.ForeignKey(
                        name: "FK__Teams__CaptainID__44FF419A",
                        column: x => x.CaptainID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "TokenTransactions",
                columns: table => new
                {
                    TransactionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    Amount = table.Column<int>(type: "int", nullable: true),
                    TransactionType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TokenTransactions", x => x.TransactionId);
                    table.ForeignKey(
                        name: "FK_TokenTransactions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "int", nullable: false),
                    RoleID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__UserRole__AF27604FE3C98EF0", x => new { x.UserID, x.RoleID });
                    table.ForeignKey(
                        name: "FK__UserRoles__RoleI__403A8C7D",
                        column: x => x.RoleID,
                        principalTable: "Roles",
                        principalColumn: "RoleID");
                    table.ForeignKey(
                        name: "FK__UserRoles__UserI__3F466844",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "Pitches",
                columns: table => new
                {
                    PitchID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StadiumID = table.Column<int>(type: "int", nullable: true),
                    SportId = table.Column<int>(type: "int", nullable: true),
                    PitchName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PitchSize = table.Column<int>(type: "int", nullable: true),
                    PricePerHour = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    GrassType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Pitches__B68228186D58E2AE", x => x.PitchID);
                    table.ForeignKey(
                        name: "FK_Pitches_Sports_SportId",
                        column: x => x.SportId,
                        principalTable: "Sports",
                        principalColumn: "SportId");
                    table.ForeignKey(
                        name: "FK__Pitches__Stadium__5165187F",
                        column: x => x.StadiumID,
                        principalTable: "Stadiums",
                        principalColumn: "StadiumID");
                });

            migrationBuilder.CreateTable(
                name: "Tournaments",
                columns: table => new
                {
                    TournamentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TournamentName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Format = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SportId = table.Column<int>(type: "int", nullable: true),
                    StadiumId = table.Column<int>(type: "int", nullable: true),
                    OrganizerId = table.Column<int>(type: "int", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "Upcoming"),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsFeePaid = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    EntryFee = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tournaments", x => x.TournamentId);
                    table.ForeignKey(
                        name: "FK_Tournaments_Sports_SportId",
                        column: x => x.SportId,
                        principalTable: "Sports",
                        principalColumn: "SportId");
                    table.ForeignKey(
                        name: "FK_Tournaments_Stadiums_StadiumId",
                        column: x => x.StadiumId,
                        principalTable: "Stadiums",
                        principalColumn: "StadiumID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Tournaments_Users_OrganizerId",
                        column: x => x.OrganizerId,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "JoinRequests",
                columns: table => new
                {
                    RequestId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlayerId = table.Column<int>(type: "int", nullable: false),
                    TeamId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RequestType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JoinRequests", x => x.RequestId);
                    table.ForeignKey(
                        name: "FK_JoinRequests_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "TeamID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JoinRequests_Users_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PlayerRatings",
                columns: table => new
                {
                    RatingId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlayerId = table.Column<int>(type: "int", nullable: false),
                    RatedById = table.Column<int>(type: "int", nullable: false),
                    TeamId = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<int>(type: "int", nullable: false),
                    Month = table.Column<int>(type: "int", nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerRatings", x => x.RatingId);
                    table.ForeignKey(
                        name: "FK_PlayerRatings_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "TeamID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlayerRatings_Users_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlayerRatings_Users_RatedById",
                        column: x => x.RatedById,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TeamFundTransactions",
                columns: table => new
                {
                    TransactionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TeamId = table.Column<int>(type: "int", nullable: true),
                    PlayerId = table.Column<int>(type: "int", nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TransactionType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeamFundTransactions", x => x.TransactionId);
                    table.ForeignKey(
                        name: "FK_TeamFundTransactions_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "TeamID");
                    table.ForeignKey(
                        name: "FK_TeamFundTransactions_Users_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "TeamMembers",
                columns: table => new
                {
                    TeamID = table.Column<int>(type: "int", nullable: false),
                    PlayerID = table.Column<int>(type: "int", nullable: false),
                    RoleInTeam = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "Member"),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "Active"),
                    JoinedDate = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__TeamMemb__869E00F323A341A2", x => new { x.TeamID, x.PlayerID });
                    table.ForeignKey(
                        name: "FK__TeamMembe__Playe__48CFD27E",
                        column: x => x.PlayerID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__TeamMembe__TeamI__47DBAE45",
                        column: x => x.TeamID,
                        principalTable: "Teams",
                        principalColumn: "TeamID");
                });

            migrationBuilder.CreateTable(
                name: "TeamSubscriptions",
                columns: table => new
                {
                    SubscriptionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TeamId = table.Column<int>(type: "int", nullable: false),
                    PaidByUserId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PlanType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Basic"),
                    StartDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeamSubscriptions", x => x.SubscriptionId);
                    table.ForeignKey(
                        name: "FK_TeamSubscriptions_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "TeamID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TeamSubscriptions_Users_PaidByUserId",
                        column: x => x.PaidByUserId,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RecurringBookings",
                columns: table => new
                {
                    RecurringID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PitchID = table.Column<int>(type: "int", nullable: true),
                    TeamID = table.Column<int>(type: "int", nullable: true),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    FromDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ToDate = table.Column<DateOnly>(type: "date", nullable: false),
                    IsApproved = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Recurrin__738186825283E687", x => x.RecurringID);
                    table.ForeignKey(
                        name: "FK__Recurring__Pitch__5629CD9C",
                        column: x => x.PitchID,
                        principalTable: "Pitches",
                        principalColumn: "PitchID");
                    table.ForeignKey(
                        name: "FK__Recurring__TeamI__571DF1D5",
                        column: x => x.TeamID,
                        principalTable: "Teams",
                        principalColumn: "TeamID");
                });

            migrationBuilder.CreateTable(
                name: "TournamentFees",
                columns: table => new
                {
                    FeeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TournamentId = table.Column<int>(type: "int", nullable: false),
                    PaidByUserId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TournamentFees", x => x.FeeId);
                    table.ForeignKey(
                        name: "FK_TournamentFees_Tournaments_TournamentId",
                        column: x => x.TournamentId,
                        principalTable: "Tournaments",
                        principalColumn: "TournamentId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TournamentFees_Users_PaidByUserId",
                        column: x => x.PaidByUserId,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PitchSchedules",
                columns: table => new
                {
                    ScheduleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PitchID = table.Column<int>(type: "int", nullable: true),
                    BookedByID = table.Column<int>(type: "int", nullable: true),
                    RecurringID = table.Column<int>(type: "int", nullable: true),
                    StartTime = table.Column<DateTime>(type: "datetime", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime", nullable: false),
                    ScheduleStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "Confirmed")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__PitchSch__9C8A5B694BB6F176", x => x.ScheduleID);
                    table.ForeignKey(
                        name: "FK__PitchSche__Booke__5BE2A6F2",
                        column: x => x.BookedByID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__PitchSche__Pitch__5AEE82B9",
                        column: x => x.PitchID,
                        principalTable: "Pitches",
                        principalColumn: "PitchID");
                    table.ForeignKey(
                        name: "FK__PitchSche__Recur__5CD6CB2B",
                        column: x => x.RecurringID,
                        principalTable: "RecurringBookings",
                        principalColumn: "RecurringID");
                });

            migrationBuilder.CreateTable(
                name: "BookingCommissions",
                columns: table => new
                {
                    CommissionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ScheduleId = table.Column<int>(type: "int", nullable: false),
                    StadiumOwnerId = table.Column<int>(type: "int", nullable: false),
                    BookingAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CommissionRate = table.Column<decimal>(type: "decimal(5,4)", nullable: false),
                    CommissionAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingCommissions", x => x.CommissionId);
                    table.ForeignKey(
                        name: "FK_BookingCommissions_PitchSchedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "PitchSchedules",
                        principalColumn: "ScheduleID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BookingCommissions_Users_StadiumOwnerId",
                        column: x => x.StadiumOwnerId,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Matches",
                columns: table => new
                {
                    MatchID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HomeTeamID = table.Column<int>(type: "int", nullable: true),
                    AwayTeamID = table.Column<int>(type: "int", nullable: true),
                    SportId = table.Column<int>(type: "int", nullable: true),
                    ScheduleID = table.Column<int>(type: "int", nullable: true),
                    MatchStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CancelRequestedBy = table.Column<int>(type: "int", nullable: true),
                    CancelReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HomeScore = table.Column<int>(type: "int", nullable: true),
                    AwayScore = table.Column<int>(type: "int", nullable: true),
                    ResultVisibility = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "Public"),
                    HomeConfirmed = table.Column<bool>(type: "bit", nullable: true),
                    AwayConfirmed = table.Column<bool>(type: "bit", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    MatchType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "Friendly")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Matches__4218C8373268C8E4", x => x.MatchID);
                    table.ForeignKey(
                        name: "FK_Matches_Sports_SportId",
                        column: x => x.SportId,
                        principalTable: "Sports",
                        principalColumn: "SportId");
                    table.ForeignKey(
                        name: "FK__Matches__AwayTea__6383C8BA",
                        column: x => x.AwayTeamID,
                        principalTable: "Teams",
                        principalColumn: "TeamID");
                    table.ForeignKey(
                        name: "FK__Matches__CancelR__656C112C",
                        column: x => x.CancelRequestedBy,
                        principalTable: "Teams",
                        principalColumn: "TeamID");
                    table.ForeignKey(
                        name: "FK__Matches__HomeTea__628FA481",
                        column: x => x.HomeTeamID,
                        principalTable: "Teams",
                        principalColumn: "TeamID");
                    table.ForeignKey(
                        name: "FK__Matches__Schedul__6477ECF3",
                        column: x => x.ScheduleID,
                        principalTable: "PitchSchedules",
                        principalColumn: "ScheduleID");
                });

            migrationBuilder.CreateTable(
                name: "MatchPolls",
                columns: table => new
                {
                    MatchID = table.Column<int>(type: "int", nullable: false),
                    PlayerID = table.Column<int>(type: "int", nullable: false),
                    IsAttending = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__MatchPol__D6BC2F7D6D6D5E38", x => new { x.MatchID, x.PlayerID });
                    table.ForeignKey(
                        name: "FK__MatchPoll__Match__66603565",
                        column: x => x.MatchID,
                        principalTable: "Matches",
                        principalColumn: "MatchID");
                    table.ForeignKey(
                        name: "FK__MatchPoll__Playe__6754599E",
                        column: x => x.PlayerID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "Posts",
                columns: table => new
                {
                    PostId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TeamId = table.Column<int>(type: "int", nullable: false),
                    AuthorId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MatchId = table.Column<int>(type: "int", nullable: true),
                    ImageUrls = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PostType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Posts", x => x.PostId);
                    table.ForeignKey(
                        name: "FK_Posts_Matches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "Matches",
                        principalColumn: "MatchID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Posts_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "TeamID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Posts_Users_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RecruitmentAds",
                columns: table => new
                {
                    AdID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TeamID = table.Column<int>(type: "int", nullable: true),
                    SportId = table.Column<int>(type: "int", nullable: true),
                    MatchID = table.Column<int>(type: "int", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PositionNeeded = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsBoosted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    BoostUntil = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Recruitm__7130D58EB18579EB", x => x.AdID);
                    table.ForeignKey(
                        name: "FK_RecruitmentAds_Sports_SportId",
                        column: x => x.SportId,
                        principalTable: "Sports",
                        principalColumn: "SportId");
                    table.ForeignKey(
                        name: "FK__Recruitme__Match__6EF57B66",
                        column: x => x.MatchID,
                        principalTable: "Matches",
                        principalColumn: "MatchID");
                    table.ForeignKey(
                        name: "FK__Recruitme__TeamI__6E01572D",
                        column: x => x.TeamID,
                        principalTable: "Teams",
                        principalColumn: "TeamID");
                });

            migrationBuilder.CreateTable(
                name: "TeamRatings",
                columns: table => new
                {
                    RatingId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RatedTeamId = table.Column<int>(type: "int", nullable: false),
                    ReviewerTeamId = table.Column<int>(type: "int", nullable: false),
                    MatchId = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeamRatings", x => x.RatingId);
                    table.ForeignKey(
                        name: "FK_TeamRatings_Matches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "Matches",
                        principalColumn: "MatchID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TeamRatings_Teams_RatedTeamId",
                        column: x => x.RatedTeamId,
                        principalTable: "Teams",
                        principalColumn: "TeamID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TeamRatings_Teams_ReviewerTeamId",
                        column: x => x.ReviewerTeamId,
                        principalTable: "Teams",
                        principalColumn: "TeamID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AdBoosts",
                columns: table => new
                {
                    BoostId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RecruitmentAdId = table.Column<int>(type: "int", nullable: true),
                    PostId = table.Column<int>(type: "int", nullable: true),
                    BoostedByUserId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BoostStartDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    BoostEndDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
                    IsPriority = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdBoosts", x => x.BoostId);
                    table.ForeignKey(
                        name: "FK_AdBoosts_Posts_PostId",
                        column: x => x.PostId,
                        principalTable: "Posts",
                        principalColumn: "PostId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_AdBoosts_RecruitmentAds_RecruitmentAdId",
                        column: x => x.RecruitmentAdId,
                        principalTable: "RecruitmentAds",
                        principalColumn: "AdID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_AdBoosts_Users_BoostedByUserId",
                        column: x => x.BoostedByUserId,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdBoosts_BoostedByUserId",
                table: "AdBoosts",
                column: "BoostedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AdBoosts_PostId",
                table: "AdBoosts",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_AdBoosts_RecruitmentAdId",
                table: "AdBoosts",
                column: "RecruitmentAdId");

            migrationBuilder.CreateIndex(
                name: "IX_BookingCommissions_ScheduleId",
                table: "BookingCommissions",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_BookingCommissions_StadiumOwnerId",
                table: "BookingCommissions",
                column: "StadiumOwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_JoinRequests_PlayerId",
                table: "JoinRequests",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_JoinRequests_TeamId",
                table: "JoinRequests",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_AwayTeamID",
                table: "Matches",
                column: "AwayTeamID");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_CancelRequestedBy",
                table: "Matches",
                column: "CancelRequestedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_HomeTeamID",
                table: "Matches",
                column: "HomeTeamID");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_ScheduleID",
                table: "Matches",
                column: "ScheduleID");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_SportId",
                table: "Matches",
                column: "SportId");

            migrationBuilder.CreateIndex(
                name: "IX_MatchPolls_PlayerID",
                table: "MatchPolls",
                column: "PlayerID");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserID",
                table: "Notifications",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_UserId",
                table: "PaymentTransactions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Pitches_SportId",
                table: "Pitches",
                column: "SportId");

            migrationBuilder.CreateIndex(
                name: "IX_Pitches_StadiumID",
                table: "Pitches",
                column: "StadiumID");

            migrationBuilder.CreateIndex(
                name: "IX_PitchSchedules_BookedByID",
                table: "PitchSchedules",
                column: "BookedByID");

            migrationBuilder.CreateIndex(
                name: "IX_PitchSchedules_PitchID",
                table: "PitchSchedules",
                column: "PitchID");

            migrationBuilder.CreateIndex(
                name: "IX_PitchSchedules_RecurringID",
                table: "PitchSchedules",
                column: "RecurringID");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerRatings_PlayerId",
                table: "PlayerRatings",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerRatings_RatedById",
                table: "PlayerRatings",
                column: "RatedById");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerRatings_TeamId",
                table: "PlayerRatings",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerSportProfiles_PlayerId",
                table: "PlayerSportProfiles",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerSportProfiles_SportId",
                table: "PlayerSportProfiles",
                column: "SportId");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_AuthorId",
                table: "Posts",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_MatchId",
                table: "Posts",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_TeamId",
                table: "Posts",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentAds_MatchID",
                table: "RecruitmentAds",
                column: "MatchID");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentAds_SportId",
                table: "RecruitmentAds",
                column: "SportId");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentAds_TeamID",
                table: "RecruitmentAds",
                column: "TeamID");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringBookings_PitchID",
                table: "RecurringBookings",
                column: "PitchID");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringBookings_TeamID",
                table: "RecurringBookings",
                column: "TeamID");

            migrationBuilder.CreateIndex(
                name: "UQ__Roles__8A2B61607CAA59C5",
                table: "Roles",
                column: "RoleName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Stadiums_OwnerID",
                table: "Stadiums",
                column: "OwnerID");

            migrationBuilder.CreateIndex(
                name: "IX_TeamFundTransactions_PlayerId",
                table: "TeamFundTransactions",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_TeamFundTransactions_TeamId",
                table: "TeamFundTransactions",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_TeamMembers_PlayerID",
                table: "TeamMembers",
                column: "PlayerID");

            migrationBuilder.CreateIndex(
                name: "IX_TeamRatings_MatchId",
                table: "TeamRatings",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_TeamRatings_RatedTeamId",
                table: "TeamRatings",
                column: "RatedTeamId");

            migrationBuilder.CreateIndex(
                name: "IX_TeamRatings_ReviewerTeamId",
                table: "TeamRatings",
                column: "ReviewerTeamId");

            migrationBuilder.CreateIndex(
                name: "IX_Teams_CaptainID",
                table: "Teams",
                column: "CaptainID");

            migrationBuilder.CreateIndex(
                name: "IX_Teams_SportId",
                table: "Teams",
                column: "SportId");

            migrationBuilder.CreateIndex(
                name: "IX_TeamSubscriptions_PaidByUserId",
                table: "TeamSubscriptions",
                column: "PaidByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TeamSubscriptions_TeamId",
                table: "TeamSubscriptions",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_TokenTransactions_UserId",
                table: "TokenTransactions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentFees_PaidByUserId",
                table: "TournamentFees",
                column: "PaidByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentFees_TournamentId",
                table: "TournamentFees",
                column: "TournamentId");

            migrationBuilder.CreateIndex(
                name: "IX_Tournaments_OrganizerId",
                table: "Tournaments",
                column: "OrganizerId");

            migrationBuilder.CreateIndex(
                name: "IX_Tournaments_SportId",
                table: "Tournaments",
                column: "SportId");

            migrationBuilder.CreateIndex(
                name: "IX_Tournaments_StadiumId",
                table: "Tournaments",
                column: "StadiumId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleID",
                table: "UserRoles",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "UQ__Users__536C85E42A2264E0",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdBoosts");

            migrationBuilder.DropTable(
                name: "BookingCommissions");

            migrationBuilder.DropTable(
                name: "JoinRequests");

            migrationBuilder.DropTable(
                name: "MatchPolls");

            migrationBuilder.DropTable(
                name: "MediaFiles");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "PaymentTransactions");

            migrationBuilder.DropTable(
                name: "PlayerRatings");

            migrationBuilder.DropTable(
                name: "PlayerSportProfiles");

            migrationBuilder.DropTable(
                name: "TeamFundTransactions");

            migrationBuilder.DropTable(
                name: "TeamMembers");

            migrationBuilder.DropTable(
                name: "TeamRatings");

            migrationBuilder.DropTable(
                name: "TeamSubscriptions");

            migrationBuilder.DropTable(
                name: "TokenTransactions");

            migrationBuilder.DropTable(
                name: "TournamentFees");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "Posts");

            migrationBuilder.DropTable(
                name: "RecruitmentAds");

            migrationBuilder.DropTable(
                name: "Tournaments");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Matches");

            migrationBuilder.DropTable(
                name: "PitchSchedules");

            migrationBuilder.DropTable(
                name: "RecurringBookings");

            migrationBuilder.DropTable(
                name: "Pitches");

            migrationBuilder.DropTable(
                name: "Teams");

            migrationBuilder.DropTable(
                name: "Stadiums");

            migrationBuilder.DropTable(
                name: "Sports");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
