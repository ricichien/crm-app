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
                .AsNoTracking()
                .OrderBy(t => t.Order)
                .ToListAsync();
        }

        public async Task<TaskItem?> GetByIdAsync(int id)
        {
            return await _db.TaskItems.FindAsync(id);
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
            var e = await _db.TaskItems.FindAsync(id);
            if (e != null)
            {
                _db.TaskItems.Remove(e);
                await _db.SaveChangesAsync();
            }
        }
    }
}
