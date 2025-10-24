using CrmApp.Domain.Entities;

namespace CrmApp.Application.Interfaces;

public interface ILeadRepository
{
    Task<IEnumerable<Lead>> GetAllAsync(string? searchTerm = null, string? sortColumn = null, string? sortOrder = "asc", CancellationToken cancellationToken = default);
    Task<Lead?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Lead> CreateAsync(Lead lead, CancellationToken cancellationToken = default);
    Task<Lead?> UpdateAsync(Lead lead, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
