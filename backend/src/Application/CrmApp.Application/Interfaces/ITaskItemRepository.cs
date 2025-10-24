using System.Collections.Generic;
using System.Threading.Tasks;
using CrmApp.Domain.Entities;

namespace CrmApp.Application.Interfaces
{
    public interface ITaskItemRepository
    {
        Task<IEnumerable<TaskItem>> GetAllAsync();
        Task<TaskItem?> GetByIdAsync(int id);
        Task<TaskItem> CreateAsync(TaskItem item);
        Task<TaskItem> UpdateAsync(TaskItem item);
        Task DeleteAsync(int id);
    }
}
