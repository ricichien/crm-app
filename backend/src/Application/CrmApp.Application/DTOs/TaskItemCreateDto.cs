namespace CrmApp.Application.DTOs
{
    public class TaskItemCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsCompleted { get; set; } = false;
    }
}
