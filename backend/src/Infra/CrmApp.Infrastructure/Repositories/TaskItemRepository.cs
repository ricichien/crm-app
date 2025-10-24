using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CrmApp.Application.Interfaces;
using CrmApp.Domain.Entities;
using CrmApp.Infrastructure.Persistence;

namespace CrmApp.Infrastructure.Repositories
{
    public class TaskItemRepository : ITaskItemRepository
    {
        private readonly AppDbContext _db;

        public TaskItemRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<TaskItem>> GetAllAsync()
            => await _db.Tasks.AsNoTracking().ToListAsync();

        public async Task<TaskItem?> GetByIdAsync(int id)
            => await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id);

        public async Task<TaskItem> CreateAsync(TaskItem item)
        {
            await _db.Tasks.AddAsync(item);
            await _db.SaveChangesAsync();
            return item;
        }

        public async Task<TaskItem> UpdateAsync(TaskItem item)
        {
            var existing = await _db.Tasks.FindAsync(item.Id);
            if (existing == null) throw new InvalidOperationException("Task not found");

            existing.Title = item.Title;
            existing.Description = item.Description;
            existing.Status = item.Status;
            existing.Order = item.Order;

            _db.Tasks.Update(existing);
            await _db.SaveChangesAsync();
            return existing;
        }

        public async Task DeleteAsync(int id)
        {
            var existing = await _db.Tasks.FindAsync(id);
            if (existing == null) return;

            _db.Tasks.Remove(existing);
            await _db.SaveChangesAsync();
        }
    }
}
