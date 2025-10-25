using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CrmApp.Application.Interfaces;
using CrmApp.Domain.Entities;

// evita ambiguidade com System.Threading.Tasks.TaskStatus
using DomainTaskStatus = CrmApp.Domain.Entities.TaskStatus;

namespace CrmApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // todos os endpoints protegidos
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
        public async Task<IActionResult> Create([FromBody] TaskItem task)
        {
            var created = await _repo.CreateAsync(task);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] TaskItem task)
        {
            task.Id = id;
            var updated = await _repo.UpdateAsync(task);
            return Ok(updated);
        }

        // Endpoint para mover task e atualizar order/status
        [HttpPost("move")]
        public async Task<IActionResult> Move([FromBody] MoveTaskDto dto)
        {
            var task = await _repo.GetByIdAsync(dto.TaskId);
            if (task == null) return NotFound();

            task.Status = (DomainTaskStatus)dto.NewStatus;
            task.Order = dto.NewOrder;
            var updated = await _repo.UpdateAsync(task);
            return Ok(updated);
        }
    }

    public class MoveTaskDto
    {
        public int TaskId { get; set; }
        public DomainTaskStatus NewStatus { get; set; }
        public int NewOrder { get; set; }
    }
}
