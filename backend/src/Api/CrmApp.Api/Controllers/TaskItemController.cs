using System;
using System.Threading.Tasks; // para Task<T>
using Microsoft.AspNetCore.Mvc;
using CrmApp.Application.Interfaces;
using CrmApp.Domain.Entities;

// evita ambiguidade com System.Threading.Tasks.TaskStatus
using DomainTaskStatus = CrmApp.Domain.Entities.TaskStatus;

namespace CrmApp.Api.Controllers
{
    [ApiController]
    [Route("api/tasks")]
    public class TaskItemsController : ControllerBase
    {
        private readonly ITaskItemRepository _repo;

        public TaskItemsController(ITaskItemRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _repo.GetAllAsync());

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TaskItem task)
        {
            var created = await _repo.CreateAsync(task);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var task = await _repo.GetByIdAsync(id);
            if (task == null) return NotFound();
            return Ok(task);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] TaskItem task)
        {
            task.Id = id;
            var updated = await _repo.UpdateAsync(task);
            return Ok(updated);
        }

        [HttpPost("move")]
        public async Task<IActionResult> Move([FromBody] MoveTaskDto dto)
        {
            var task = await _repo.GetByIdAsync(dto.TaskId);
            if (task == null) return NotFound();

            task.Status = (CrmApp.Domain.Entities.TaskStatus)dto.NewStatus; // seguro porque dto usa alias
            task.Order = dto.NewOrder;
            var updated = await _repo.UpdateAsync(task);
            return Ok(updated);
        }
    }

    // usa alias DomainTaskStatus para não conflitar com System.Threading.Tasks.TaskStatus
    public class MoveTaskDto
    {
        public int TaskId { get; set; }
        public DomainTaskStatus NewStatus { get; set; }
        public int NewOrder { get; set; }
    }
}

// [ApiController]
// [Route("api/tasks")]
// public class TaskItemsController : ControllerBase
// {
//     private readonly ITaskItemRepository _repo;

//     public TaskItemsController(ITaskItemRepository repo)
//     {
//         _repo = repo;
//     }

//     [HttpGet]
//     public async Task<IActionResult> GetAll() => Ok(await _repo.GetAllAsync());

//     [HttpPost]
//     public async Task<IActionResult> Create(TaskItem task)
//     {
//         var created = await _repo.CreateAsync(task);
//         return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
//     }

//     [HttpGet("{id}")]
//     public async Task<IActionResult> GetById(int id)
//     {
//         var task = await _repo.GetByIdAsync(id);
//         if (task == null) return NotFound();
//         return Ok(task);
//     }

//     [HttpPut("{id}")]
//     public async Task<IActionResult> Update(int id, TaskItem task)
//     {
//         task.Id = id;
//         var updated = await _repo.UpdateAsync(task);
//         return Ok(updated);
//     }

//     [HttpPost("move")]
//     public async Task<IActionResult> Move([FromBody] MoveTaskDto dto)
//     {
//         var task = await _repo.GetByIdAsync(dto.TaskId);
//         if (task == null) return NotFound();

//         task.Status = dto.NewStatus;
//         task.Order = dto.NewOrder;
//         var updated = await _repo.UpdateAsync(task);
//         return Ok(updated);
//     }
// }

// public class MoveTaskDto
// {
//     public int TaskId { get; set; }
//     public TaskStatus NewStatus { get; set; }
//     public int NewOrder { get; set; }
// }
