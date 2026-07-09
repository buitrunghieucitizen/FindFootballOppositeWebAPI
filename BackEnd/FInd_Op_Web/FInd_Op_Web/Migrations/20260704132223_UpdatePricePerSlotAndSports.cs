using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FInd_Op_Web.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePricePerSlotAndSports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PricePerHour",
                table: "Pitches",
                newName: "PricePerSlot");

            migrationBuilder.AddColumn<bool>(
                name: "HasScoring",
                table: "Sports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SetScores",
                table: "Matches",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HasScoring",
                table: "Sports");

            migrationBuilder.DropColumn(
                name: "SetScores",
                table: "Matches");

            migrationBuilder.RenameColumn(
                name: "PricePerSlot",
                table: "Pitches",
                newName: "PricePerHour");
        }
    }
}
