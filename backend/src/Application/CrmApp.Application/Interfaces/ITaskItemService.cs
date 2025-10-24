using CrmApp.Application.DTOs;

namespace CrmApp.Application.Interfaces
{
    public interface ITaskItemService
    {
        Task<IEnumerable<TaskItemDto>> GetAllAsync();
        Task<TaskItemDto?> GetByIdAsync(int id);
        Task<TaskItemDto> CreateAsync(TaskItemCreateDto dto);
        Task<TaskItemDto?> UpdateAsync(int id, TaskItemCreateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
