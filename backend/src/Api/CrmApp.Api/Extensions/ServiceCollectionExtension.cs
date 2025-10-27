// FILE: backend/src/Application/CrmApp.Application/ServiceCollectionExtension.cs
using Microsoft.Extensions.DependencyInjection;
using AutoMapper;
using CrmApp.Application.Interfaces;
using CrmApp.Infrastructure.Services;

namespace CrmApp.Application;

public static class ServiceCollectionExtension
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // registra serviços da camada Application
        services.AddScoped<ILeadService, LeadService>();

        // registra AutoMapper e mapeamentos na assembly Application (profiles abaixo)
        services.AddAutoMapper(typeof(ServiceCollectionExtension).Assembly);

        return services;
    }
}
