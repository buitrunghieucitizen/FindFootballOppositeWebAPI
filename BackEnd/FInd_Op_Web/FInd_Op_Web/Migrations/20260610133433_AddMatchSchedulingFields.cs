using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FInd_Op_Web.Migrations
{
    /// <inheritdoc />
    public partial class AddMatchSchedulingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DurationMinutes",
                table: "Matches",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasExtraTime",
                table: "Matches",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PitchId",
                table: "Matches",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DurationMinutes",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "HasExtraTime",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "PitchId",
                table: "Matches");
        }
    }
}
