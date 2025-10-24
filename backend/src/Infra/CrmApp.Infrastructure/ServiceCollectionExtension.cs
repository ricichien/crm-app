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
        // Lê connection string (appsettings.json or env). Fallback para sqlite file local.
        var conn = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=crmapp.db";

        // Use SQLite por padrão; mude para UseSqlServer se preferir.
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(conn));

        // Registre outros serviços de infraestrutura aqui (ex.: interceptors, repos)
        return services;
    }
}
