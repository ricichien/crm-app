using System;
using System.ComponentModel.DataAnnotations;
using CrmApp.Domain.Enums;

namespace CrmApp.Application.DTOs
{
    public class TaskItemCreateDto
    {
        [Required]
        [MaxLength(300)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public DateTime? DueDate { get; set; }

        public TaskPriority Priority { get; set; } = TaskPriority.Medium;
        public TaskItemStatus Status { get; set; } = TaskItemStatus.Pending;

        public int? LeadId { get; set; }

        public int Order { get; set; }
    }
}
