using CrmApp.Domain.Common;
using CrmApp.Domain.Enums;

namespace CrmApp.Domain.Entities;

public class TaskItem : AuditableEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime DueDate { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public TaskStatus Status { get; set; } = TaskStatus.Pending;
    public Guid? LeadId { get; set; }
    public virtual Lead? Lead { get; set; }
}

public enum TaskStatus
{
    Pending,
    InProgress,
    Completed,
    Deferred,
    Cancelled
}

public enum TaskPriority
{
    Low,
    Medium,
    High,
    Urgent
}