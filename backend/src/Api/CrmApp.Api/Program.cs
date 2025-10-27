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
using CrmApp.Domain.Entities;      // User entity
using CrmApp.Infrastructure.Services; // para UserServiceHelpers (deixe público);      // TaskItemService, LeadService
using CrmApp.Infrastructure.Repositories; // LeadRepository, TaskItemRepository

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

// ---------- Repositórios e services (caso precise registro explícito) ----------
builder.Services.AddScoped<CrmApp.Application.Interfaces.IUserService, CrmApp.Infrastructure.Services.UserService>();
// os outros services (Lead, Task) já devem ser registrados por AddApplication/AddInfrastructure
// builder.Services.AddScoped<ILeadService, LeadService>(); // se necessário
// Leads
// User
// Lead
builder.Services.AddScoped<ILeadService, LeadService>();
builder.Services.AddScoped<ILeadRepository, LeadRepository>();

builder.Services.AddScoped<ITaskItemService, TaskItemService>();
builder.Services.AddScoped<ITaskItemRepository, TaskItemRepository>();

// Outros services/repositories que você tiver



builder.Services.AddHttpContextAccessor();

// ---------- Controllers + JSON options ----------
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// ---------- JWT Authentication ----------
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "MinhaChaveUltraSecretaUltraLonga1234!"; // >= 32 chars recommended

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // dev
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
        Version = "v1.0",
        Description = "API do CRM"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header usando Bearer. Ex: 'Bearer {token}'",
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

    // evita colisões de nomes em schemas
    c.CustomSchemaIds(type => type.FullName!.Replace("+", "."));
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

// ---------- Build app ----------
var app = builder.Build();

// ---------- Apply migrations & seed (dev) ----------
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var db = services.GetRequiredService<AppDbContext>();
        // aplica migrations
        await db.Database.MigrateAsync();
        logger.LogInformation("Migrations applied successfully.");

        // Seed admin user (somente se tabela Users vazia)
        if (!await db.Users.AnyAsync())
        {
            var admin = new User
            {
                Username = "admin",
                Email = "admin@crm.com",
                PasswordHash = UserServiceHelpers.HashPassword("123"), // UserServiceHelpers deve ser public
                Role = "Admin"
            };

            db.Users.Add(admin);
            await db.SaveChangesAsync();
            logger.LogInformation("Seeded admin user: admin / 123");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error applying migrations or seeding.");
    }
}

// ---------- Middleware pipeline ----------
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();

    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "CRM API v1");
        c.RoutePrefix = "swagger"; // /swagger
    });
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("DevCors");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
