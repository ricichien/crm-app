// FILE: backend/src/Infra/CrmApp.Infrastructure/ServiceCollectionExtensions.cs
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using CrmApp.Infrastructure.Persistence;

namespace CrmApp.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var conn = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=crmapp.db";

        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(conn));

        return services;
    }
}
