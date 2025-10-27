namespace CrmApp.Domain.Common
{
    public abstract class AuditableEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastModifiedAt { get; set; } = null;
    public bool IsDeleted { get; set; } = false;

}
}
