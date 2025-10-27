using CrmApp.Application.DTOs;
using CrmApp.Application.Interfaces;
using CrmApp.Domain.Entities;
using CrmApp.Domain.Enums;
using CrmApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CrmApp.Infrastructure.Services
{
    public class LeadService : ILeadService
    {
        private readonly AppDbContext _context;

        public LeadService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PaginatedResult<LeadDto>> GetLeadsAsync(int pageNumber = 1, int pageSize = 10,
            string? searchTerm = null, string? sortColumn = null, string? sortOrder = "asc",
            CancellationToken cancellationToken = default)
        {
            var query = _context.Leads.AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var like = $"%{searchTerm}%";
                query = query.Where(l =>
                    EF.Functions.Like(l.FirstName, like) ||
                    EF.Functions.Like(l.LastName, like) ||
                    EF.Functions.Like(l.Email, like) ||
                    (l.Company != null && EF.Functions.Like(l.Company, like)) ||
                    (l.Phone != null && EF.Functions.Like(l.Phone, like)) ||
                    EF.Functions.Like((l.FirstName + " " + l.LastName), like)
                );
            }

            // futura ordenação dinâmica (opcional)
            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderBy(l => l.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new LeadDto
                {
                    Id = l.Id,
                    FirstName = l.FirstName,
                    LastName = l.LastName,
                    Email = l.Email,
                    Phone = l.Phone,
                    Company = l.Company,
                    JobTitle = l.JobTitle,
                    Source = l.Source,          // enum já unificado (Domain.Enums)
                    Status = l.Status,          // enum já unificado (Domain.Enums)
                    Notes = l.Notes,
                    CreatedAt = l.CreatedAt,
                    LastModifiedAt = l.LastModifiedAt
                })
                .ToListAsync(cancellationToken);

            return new PaginatedResult<LeadDto>(items, totalCount, pageNumber, pageSize);
        }

        public async Task<LeadDto?> GetLeadByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var lead = await _context.Leads
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);

            if (lead == null) return null;

            return new LeadDto
            {
                Id = lead.Id,
                FirstName = lead.FirstName,
                LastName = lead.LastName,
                Email = lead.Email,
                Phone = lead.Phone,
                Company = lead.Company,
                JobTitle = lead.JobTitle,
                Source = lead.Source,
                Status = lead.Status,
                Notes = lead.Notes,
                CreatedAt = lead.CreatedAt,
                LastModifiedAt = lead.LastModifiedAt
            };
        }

        public async Task<LeadDto> CreateLeadAsync(LeadCreateDto createDto, CancellationToken cancellationToken = default)
        {
            var lead = new Lead
            {
                FirstName = createDto.FirstName,
                LastName = createDto.LastName,
                Email = createDto.Email,
                Phone = createDto.Phone,
                Company = createDto.Company,
                JobTitle = createDto.JobTitle,
                Source = createDto.Source,
                Status = createDto.Status,
                Notes = createDto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _context.Leads.Add(lead);
            await _context.SaveChangesAsync(cancellationToken);

            return new LeadDto
            {
                Id = lead.Id,
                FirstName = lead.FirstName,
                LastName = lead.LastName,
                Email = lead.Email,
                Phone = lead.Phone,
                Company = lead.Company,
                JobTitle = lead.JobTitle,
                Source = lead.Source,
                Status = lead.Status,
                Notes = lead.Notes,
                CreatedAt = lead.CreatedAt,
                LastModifiedAt = lead.LastModifiedAt
            };
        }

        public async Task<LeadDto?> UpdateLeadAsync(int id, LeadUpdateDto updateDto, CancellationToken cancellationToken = default)
        {
            var lead = await _context.Leads.FindAsync(new object[] { id }, cancellationToken);
            if (lead == null) return null;

            // Aplicar somente campos não-nulos (preservando valores existentes)
            if (updateDto.FirstName != null) lead.FirstName = updateDto.FirstName;
            if (updateDto.LastName != null) lead.LastName = updateDto.LastName;
            if (updateDto.Email != null) lead.Email = updateDto.Email;
            if (updateDto.Phone != null) lead.Phone = updateDto.Phone;
            if (updateDto.Company != null) lead.Company = updateDto.Company;
            if (updateDto.JobTitle != null) lead.JobTitle = updateDto.JobTitle;
            if (updateDto.Source.HasValue) lead.Source = updateDto.Source.Value;
            if (updateDto.Status.HasValue) lead.Status = updateDto.Status.Value;
            if (updateDto.Notes != null) lead.Notes = updateDto.Notes;

            lead.LastModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            return new LeadDto
            {
                Id = lead.Id,
                FirstName = lead.FirstName,
                LastName = lead.LastName,
                Email = lead.Email,
                Phone = lead.Phone,
                Company = lead.Company,
                JobTitle = lead.JobTitle,
                Source = lead.Source,
                Status = lead.Status,
                Notes = lead.Notes,
                CreatedAt = lead.CreatedAt,
                LastModifiedAt = lead.LastModifiedAt
            };
        }

        // Soft-delete: marca IsDeleted = true e atualiza LastModifiedAt
        public async Task<bool> DeleteLeadAsync(int id, CancellationToken cancellationToken = default)
        {
            var lead = await _context.Leads.FindAsync(new object[] { id }, cancellationToken);
            if (lead == null) return false;

            lead.IsDeleted = true;
            lead.LastModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        // ---------- Tasks ----------
        public async Task<IEnumerable<TaskItemDto>> GetTasksByLeadIdAsync(int leadId, CancellationToken cancellationToken = default)
        {
            var leadExists = await _context.Leads.AnyAsync(l => l.Id == leadId, cancellationToken);
            if (!leadExists) throw new KeyNotFoundException($"Lead {leadId} não encontrado.");

            var tasks = await _context.TaskItems
                .Where(t => t.LeadId == leadId)
                .OrderBy(t => t.CreatedAt)
                .Select(t => new TaskItemDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    // map Status enum para bool
                    IsCompleted = t.Status == TaskItemStatus.Completed,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return tasks;
        }

        public async Task<TaskItemDto> CreateTaskForLeadAsync(int leadId, TaskItemCreateDto createDto, CancellationToken cancellationToken = default)
        {
            var lead = await _context.Leads.FindAsync(new object[] { leadId }, cancellationToken);
            if (lead == null) throw new KeyNotFoundException($"Lead {leadId} não encontrado.");

            var taskItem = new TaskItem
            {
                Title = createDto.Title,
                Description = createDto.Description,
                Status = createDto.Status != default ? createDto.Status : TaskItemStatus.Pending,
                LeadId = leadId,
                CreatedAt = DateTime.UtcNow
            };

            _context.TaskItems.Add(taskItem);
            await _context.SaveChangesAsync(cancellationToken);

            return new TaskItemDto
            {
                Id = taskItem.Id,
                Title = taskItem.Title,
                Description = taskItem.Description,
                IsCompleted = taskItem.Status == TaskItemStatus.Completed,
                CreatedAt = taskItem.CreatedAt
            };
        }
    }
}
