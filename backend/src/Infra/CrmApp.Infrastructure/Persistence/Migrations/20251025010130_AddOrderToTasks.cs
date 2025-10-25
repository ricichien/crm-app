using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CrmApp.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderToTasks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "Tasks",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Order",
                table: "Tasks");
        }
    }
}
