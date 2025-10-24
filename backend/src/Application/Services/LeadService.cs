using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using CrmApp.Application.DTOs;
using CrmApp.Application.Interfaces;
using CrmApp.Domain.Entities;
using CrmApp.Domain.Common;
using CrmApp.Infrastructure.Persistence;

namespace CrmApp.Application.Services;

public class LeadService : ILeadService
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public LeadService(AppDbContext context, IMapper mapper)
    {
        _context = context;
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
        var query = _context.Leads.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            searchTerm = searchTerm.ToLower();
            query = query.Where(l =>
                l.FirstName.ToLower().Contains(searchTerm) ||
                l.LastName.ToLower().Contains(searchTerm) ||
                l.Email.ToLower().Contains(searchTerm) ||
                l.Company != null && l.Company.ToLower().Contains(searchTerm));
        }

        if (!string.IsNullOrEmpty(sortColumn))
        {
            query = sortOrder?.ToLower() == "desc"
                ? query.OrderByDescending(l => EF.Property<object>(l, sortColumn))
                : query.OrderBy(l => EF.Property<object>(l, sortColumn));
        }
        else
        {
            query = query.OrderBy(l => l.LastName).ThenBy(l => l.FirstName);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<LeadDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return new PaginatedResult<LeadDto>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<LeadDto?> GetLeadByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Leads
            .AsNoTracking()
            .ProjectTo<LeadDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
    }

    public async Task<LeadDto> CreateLeadAsync(LeadCreateDto createDto, CancellationToken cancellationToken = default)
    {
        var lead = _mapper.Map<Lead>(createDto);
        _context.Leads.Add(lead);
        await _context.SaveChangesAsync(cancellationToken);
        return _mapper.Map<LeadDto>(lead);
    }

    public async Task<LeadDto?> UpdateLeadAsync(
        Guid id, 
        LeadCreateDto updateDto, 
        CancellationToken cancellationToken = default)
    {
        var lead = await _context.Leads.FindAsync(new object[] { id }, cancellationToken);
        if (lead == null) return null;

        _mapper.Map(updateDto, lead);
        await _context.SaveChangesAsync(cancellationToken);
        return _mapper.Map<LeadDto>(lead);
    }

    public async Task<bool> DeleteLeadAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var lead = await _context.Leads.FindAsync(new object[] { id }, cancellationToken);
        if (lead == null) return false;

        _context.Leads.Remove(lead);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}