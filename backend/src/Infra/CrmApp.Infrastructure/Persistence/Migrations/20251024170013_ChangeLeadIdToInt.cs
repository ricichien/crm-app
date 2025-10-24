using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CrmApp.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ChangeLeadIdToInt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Leads_LeadId",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_LeadId",
                table: "Tasks");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Tasks",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "TEXT")
                .Annotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddColumn<int>(
                name: "LeadId1",
                table: "Tasks",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Leads",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "TEXT")
                .Annotation("Sqlite:Autoincrement", true);

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_LeadId1",
                table: "Tasks",
                column: "LeadId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Leads_LeadId1",
                table: "Tasks",
                column: "LeadId1",
                principalTable: "Leads",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Leads_LeadId1",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_LeadId1",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "LeadId1",
                table: "Tasks");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Tasks",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .OldAnnotation("Sqlite:Autoincrement", true);

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Leads",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .OldAnnotation("Sqlite:Autoincrement", true);

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_LeadId",
                table: "Tasks",
                column: "LeadId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Leads_LeadId",
                table: "Tasks",
                column: "LeadId",
                principalTable: "Leads",
                principalColumn: "Id");
        }
    }
}
