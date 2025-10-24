using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using CrmApp.Infrastructure.Persistence;
using CrmApp.Api.Middleware;
using CrmApp.Application;
using CrmApp.Infrastructure;
using Serilog;
using CrmApp.Application.Interfaces;
using CrmApp.Application.Services;
using CrmApp.Infrastructure.Repositories;


// NOTE: top-level program with async support
var builder = WebApplication.CreateBuilder(args);

// ---------- Logging (Serilog) ----------
builder.Host.UseSerilog((context, services, configuration) =>
{
    configuration.WriteTo.Console()
                 .ReadFrom.Configuration(context.Configuration)
                 .ReadFrom.Services(services)
                 .Enrich.FromLogContext();
});

// ---------- Add modular services (Application + Infrastructure) ----------
// These extension methods should register AutoMapper, validators, services and DbContext.
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddScoped<ILeadRepository, LeadRepository>();
builder.Services.AddScoped<ILeadService, LeadService>();

builder.Services.AddScoped<ITaskItemRepository, TaskItemRepository>();
builder.Services.AddScoped<ITaskItemService, TaskItemService>();

builder.Services.AddScoped<CrmApp.Application.Interfaces.ITaskItemRepository, CrmApp.Infrastructure.Repositories.TaskItemRepository>();

builder.Services.AddHttpContextAccessor();

// ---------- Controllers / JSON options ----------
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// ---------- Swagger ----------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "CRM API", Version = "v1" });
    // c.EnableAnnotations(); // habilite apenas se Swashbuckle.Annotations estiver instalado
});

// ---------- CORS (dev) ----------
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

Console.WriteLine(">>> Program: antes do Build");
var app = builder.Build();
Console.WriteLine(">>> Program: após Build, antes da migração/seeding");

// ---------- Apply migrations & seed (dev) ----------
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var logger = services.GetRequiredService<ILogger<Program>>();

        // Resolva o DbContext a partir da infraestrutura registrada pela extensão
        var db = services.GetRequiredService<AppDbContext>();

        // Use MigrateAsync para aplicar migrations pendentes (SQLite)
        logger.LogInformation("Applying migrations...");
        await db.Database.MigrateAsync();

        // Invoca SeedData.Initialize se existir (reflexão segura)
        var seedType = AppDomain.CurrentDomain.GetAssemblies()
            .SelectMany(a => a.GetTypes())
            .FirstOrDefault(t => t.Name == "SeedData");
        if (seedType != null)
        {
            var mi = seedType.GetMethod("Initialize", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static);
            if (mi != null)
            {
                logger.LogInformation("Calling SeedData.Initialize...");
                var task = (System.Threading.Tasks.Task?)mi.Invoke(null, new object[] { services });
                if (task != null) await task;
            }
        }

        logger.LogInformation("Migrations & seed finished.");
    }
    catch (Exception ex)
    {
        // Log do erro de inicialização para diagnóstico
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or initializing the database.");
        // não rethrow para permitir que o app tente subir (opcional)
    }
}

// ---------- Middleware pipeline ----------
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "CRM API v1"));
}

// Global exception middleware (custom)
app.UseMiddleware<ExceptionMiddleware>();

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("DevCors");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

Console.WriteLine(">>> Program: antes do app.Run()");
app.Run();

// using System.Text.Json.Serialization;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.OpenApi.Models;
// using CrmApp.Infrastructure.Persistence;
// using CrmApp.Application.Interfaces;
// using CrmApp.Application.Services;
// using Serilog;

// var builder = WebApplication.CreateBuilder(args);

// // ---------- Logging (Serilog) ----------
// // builder.Host.UseSerilog((context, services, configuration) =>
// // {
// //     configuration.ReadFrom.Configuration(context.Configuration)
// //                  .ReadFrom.Services(services)
// //                  .Enrich.FromLogContext();
// // });

// builder.Host.UseSerilog((context, services, configuration) =>
// {
//     configuration.WriteTo.Console()
//                  .ReadFrom.Configuration(context.Configuration)
//                  .ReadFrom.Services(services)
//                  .Enrich.FromLogContext();
// });


// // ---------- Services ----------

// // JSON options
// builder.Services.AddControllers()
//     .AddJsonOptions(options =>
//     {
//         options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
//         options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
//     });

// // Register AppDbContext (SQLite fallback)
// var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
//                        ?? "Data Source=crmapp.db";
// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseSqlite(connectionString));

// // Register AutoMapper (scans assembly where LeadService is defined)
// builder.Services.AddAutoMapper(typeof(LeadService).Assembly);

// // Register application service: 1 registro, com lifetime típico (scoped)
// builder.Services.AddScoped<ILeadService, LeadService>();

// builder.Services.AddHttpContextAccessor();

// // Swagger / OpenAPI
// builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen(c =>
// {
//     c.SwaggerDoc("v1", new OpenApiInfo { Title = "CRM API", Version = "v1" });
//     // c.EnableAnnotations(); // só habilite se Swashbuckle.Annotations estiver instalado
// });

// // CORS para frontend dev
// builder.Services.AddCors(options =>
// {
//     options.AddPolicy("DevCors", policy =>
//     {
//         policy.WithOrigins("http://localhost:4200")
//               .AllowAnyHeader()
//               .AllowAnyMethod();
//     });
// });

// Console.WriteLine(">>> Program: antes do Build");

// var app = builder.Build();

// // ---------- Apply migrations & seed (dev) ----------
// using (var scope = app.Services.CreateScope())
// {
//     var services = scope.ServiceProvider;
//     try
//     {
//         var db = services.GetRequiredService<AppDbContext>();
//         db.Database.Migrate();

//         // tenta chamar SeedData.Initialize se existir
//         var seedType = AppDomain.CurrentDomain.GetAssemblies()
//             .SelectMany(a => a.GetTypes())
//             .FirstOrDefault(t => t.Name == "SeedData");
//         if (seedType != null)
//         {
//             var mi = seedType.GetMethod("Initialize", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static);
//             if (mi != null)
//             {
//                 var task = (System.Threading.Tasks.Task?)mi.Invoke(null, new object[] { services });
//                 task?.GetAwaiter().GetResult();
//             }
//         }
//     }
//     catch (Exception ex)
//     {
//         var logger = services.GetService<ILogger<Program>>();
//         logger?.LogError(ex, "Error while migrating or seeding the database");
//     }
// }

// // ---------- Middleware ----------
// if (app.Environment.IsDevelopment())
// {
//     app.UseDeveloperExceptionPage();
//     app.UseSwagger();
//     app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "CRM API v1"));
// }

// app.UseHttpsRedirection();
// app.UseRouting();
// app.UseCors("DevCors");
// app.UseAuthentication();
// app.UseAuthorization();

// app.MapControllers();
// Console.WriteLine(">>> Program: antes do app.Run()");
// app.Run();
