using CrmApp.Application.DTOs;
using CrmApp.Domain.Common;

namespace CrmApp.Application.Services;

public interface ILeadService
{
    Task<PaginatedResult<LeadDto>> GetLeadsAsync(int pageNumber = 1, int pageSize = 10, 
        string? searchTerm = null, string? sortColumn = null, string? sortOrder = "asc", 
        CancellationToken cancellationToken = default);
    
    Task<LeadDto?> GetLeadByIdAsync(Guid id, CancellationToken cancellationToken = default);
    
    Task<LeadDto> CreateLeadAsync(LeadCreateDto createDto, CancellationToken cancellationToken = default);
    
    Task<LeadDto?> UpdateLeadAsync(Guid id, LeadCreateDto updateDto, 
        CancellationToken cancellationToken = default);
    
    Task<bool> DeleteLeadAsync(Guid id, CancellationToken cancellationToken = default);
}

public class PaginatedResult<T>
{
    public IReadOnlyList<T> Items { get; }
    public int PageNumber { get; }
    public int TotalPages { get; }
    public int TotalCount { get; }
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public PaginatedResult(IReadOnlyList<T> items, int count, int pageNumber, int pageSize)
    {
        PageNumber = pageNumber;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        TotalCount = count;
        Items = items;
    }
}