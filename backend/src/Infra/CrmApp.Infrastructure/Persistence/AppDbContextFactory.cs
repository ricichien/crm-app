using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using CrmApp.Infrastructure.Persistence;

namespace CrmApp.Infrastructure.Design;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    // Ajuste a connection string conforme quiser (usa SQLite por padrão)
    private const string DefaultConnection = "Data Source=crmapp.db";

    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

        // Use SQLite (simples para dev). Se preferir SQL Server, troque UseSqlite por UseSqlServer.
        optionsBuilder.UseSqlite(DefaultConnection);

        // Se seu AppDbContext possui apenas (DbContextOptions<AppDbContext>) no construtor:
        // return new AppDbContext(optionsBuilder.Options);

        // Se ainda tiver o interceptor no construtor (DbContextOptions, AuditableEntitySaveChangesInterceptor),
        // passamos null para o interceptor em design-time com null-forgiving (!) — só para gerar migrations.
        try
        {
            // tenta construtor (options, interceptor)
            var ctorWithInterceptor = typeof(AppDbContext).GetConstructor(new[] { typeof(DbContextOptions<AppDbContext>), typeof(object) });
            if (ctorWithInterceptor != null)
            {
                // cria usando reflection e passa null para o interceptor
                return (AppDbContext?)ctorWithInterceptor.Invoke(new object[] { optionsBuilder.Options, null! })
                       ?? throw new InvalidOperationException("Failed to create AppDbContext via two-arg constructor.");
            }
        }
        catch
        {
            // fallback abaixo
        }

        // fallback: construtor simples (DbContextOptions<AppDbContext>)
        return new AppDbContext(optionsBuilder.Options);
    }
}
