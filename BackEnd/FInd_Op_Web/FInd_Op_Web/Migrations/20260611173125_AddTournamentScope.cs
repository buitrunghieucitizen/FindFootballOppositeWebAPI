using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FInd_Op_Web.Migrations
{
    /// <inheritdoc />
    public partial class AddTournamentScope : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Scope",
                table: "Tournaments",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                defaultValue: "Public");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Scope",
                table: "Tournaments");
        }
    }
}
