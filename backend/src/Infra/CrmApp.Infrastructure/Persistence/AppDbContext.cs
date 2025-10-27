using System;
using System.Linq;
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using CrmApp.Domain.Entities;
using CrmApp.Domain.Common;

namespace CrmApp.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<TaskItem> TaskItems { get; set; } = null!;
        public DbSet<Lead> Leads { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // --- filtro global para soft-delete (IsDeleted) em todas as entidades AuditableEntity
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                var clrType = entityType.ClrType;
                if (typeof(AuditableEntity).IsAssignableFrom(clrType))
                {
                    var parameter = Expression.Parameter(clrType, "e");
                    var prop = Expression.Property(parameter, nameof(AuditableEntity.IsDeleted));
                    var condition = Expression.Equal(prop, Expression.Constant(false));
                    // cria LambdaExpression tipado dinamicamente e aplica como filtro
                    var lambda = Expression.Lambda(condition, parameter);
                    modelBuilder.Entity(clrType).HasQueryFilter((LambdaExpression)lambda);
                }
            }

            // --- Users
            modelBuilder.Entity<User>(b =>
            {
                b.ToTable("Users");
                b.HasKey(u => u.Id);
                b.Property(u => u.Username).IsRequired().HasMaxLength(100);
                b.Property(u => u.Email).HasMaxLength(200);
                b.Property(u => u.PasswordHash).IsRequired();
            });

            // --- Leads
            modelBuilder.Entity<Lead>(b =>
            {
                b.ToTable("Leads");
                b.HasKey(l => l.Id);
                b.Property(l => l.FirstName).IsRequired().HasMaxLength(100);
                b.Property(l => l.LastName).IsRequired().HasMaxLength(100);
                b.Property(l => l.Email).HasMaxLength(200);
                b.Property(l => l.Company).HasMaxLength(200);

                // opcional: índices
                b.HasIndex(l => l.Email).IsUnique(false);
            });

            // --- TaskItems
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
