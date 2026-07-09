using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FInd_Op_Web.Migrations
{
    /// <inheritdoc />
    public partial class AddIndividualMatches : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MatchRequests_Teams_RequestingTeamId",
                table: "MatchRequests");

            migrationBuilder.AddColumn<int>(
                name: "FairplayScore",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FairplayWarnings",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RankingScore",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "RequestingTeamId",
                table: "MatchRequests",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "RequestingPlayerId",
                table: "MatchRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AwayPlayerId",
                table: "Matches",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HomePlayerId",
                table: "Matches",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsIndividualMatch",
                table: "Matches",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_MatchRequests_RequestingPlayerId",
                table: "MatchRequests",
                column: "RequestingPlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_AwayPlayerId",
                table: "Matches",
                column: "AwayPlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_HomePlayerId",
                table: "Matches",
                column: "HomePlayerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Matches_Users_AwayPlayerId",
                table: "Matches",
                column: "AwayPlayerId",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Matches_Users_HomePlayerId",
                table: "Matches",
                column: "HomePlayerId",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MatchRequests_Teams_RequestingTeamId",
                table: "MatchRequests",
                column: "RequestingTeamId",
                principalTable: "Teams",
                principalColumn: "TeamID");

            migrationBuilder.AddForeignKey(
                name: "FK_MatchRequests_Users_RequestingPlayerId",
                table: "MatchRequests",
                column: "RequestingPlayerId",
                principalTable: "Users",
                principalColumn: "UserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Matches_Users_AwayPlayerId",
                table: "Matches");

            migrationBuilder.DropForeignKey(
                name: "FK_Matches_Users_HomePlayerId",
                table: "Matches");

            migrationBuilder.DropForeignKey(
                name: "FK_MatchRequests_Teams_RequestingTeamId",
                table: "MatchRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_MatchRequests_Users_RequestingPlayerId",
                table: "MatchRequests");

            migrationBuilder.DropIndex(
                name: "IX_MatchRequests_RequestingPlayerId",
                table: "MatchRequests");

            migrationBuilder.DropIndex(
                name: "IX_Matches_AwayPlayerId",
                table: "Matches");

            migrationBuilder.DropIndex(
                name: "IX_Matches_HomePlayerId",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "FairplayScore",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FairplayWarnings",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "RankingScore",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "RequestingPlayerId",
                table: "MatchRequests");

            migrationBuilder.DropColumn(
                name: "AwayPlayerId",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "HomePlayerId",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "IsIndividualMatch",
                table: "Matches");

            migrationBuilder.AlterColumn<int>(
                name: "RequestingTeamId",
                table: "MatchRequests",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_MatchRequests_Teams_RequestingTeamId",
                table: "MatchRequests",
                column: "RequestingTeamId",
                principalTable: "Teams",
                principalColumn: "TeamID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
