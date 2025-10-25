// using System.Text.Json.Serialization;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.OpenApi.Models;
// using CrmApp.Infrastructure.Persistence;
// using CrmApp.Api.Middleware;
// using CrmApp.Application;
// using CrmApp.Infrastructure;
// using Serilog;
// using CrmApp.Application.Interfaces;
// using CrmApp.Application.Services;
// using CrmApp.Infrastructure.Repositories;


// // NOTE: top-level program with async support
// var builder = WebApplication.CreateBuilder(args);

// // ---------- Logging (Serilog) ----------
// builder.Host.UseSerilog((context, services, configuration) =>
// {
//     configuration.WriteTo.Console()
//                  .ReadFrom.Configuration(context.Configuration)
//                  .ReadFrom.Services(services)
//                  .Enrich.FromLogContext();
// });

// // ---------- Add modular services (Application + Infrastructure) ----------
// // These extension methods should register AutoMapper, validators, services and DbContext.
// builder.Services.AddApplication();
// builder.Services.AddInfrastructure(builder.Configuration);
// builder.Services.AddScoped<ILeadRepository, LeadRepository>();
// builder.Services.AddScoped<ILeadService, LeadService>();

// builder.Services.AddScoped<ITaskItemRepository, TaskItemRepository>();
// builder.Services.AddScoped<ITaskItemService, TaskItemService>();

// builder.Services.AddScoped<CrmApp.Application.Interfaces.ITaskItemRepository, CrmApp.Infrastructure.Repositories.TaskItemRepository>();

// builder.Services.AddHttpContextAccessor();

// // ---------- Controllers / JSON options ----------
// builder.Services.AddControllers()
//     .AddJsonOptions(options =>
//     {
//         options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
//         options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
//     });

// // ---------- Swagger ----------
// builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen(c =>
// {
//     c.SwaggerDoc("v1", new OpenApiInfo { Title = "CRM API", Version = "v1" });
//     // c.EnableAnnotations(); // habilite apenas se Swashbuckle.Annotations estiver instalado
// });

// // ---------- CORS (dev) ----------
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
// Console.WriteLine(">>> Program: após Build, antes da migração/seeding");

// // ---------- Apply migrations & seed (dev) ----------
// using (var scope = app.Services.CreateScope())
// {
//     var services = scope.ServiceProvider;
//     try
//     {
//         var logger = services.GetRequiredService<ILogger<Program>>();

//         // Resolva o DbContext a partir da infraestrutura registrada pela extensão
//         var db = services.GetRequiredService<AppDbContext>();

//         // Use MigrateAsync para aplicar migrations pendentes (SQLite)
//         logger.LogInformation("Applying migrations...");
//         await db.Database.MigrateAsync();

//         // Invoca SeedData.Initialize se existir (reflexão segura)
//         var seedType = AppDomain.CurrentDomain.GetAssemblies()
//             .SelectMany(a => a.GetTypes())
//             .FirstOrDefault(t => t.Name == "SeedData");
//         if (seedType != null)
//         {
//             var mi = seedType.GetMethod("Initialize", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static);
//             if (mi != null)
//             {
//                 logger.LogInformation("Calling SeedData.Initialize...");
//                 var task = (System.Threading.Tasks.Task?)mi.Invoke(null, new object[] { services });
//                 if (task != null) await task;
//             }
//         }

//         logger.LogInformation("Migrations & seed finished.");
//     }
//     catch (Exception ex)
//     {
//         // Log do erro de inicialização para diagnóstico
//         var logger = services.GetRequiredService<ILogger<Program>>();
//         logger.LogError(ex, "An error occurred while migrating or initializing the database.");
//         // não rethrow para permitir que o app tente subir (opcional)
//     }
// }

// // ---------- Middleware pipeline ----------
// if (app.Environment.IsDevelopment())
// {
//     app.UseDeveloperExceptionPage();
//     app.UseSwagger();
//     app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "CRM API v1"));
// }

// // Global exception middleware (custom)
// app.UseMiddleware<ExceptionMiddleware>();

// app.UseHttpsRedirection();
// app.UseRouting();
// app.UseCors("DevCors");
// app.UseAuthentication();
// app.UseAuthorization();

// app.MapControllers();

// Console.WriteLine(">>> Program: antes do app.Run()");
// app.Run();

using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using CrmApp.Infrastructure.Persistence;
using CrmApp.Application;
using CrmApp.Infrastructure;
using Serilog;
using CrmApp.Application.Interfaces;
using CrmApp.Application.Services;
using CrmApp.Infrastructure.Repositories;

// top-level statement
var builder = WebApplication.CreateBuilder(args);

// ---------- Logging (Serilog) ----------
builder.Host.UseSerilog((context, services, configuration) =>
{
    configuration.WriteTo.Console()
                 .ReadFrom.Configuration(context.Configuration)
                 .ReadFrom.Services(services)
                 .Enrich.FromLogContext();
});

// ---------- Add modular services ----------
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// ---------- Repositórios e services ----------
builder.Services.AddScoped<ILeadRepository, LeadRepository>();
builder.Services.AddScoped<ILeadService, LeadService>();
builder.Services.AddScoped<ITaskItemRepository, TaskItemRepository>();
builder.Services.AddScoped<ITaskItemService, TaskItemService>();
builder.Services.AddHttpContextAccessor();

// ---------- Controllers + JSON options ----------
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// ---------- JWT Authentication ----------
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "MinhaChaveUltraSecretaUltraLonga1234!";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})

.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.Zero
    };
});

// ---------- Swagger ----------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CRM API",
        Version = "v1.0", // use um formato de versão válido, ex: "v1.0"
        Description = "API do CRM",
    });

    // JWT
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using Bearer scheme. Ex: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });

    // Evita conflito de nomes de schemas
    c.CustomSchemaIds(type => type.FullName.Replace("+", "."));
});

// ---------- CORS ----------
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ---------- Build App ----------
var app = builder.Build();

// ---------- Apply migrations & seed ----------
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var db = services.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();
        logger.LogInformation("Migrations applied successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error applying migrations.");
    }
}

// ---------- Middleware pipeline ----------
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();

    // Swagger
    app.UseSwagger(c =>
    {
        c.RouteTemplate = "swagger/{documentName}/swagger.json";
    });
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "CRM API v1");
        c.RoutePrefix = "swagger"; // acessa pelo /swagger
    });
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("DevCors");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

