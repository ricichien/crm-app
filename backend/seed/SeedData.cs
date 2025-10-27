using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using CrmApp.Domain.Entities;
using CrmApp.Domain.Enums;

namespace CrmApp.Infrastructure.Persistence;

public static class SeedData
{
    public static async Task Initialize(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;
        
        try
        {
            var context = services.GetRequiredService<AppDbContext>();
            
            if (await context.Leads.AnyAsync())
            {
                return; // DB has been seeded
            }

            var leads = new List<Lead>
            {
                new()
                {
                    FirstName = "John",
                    LastName = "Doe",
                    Email = "john.doe@example.com",
                    Phone = "+1234567890",
                    Company = "Acme Corp",
                    JobTitle = "CTO",
                    Source = LeadSource.Website,
                    Status = LeadStatus.Qualified,
                    Notes = "Interested in enterprise plan",
                    Tasks = new List<TaskItem>
                    {
                        new()
                        {
                            Title = "Schedule demo call",
                            Description = "Show enterprise features",
                            DueDate = DateTime.UtcNow.AddDays(2),
                            Priority = TaskPriority.High,
                            Status = TaskItemStatus.Pending
                        }
                    }
                },
                new()
                {
                    FirstName = "Jane",
                    LastName = "Smith",
                    Email = "jane.smith@example.com",
                    Phone = "+1987654321",
                    Company = "Globex",
                    JobTitle = "Marketing Director",
                    Source = LeadSource.Email,
                    Status = LeadStatus.Contacted,
                    Notes = "Follow up next week",
                    Tasks = new List<TaskItem>
                    {
                        new()
                        {
                            Title = "Send marketing materials",
                            Description = "Include case studies",
                            DueDate = DateTime.UtcNow.AddDays(1),
                            Priority = TaskPriority.Medium,
                            Status = TaskItemStatus.Pending
                        }
                    }
                },
                new()
                {
                    FirstName = "Bob",
                    LastName = "Johnson",
                    Email = "bob.johnson@example.com",
                    Company = "Initech",
                    Source = LeadSource.SocialMedia,
                    Status = LeadStatus.New,
                    Tasks = new List<TaskItem>
                    {
                        new()
                        {
                            Title = "Initial contact",
                            Description = "Introduce our services",
                            DueDate = DateTime.UtcNow,
                            Priority = TaskPriority.Low,
                            Status = TaskItemStatus.Pending
                        }
                    }
                },
                new()
                {
                    FirstName = "Alice",
                    LastName = "Williams",
                    Email = "alice.w@example.com",
                    Phone = "+1555123456",
                    Company = "Umbrella Corp",
                    JobTitle = "Head of IT",
                    Source = LeadSource.Referral,
                    Status = LeadStatus.Qualified,
                    Notes = "Referred by John Doe"
                },
                new()
                {
                    FirstName = "Charlie",
                    LastName = "Brown",
                    Email = "charlie.b@example.com",
                    Company = "Stark Industries",
                    Source = LeadSource.Other,
                    Status = LeadStatus.Unqualified,
                    Notes = "Not a good fit currently",
                    Tasks = new List<TaskItem>
                    {
                        new()
                        {
                            Title = "Follow up in 3 months",
                            Description = "Check if needs have changed",
                            DueDate = DateTime.UtcNow.AddMonths(3),
                            Priority = TaskPriority.Low,
                            Status = TaskItemStatus.Pending
                        }
                    }
                }
            };

            await context.Leads.AddRangeAsync(leads);
            await context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }
}