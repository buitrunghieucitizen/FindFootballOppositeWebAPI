using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FInd_Op_Web.Migrations
{
    /// <inheritdoc />
    public partial class AddMatchChats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MatchChats",
                columns: table => new
                {
                    ChatId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MatchId = table.Column<int>(type: "int", nullable: false),
                    SenderTeamId = table.Column<int>(type: "int", nullable: false),
                    EncryptedMessage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MatchChats", x => x.ChatId);
                    table.ForeignKey(
                        name: "FK_MatchChats_Matches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "Matches",
                        principalColumn: "MatchID");
                    table.ForeignKey(
                        name: "FK_MatchChats_Teams_SenderTeamId",
                        column: x => x.SenderTeamId,
                        principalTable: "Teams",
                        principalColumn: "TeamID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_MatchChats_MatchId",
                table: "MatchChats",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_MatchChats_SenderTeamId",
                table: "MatchChats",
                column: "SenderTeamId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MatchChats");
        }
    }
}
