using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CrmApp.Application.Interfaces;
using CrmApp.Application.DTOs;
using CrmApp.Domain.Entities;
using CrmApp.Domain.Enums;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

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

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tasks = await _repo.GetAllAsync();
            return Ok(tasks);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var task = await _repo.GetByIdAsync(id);
            if (task == null) return NotFound();
            return Ok(task);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TaskItemCreateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var entity = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                DueDate = dto.DueDate ?? default, // if you prefer nullable in entity, set accordingly
                Priority = dto.Priority,
                Status = dto.Status,
                LeadId = dto.LeadId,
                Order = dto.Order,
                CreatedAt = System.DateTime.UtcNow
            };

            var created = await _repo.CreateAsync(entity);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] TaskItemUpdateDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var task = await _repo.GetByIdAsync(id);
            if (task == null) return NotFound();

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.DueDate = dto.DueDate ?? task.DueDate;
            task.Priority = dto.Priority;
            task.Status = dto.Status;
            task.LeadId = dto.LeadId;
            task.Order = dto.Order;
            task.LastModifiedAt = System.DateTime.UtcNow;

            var updated = await _repo.UpdateAsync(task);
            return Ok(updated);
        }

        [HttpPost("move")]
        public async Task<IActionResult> Move([FromBody] MoveTaskDto dto)
        {
            var task = await _repo.GetByIdAsync(dto.TaskId);
            if (task == null) return NotFound();

            task.Status = dto.NewStatus;
            task.Order = dto.NewOrder;
            var updated = await _repo.UpdateAsync(task);
            return Ok(updated);
        }
    }

    public class MoveTaskDto
    {
        public int TaskId { get; set; }
        public TaskItemStatus NewStatus { get; set; }
        public int NewOrder { get; set; }
    }
}
