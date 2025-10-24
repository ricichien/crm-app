// var builder = WebApplication.CreateBuilder(args);

// // Add services to the container.
// // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
// builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

// var app = builder.Build();

// // Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }

// var summaries = new[]
// {
//     "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
// };

// app.MapGet("/weatherforecast", () =>
// {
//     var forecast =  Enumerable.Range(1, 5).Select(index =>
//         new WeatherForecast
//         (
//             DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
//             Random.Shared.Next(-20, 55),
//             summaries[Random.Shared.Next(summaries.Length)]
//         ))
//         .ToArray();
//     return forecast;
// })
// .WithName("GetWeatherForecast")
// .WithOpenApi();

// app.Run();

// record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
// {
//     public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
// }

using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using CrmApp.Infrastructure.Persistence;
using CrmApp.Api.Middleware;
using CrmApp.Application;
using CrmApp.Infrastructure;
using Serilog;
using CrmApp.Application.Services; // para registrar stub LeadService se precisar

var builder = WebApplication.CreateBuilder(args);

// ---------- Logging (Serilog) ----------
builder.Host.UseSerilog((context, services, configuration) =>
{
    configuration.ReadFrom.Configuration(context.Configuration)
                 .ReadFrom.Services(services)
                 .Enrich.FromLogContext();
});

// ---------- Services ----------
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// If you have extension methods to register layers, call them.
// These should register AutoMapper, FluentValidation, repositories, etc.
// If not present, those methods will cause compile error — remove/comment if you don't have them.
try
{
    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);
}
catch
{
    // If your solution doesn't expose those extension methods yet, ignore here.
    // The explicit DbContext registration below will ensure EF works.
}

// Register AppDbContext if AddInfrastructure wasn't available
if (!builder.Services.Any(s => s.ServiceType == typeof(DbContextOptions<AppDbContext>)))
{
    var conn = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=crmapp.db";
    builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(conn));
}

// Register controllers, CORS, Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "CRM API", Version = "v1" });
    c.EnableAnnotations();
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// If you added the in-memory stub ILeadService earlier, register it here.
// (Remove this if you wired a real implementation via AddInfrastructure/AddApplication.)
builder.Services.AddSingleton<CrmApp.Application.Services.ILeadService, CrmApp.Application.Services.LeadService>();

builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// ---------- Apply migrations, seed data (dev) ----------
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        // Apply migrations
        context.Database.Migrate();

        // Attempt to call seed if exists
        var seedType = AppDomain.CurrentDomain.GetAssemblies()
            .SelectMany(a => a.GetTypes())
            .FirstOrDefault(t => t.Name == "SeedData");
        if (seedType != null)
        {
            var mi = seedType.GetMethod("Initialize", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static);
            if (mi != null)
            {
                var task = (System.Threading.Tasks.Task?)mi.Invoke(null, new object[] { services });
                task?.GetAwaiter().GetResult();
            }
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetService<ILogger<Program>>();
        logger?.LogError(ex, "Error while migrating or seeding the database");
    }
}

// ---------- Middleware pipeline ----------
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "CRM API v1"));
}

app.UseMiddleware<ExceptionMiddleware>();

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("DevCors");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
