using CrmApp.Domain.Common;
using CrmApp.Domain.Enums;

namespace CrmApp.Domain.Entities;

public class Lead : AuditableEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Company { get; set; }
    public string? JobTitle { get; set; }
    public LeadSource Source { get; set; } = LeadSource.Other;
    public LeadStatus Status { get; set; } = LeadStatus.New;
    public string? Notes { get; set; }
    public virtual ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}