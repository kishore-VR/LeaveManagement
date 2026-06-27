using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Novac.Api.Migrations
{
    /// <inheritdoc />
    public partial class FinalModelSetup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Channels");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "TeamMembers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "TeamMembers");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Channels",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
