using AutoMapper;
using AutoMapper.QueryableExtensions;
using CrmApp.Application.DTOs;
using CrmApp.Application.Interfaces;
using CrmApp.Domain.Entities;

namespace CrmApp.Application.Services;

public class LeadService : ILeadService
{
    private readonly ILeadRepository _repository;
    private readonly IMapper _mapper;

    public LeadService(ILeadRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<LeadDto>> GetLeadsAsync(
        int pageNumber = 1,
        int pageSize = 10,
        string? searchTerm = null,
        string? sortColumn = null,
        string? sortOrder = "asc",
        CancellationToken cancellationToken = default)
    {
        var leads = await _repository.GetAllAsync(searchTerm, sortColumn, sortOrder, cancellationToken);
        var totalCount = leads.Count();

        var items = leads
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(l => _mapper.Map<LeadDto>(l))
            .ToList();

        return new PaginatedResult<LeadDto>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<LeadDto?> GetLeadByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var lead = await _repository.GetByIdAsync(id, cancellationToken);
        return lead == null ? null : _mapper.Map<LeadDto>(lead);
    }

    public async Task<LeadDto> CreateLeadAsync(LeadCreateDto createDto, CancellationToken cancellationToken = default)
    {
        var entity = _mapper.Map<Lead>(createDto);
        var result = await _repository.CreateAsync(entity, cancellationToken);
        return _mapper.Map<LeadDto>(result);
    }

    public async Task<LeadDto?> UpdateLeadAsync(int id, LeadCreateDto updateDto, CancellationToken cancellationToken = default)
    {
        var entity = _mapper.Map<Lead>(updateDto);
        entity.Id = id;
        var result = await _repository.UpdateAsync(entity, cancellationToken);
        return result == null ? null : _mapper.Map<LeadDto>(result);
    }

    public async Task<bool> DeleteLeadAsync(int id, CancellationToken cancellationToken = default)
        => await _repository.DeleteAsync(id, cancellationToken);
}


// using AutoMapper;
// using AutoMapper.QueryableExtensions;
// using Microsoft.EntityFrameworkCore;
// using CrmApp.Application.DTOs;
// using CrmApp.Application.Interfaces;
// using CrmApp.Domain.Entities;
// using CrmApp.Infrastructure.Persistence;

// namespace CrmApp.Application.Services;

// public class LeadService : ILeadService
// {
//     private readonly AppDbContext _context;
//     private readonly IMapper _mapper;

//     public LeadService(AppDbContext context, IMapper mapper)
//     {
//         _context = context;
//         _mapper = mapper;
//     }

//     public async Task<PaginatedResult<LeadDto>> GetLeadsAsync(
//         int pageNumber = 1,
//         int pageSize = 10,
//         string? searchTerm = null,
//         string? sortColumn = null,
//         string? sortOrder = "asc",
//         CancellationToken cancellationToken = default)
//     {
//         var query = _context.Leads.AsNoTracking();

//         // Search
//         if (!string.IsNullOrWhiteSpace(searchTerm))
//         {
//             var lower = searchTerm.Trim().ToLower();
//             query = query.Where(l =>
//                 (l.FirstName != null && l.FirstName.ToLower().Contains(lower)) ||
//                 (l.LastName != null && l.LastName.ToLower().Contains(lower)) ||
//                 (l.Email != null && l.Email.ToLower().Contains(lower)) ||
//                 (l.Company != null && l.Company.ToLower().Contains(lower))
//             );
//         }

//         // Sorting
//         if (!string.IsNullOrWhiteSpace(sortColumn))
//         {
//             var ord = (sortOrder ?? "asc").ToLower();

//             if (string.Equals(sortColumn, "name", StringComparison.OrdinalIgnoreCase))
//             {
//                 query = ord == "desc"
//                     ? query.OrderByDescending(l => l.LastName).ThenByDescending(l => l.FirstName)
//                     : query.OrderBy(l => l.LastName).ThenBy(l => l.FirstName);
//             }
//             else
//             {
//                 query = ord == "desc"
//                     ? query.OrderByDescending(l => EF.Property<object>(l, sortColumn))
//                     : query.OrderBy(l => EF.Property<object>(l, sortColumn));
//             }
//         }
//         else
//         {
//             query = query.OrderBy(l => l.LastName).ThenBy(l => l.FirstName);
//         }

//         var totalCount = await query.CountAsync(cancellationToken);

//         var items = await query
//             .Skip((pageNumber - 1) * pageSize)
//             .Take(pageSize)
//             .ProjectTo<LeadDto>(_mapper.ConfigurationProvider)
//             .ToListAsync(cancellationToken);

//         return new PaginatedResult<LeadDto>(items, totalCount, pageNumber, pageSize);
//     }

//     public async Task<LeadDto?> GetLeadByIdAsync(int Id, CancellationToken cancellationToken = default)
//     {
//         return await _context.Leads
//             .AsNoTracking()
//             .ProjectTo<LeadDto>(_mapper.ConfigurationProvider)
//             .FirstOrDefaultAsync(l => l.Id == Id, cancellationToken);
//     }

//     public async Task<LeadDto> CreateLeadAsync(LeadCreateDto createDto, CancellationToken cancellationToken = default)
//     {
//         var lead = _mapper.Map<Lead>(createDto);
//         _context.Leads.Add(lead);
//         await _context.SaveChangesAsync(cancellationToken);
//         return _mapper.Map<LeadDto>(lead);
//     }

//     public async Task<LeadDto?> UpdateLeadAsync(int Id, LeadCreateDto updateDto, CancellationToken cancellationToken = default)
//     {
//         var lead = await _context.Leads.FindAsync(new object[] { Id }, cancellationToken);
//         if (lead == null) return null;

//         _mapper.Map(updateDto, lead);
//         await _context.SaveChangesAsync(cancellationToken);
//         return _mapper.Map<LeadDto>(lead);
//     }

//     public async Task<bool> DeleteLeadAsync(int Id, CancellationToken cancellationToken = default)
//     {
//         var lead = await _context.Leads.FindAsync(new object[] { Id }, cancellationToken);
//         if (lead == null) return false;

//         _context.Leads.Remove(lead);
//         await _context.SaveChangesAsync(cancellationToken);
//         return true;
//     }
// }
