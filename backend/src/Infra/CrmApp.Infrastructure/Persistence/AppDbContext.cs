using Microsoft.EntityFrameworkCore;
using CrmApp.Domain.Entities;

namespace CrmApp.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<TaskItem> TaskItems { get; set; } = null!;   // <-- usar TaskItems
        public DbSet<Lead> Leads { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(b =>
            {
                b.ToTable("Users");
                b.HasKey(u => u.Id);
                b.Property(u => u.Username).IsRequired().HasMaxLength(100);
                b.Property(u => u.Email).HasMaxLength(200);
                b.Property(u => u.PasswordHash).IsRequired();
            });

            modelBuilder.Entity<Lead>(b =>
            {
                b.ToTable("Leads");
                b.HasKey(l => l.Id);
                b.Property(l => l.FirstName).HasMaxLength(100);
                b.Property(l => l.LastName).HasMaxLength(100);
                b.Property(l => l.Email).HasMaxLength(200);
                b.Property(l => l.Company).HasMaxLength(200);
            });

            modelBuilder.Entity<TaskItem>(b =>
            {
                b.ToTable("TaskItems");
                b.HasKey(t => t.Id);
                b.Property(t => t.Title).IsRequired().HasMaxLength(300);
                b.Property(t => t.Order).IsRequired();

                b.HasOne(t => t.Lead)
                 .WithMany(l => l.Tasks)
                 .HasForeignKey(t => t.LeadId)
                 .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}
