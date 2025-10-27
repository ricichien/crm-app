using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using CrmApp.Infrastructure.Persistence;

namespace CrmApp.Infrastructure.Design;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    private const string DefaultConnection = "Data Source=crmapp.db";

    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

        optionsBuilder.UseSqlite(DefaultConnection);

        try
        {
            var ctorWithInterceptor = typeof(AppDbContext).GetConstructor(new[] { typeof(DbContextOptions<AppDbContext>), typeof(object) });
            if (ctorWithInterceptor != null)
            {
                return (AppDbContext?)ctorWithInterceptor.Invoke(new object[] { optionsBuilder.Options, null! })
                       ?? throw new InvalidOperationException("Failed to create AppDbContext via two-arg constructor.");
            }
        }
        catch
        {
        }

        return new AppDbContext(optionsBuilder.Options);
    }
}
