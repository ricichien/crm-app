using Microsoft.AspNetCore.Mvc;
using CrmApp.Application.DTOs;
using CrmApp.Application.Interfaces;
using CrmApp.Domain.Enums;

namespace CrmApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeadsController : ControllerBase
{
    private readonly ILeadService _leadService;
    private readonly ILogger<LeadsController> _logger;

    public LeadsController(ILeadService leadService, ILogger<LeadsController> logger)
    {
        _leadService = leadService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<LeadDto>>> GetLeads(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = "asc",
        CancellationToken cancellationToken = default)
    {
        var result = await _leadService.GetLeadsAsync(page, pageSize, search, sortBy, sortOrder, cancellationToken);

        Response.Headers["X-Pagination"] =
            System.Text.Json.JsonSerializer.Serialize(new
            {
                result.TotalCount,
                result.PageNumber,
                result.TotalPages,
                result.HasPreviousPage,
                result.HasNextPage
            });

        return Ok(result.Items);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LeadDto>> GetLead(int id, CancellationToken cancellationToken)
    {
        var lead = await _leadService.GetLeadByIdAsync(id, cancellationToken);
        if (lead == null)
        {
            return NotFound();
        }
        return Ok(lead);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LeadDto>> CreateLead(
        [FromBody] LeadCreateDto createDto,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var lead = await _leadService.CreateLeadAsync(createDto, cancellationToken);
        return CreatedAtAction(nameof(GetLead), new { id = lead.Id }, lead);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LeadDto>> UpdateLead(
        int id,
        [FromBody] LeadCreateDto updateDto,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var lead = await _leadService.UpdateLeadAsync(id, updateDto, cancellationToken);
        if (lead == null)
        {
            return NotFound();
        }

        return Ok(lead);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteLead(int id, CancellationToken cancellationToken)
    {
        var result = await _leadService.DeleteLeadAsync(id, cancellationToken);
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpGet("sources")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetLeadSources()
    {
        var sources = Enum.GetValues<LeadSource>()
            .Select(s => new { id = (int)s, name = s.ToString() })
            .ToList();
        return Ok(sources);
    }

    [HttpGet("statuses")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetLeadStatuses()
    {
        var statuses = Enum.GetValues<LeadStatus>()
            .Select(s => new { id = (int)s, name = s.ToString() })
            .ToList();
        return Ok(statuses);
    }
}
