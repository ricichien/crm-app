using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;

using CrmApp.Application.Interfaces;
using CrmApp.Application.DTOs;
using CrmApp.Domain.Entities;
using CrmApp.Domain.Enums;

namespace CrmApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TaskItemsController : ControllerBase
    {
        private readonly ITaskItemRepository _repo;
        private readonly ILogger<TaskItemsController> _logger;

        public TaskItemsController(ITaskItemRepository repo, ILogger<TaskItemsController> logger)
        {
            _repo = repo;
            _logger = logger;
        }

        private TaskItemDto ToDto(TaskItem t)
        {
            string? leadName = null;
            if (t.Lead != null)
            {
                leadName = $"{t.Lead.FirstName} {t.Lead.LastName}".Trim();
            }

            bool isCompleted = t.Status == TaskItemStatus.Completed;

            return new TaskItemDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                IsCompleted = isCompleted,
                CreatedAt = t.CreatedAt,
                DueDate = t.DueDate,
                Order = t.Order,
                LeadId = t.LeadId,
                LeadName = leadName
            };
        }

        [HttpGet("{id:int}")]
public async Task<IActionResult> GetById(int id)
{
    var task = await _repo.GetByIdAsync(id);
    if (task == null || task.IsDeleted) return NotFound();
    return Ok(ToDto(task));
}


        [HttpGet]
public async Task<IActionResult> GetAll()
{
    var tasks = await _repo.GetAllAsync(); 
    var visible = tasks
        .Where(t => !t.IsDeleted)
        .Select(t => new TaskItemDto {
            Id = t.Id,
            Title = t.Title,
            Description = t.Description,
            IsCompleted = t.Status == TaskItemStatus.Completed,
            CreatedAt = t.CreatedAt,
            DueDate = t.DueDate,
            Order = t.Order,
            LeadId = t.LeadId,
            LeadName = t.Lead != null ? $"{t.Lead.FirstName} {t.Lead.LastName}".Trim() : null
        });

    return Ok(visible);
}

        [HttpPost]
public async Task<IActionResult> Create([FromBody] TaskItemCreateDto dto)
{
    if (!ModelState.IsValid) return ValidationProblem(ModelState);

    var entity = new TaskItem
    {
        Title = dto.Title,
        Description = dto.Description,
        DueDate = dto.DueDate ?? DateTime.UtcNow,
        Priority = dto.Priority,
        Status = dto.Status,
        LeadId = dto.LeadId,
        Order = dto.Order,
        CreatedAt = DateTime.UtcNow,         
        IsDeleted = false
    };

    var created = await _repo.CreateAsync(entity);

    var createdWithLead = await _repo.GetByIdAsync(created.Id);
    return CreatedAtAction(nameof(GetById), new { id = created.Id }, ToDto(createdWithLead!));
}


        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] TaskItemUpdateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var task = await _repo.GetByIdAsync(id);
            if (task == null || task.IsDeleted) return NotFound();

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.DueDate = dto.DueDate.HasValue ? dto.DueDate.Value : task.DueDate;
            task.Priority = dto.Priority;
            task.Status = dto.Status;
            task.LeadId = dto.LeadId;
            task.Order = dto.Order;
            task.LastModifiedAt = DateTime.UtcNow;

            var updated = await _repo.UpdateAsync(task);
            var updatedWithLead = await _repo.GetByIdAsync(updated.Id);
            return Ok(ToDto(updatedWithLead!));
        }

        [HttpPost("move")]
        public async Task<IActionResult> Move([FromBody] MoveTaskDto dto)
        {
            var task = await _repo.GetByIdAsync(dto.TaskId);
            if (task == null || task.IsDeleted) return NotFound();

            task.Status = dto.NewStatus;
            task.Order = dto.NewOrder;
            var updated = await _repo.UpdateAsync(task);
            var updatedWithLead = await _repo.GetByIdAsync(updated.Id);
            return Ok(ToDto(updatedWithLead!));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            var task = await _repo.GetByIdAsync(id);
            if (task == null) return NotFound();

            task.IsDeleted = true;
            task.LastModifiedAt = DateTime.UtcNow;

            await _repo.UpdateAsync(task);
            return NoContent();
        }
    }

    public class MoveTaskDto
    {
        public int TaskId { get; set; }
        public TaskItemStatus NewStatus { get; set; }
        public int NewOrder { get; set; }
    }
}
