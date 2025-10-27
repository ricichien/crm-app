using System;
using CrmApp.Domain.Enums;

namespace CrmApp.Application.DTOs
{
    public class TaskItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string? Description { get; set; }
        public bool IsCompleted { get; set; }
        public TaskItemStatus Status { get; set; }
        public TaskPriority Priority { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? DueDate { get; set; }
        public int Order { get; set; }
        public int? LeadId { get; set; }
        public string? LeadName { get; set; }
    }
}
