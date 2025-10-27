using System.ComponentModel.DataAnnotations;
using CrmApp.Domain.Enums;

namespace CrmApp.Application.DTOs
{
    public class LeadUpdateDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Company { get; set; }
        public string? JobTitle { get; set; }
        public CrmApp.Domain.Enums.LeadSource? Source { get; set; }
        public CrmApp.Domain.Enums.LeadStatus? Status { get; set; }
        public string? Notes { get; set; }
    }
}
