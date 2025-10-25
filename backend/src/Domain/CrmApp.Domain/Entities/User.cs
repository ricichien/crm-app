using CrmApp.Domain.Common;
using System.ComponentModel.DataAnnotations;

namespace CrmApp.Domain.Entities
{
    public class User : AuditableEntity
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = "User";

        [Required]
        public string? Email { get; set; } = string.Empty;
    }
}
