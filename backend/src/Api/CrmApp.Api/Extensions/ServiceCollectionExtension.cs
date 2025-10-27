using Microsoft.Extensions.DependencyInjection;
using AutoMapper;
using CrmApp.Application.Interfaces;
using CrmApp.Infrastructure.Services;

namespace CrmApp.Application;

public static class ServiceCollectionExtension
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ILeadService, LeadService>();

        services.AddAutoMapper(typeof(ServiceCollectionExtension).Assembly);

        return services;
    }
}
