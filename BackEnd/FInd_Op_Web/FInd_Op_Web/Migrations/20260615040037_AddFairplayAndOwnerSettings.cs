using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FInd_Op_Web.Migrations
{
    /// <inheritdoc />
    public partial class AddFairplayAndOwnerSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FairplayScore",
                table: "Teams",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FairplayWarnings",
                table: "Teams",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "CloseTime",
                table: "Stadiums",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "OpenTime",
                table: "Stadiums",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SlotDurationMinutes",
                table: "Pitches",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FairplayScore",
                table: "Teams");

            migrationBuilder.DropColumn(
                name: "FairplayWarnings",
                table: "Teams");

            migrationBuilder.DropColumn(
                name: "CloseTime",
                table: "Stadiums");

            migrationBuilder.DropColumn(
                name: "OpenTime",
                table: "Stadiums");

            migrationBuilder.DropColumn(
                name: "SlotDurationMinutes",
                table: "Pitches");
        }
    }
}
