using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FInd_Op_Web.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTournamentBracketAndInternalTeam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BracketJson",
                table: "Tournaments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsInternal",
                table: "Teams",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BracketJson",
                table: "Tournaments");

            migrationBuilder.DropColumn(
                name: "IsInternal",
                table: "Teams");
        }
    }
}
