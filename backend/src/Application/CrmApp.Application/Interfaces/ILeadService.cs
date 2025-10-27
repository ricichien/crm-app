// FILE: backend/src/Application/CrmApp.Application/Interfaces/ILeadService.cs
using CrmApp.Application.DTOs;
using CrmApp.Domain.Common;

namespace CrmApp.Application.Interfaces;

public interface ILeadService
{
    Task<PaginatedResult<LeadDto>> GetLeadsAsync(int pageNumber = 1, int pageSize = 10,
        string? searchTerm = null, string? sortColumn = null, string? sortOrder = "asc",
        CancellationToken cancellationToken = default);

    Task<LeadDto?> GetLeadByIdAsync(int Id, CancellationToken cancellationToken = default);

    Task<LeadDto> CreateLeadAsync(LeadCreateDto createDto, CancellationToken cancellationToken = default);

    Task<LeadDto?> UpdateLeadAsync(int id, LeadUpdateDto updateDto, CancellationToken cancellationToken = default);

    Task<bool> DeleteLeadAsync(int Id, CancellationToken cancellationToken = default);

    Task<IEnumerable<TaskItemDto>> GetTasksByLeadIdAsync(int leadId, CancellationToken cancellationToken);

    Task<TaskItemDto> CreateTaskForLeadAsync(int leadId, TaskItemCreateDto createDto, CancellationToken cancellationToken);

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
