using CrmApp.Application.Interfaces;
using CrmApp.Domain.Entities;
using CrmApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CrmApp.Infrastructure.Repositories;

public class LeadRepository : ILeadRepository
{
    private readonly AppDbContext _context;

    public LeadRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Lead>> GetAllAsync(string? searchTerm = null, string? sortColumn = null, string? sortOrder = "asc", CancellationToken cancellationToken = default)
    {
        var query = _context.Leads.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var lower = searchTerm.ToLower();
            query = query.Where(l =>
                (l.FirstName != null && l.FirstName.ToLower().Contains(lower)) ||
                (l.LastName != null && l.LastName.ToLower().Contains(lower)) ||
                (l.Email != null && l.Email.ToLower().Contains(lower)) ||
                (l.Company != null && l.Company.ToLower().Contains(lower))
            );
        }

        if (!string.IsNullOrWhiteSpace(sortColumn))
        {
            query = (sortOrder?.ToLower() == "desc")
                ? query.OrderByDescending(e => EF.Property<object>(e, sortColumn))
                : query.OrderBy(e => EF.Property<object>(e, sortColumn));
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<Lead?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.Leads.AsNoTracking().FirstOrDefaultAsync(l => l.Id == id, cancellationToken);

    public async Task<Lead> CreateAsync(Lead lead, CancellationToken cancellationToken = default)
    {
        _context.Leads.Add(lead);
        await _context.SaveChangesAsync(cancellationToken);
        return lead;
    }

    public async Task<Lead?> UpdateAsync(Lead lead, CancellationToken cancellationToken = default)
    {
        _context.Leads.Update(lead);
        await _context.SaveChangesAsync(cancellationToken);
        return lead;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Leads.FindAsync(new object[] { id }, cancellationToken);
        if (entity == null) return false;
        _context.Leads.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
