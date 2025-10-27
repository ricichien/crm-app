namespace CrmApp.Domain.Enums
{
    public enum LeadStatus
    {
        New,
        Contacted,
        Qualified,
        Unqualified,
        Customer
    }

    public enum LeadSource
    {
        Website,
        Referral,
        SocialMedia,
        Email,
        Other
    }

    public enum TaskItemStatus
    {
        Pending,
        InProgress,
        Completed,
        Deferred,
        Cancelled
    }

    public enum TaskPriority
    {
        Low,
        Medium,
        High,
        Urgent
    }
}
