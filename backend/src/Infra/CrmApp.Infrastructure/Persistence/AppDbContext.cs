// using Microsoft.EntityFrameworkCore;
// using CrmApp.Domain.Entities;
// using CrmApp.Infrastructure.Interceptors;

// namespace CrmApp.Infrastructure.Persistence;

// public class AppDbContext : DbContext
// {
//     // private readonly AuditableEntitySaveChangesInterceptor _auditableEntitySaveChangesInterceptor;

//     public AppDbContext(
//         DbContextOptions<AppDbContext> options,
//         // AuditableEntitySaveChangesInterceptor auditableEntitySaveChangesInterceptor)
//         : base(options)
//     {
//         // _auditableEntitySaveChangesInterceptor = auditableEntitySaveChangesInterceptor;
//     }

//     public DbSet<Lead> Leads => Set<Lead>();
//     public DbSet<TaskItem> Tasks => Set<TaskItem>();

//     protected override void OnModelCreating(ModelBuilder modelBuilder)
//     {
//         modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
//         base.OnModelCreating(modelBuilder);
//     }

//     protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//     {
//         // optionsBuilder.AddInterceptors(_auditableEntitySaveChangesInterceptor);
//     }
// }

using Microsoft.EntityFrameworkCore;
using CrmApp.Domain.Entities;

namespace CrmApp.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        // base.OnModelCreating(modelBuilder);
    }

    // Se você não tiver interceptores ainda, pode remover OnConfiguring
}
