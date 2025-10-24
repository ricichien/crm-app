using System.Text.Json.Serialization;
using CrmApp.Domain.Enums;

namespace CrmApp.Application.DTOs;

public class LeadDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Company { get; set; }
    public string? JobTitle { get; set; }
    public LeadSource Source { get; set; }
    public LeadStatus Status { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastModifiedAt { get; set; }

    [JsonIgnore]
    public string FullName => $"{FirstName} {LastName}";
}