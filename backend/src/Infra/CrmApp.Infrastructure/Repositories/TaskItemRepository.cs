using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CrmApp.Domain.Entities;
using CrmApp.Application.Interfaces;
using CrmApp.Infrastructure.Persistence;

namespace CrmApp.Infrastructure.Repositories
{
    public class TaskItemRepository : ITaskItemRepository
    {
        private readonly AppDbContext _db;
        public TaskItemRepository(AppDbContext db) => _db = db;

        public async Task<IEnumerable<TaskItem>> GetAllAsync()
{
    return await _db.TaskItems
               .Include(t => t.Lead)  
               .ToListAsync();
}

public async Task<TaskItem?> GetByIdAsync(int id)
{
    return await _db.TaskItems
               .Include(t => t.Lead)
               .FirstOrDefaultAsync(t => t.Id == id);
}

        public async Task<TaskItem> CreateAsync(TaskItem item)
        {
            _db.TaskItems.Add(item);
            await _db.SaveChangesAsync();
            return item;
        }

        public async Task<TaskItem> UpdateAsync(TaskItem item)
        {
            _db.TaskItems.Update(item);
            await _db.SaveChangesAsync();
            return item;
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _db.TaskItems.FindAsync(id);
            if (entity != null)
            {
                entity.IsDeleted = true;
                entity.LastModifiedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }
    }
}
