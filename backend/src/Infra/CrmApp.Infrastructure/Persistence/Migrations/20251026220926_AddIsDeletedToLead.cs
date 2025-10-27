using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CrmApp.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddIsDeletedToLead : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Users",
                newName: "LastModifiedAt");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "TaskItems",
                newName: "LastModifiedAt");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Leads",
                newName: "LastModifiedAt");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "TaskItems",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Leads",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Leads_Email",
                table: "Leads",
                column: "Email");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Leads_Email",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "TaskItems");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Leads");

            migrationBuilder.RenameColumn(
                name: "LastModifiedAt",
                table: "Users",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LastModifiedAt",
                table: "TaskItems",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LastModifiedAt",
                table: "Leads",
                newName: "UpdatedAt");
        }
    }
}
