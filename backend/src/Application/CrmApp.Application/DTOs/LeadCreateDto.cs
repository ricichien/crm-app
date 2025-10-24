using System.ComponentModel.DataAnnotations;
using CrmApp.Domain.Enums;

namespace CrmApp.Application.DTOs;

public class LeadCreateDto
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Phone]
    [MaxLength(50)]
    public string? Phone { get; set; }

    [MaxLength(200)]
    public string? Company { get; set; }

    [MaxLength(200)]
    public string? JobTitle { get; set; }

    public LeadSource Source { get; set; } = LeadSource.Other;
    public LeadStatus Status { get; set; } = LeadStatus.New;
    public string? Notes { get; set; }
}