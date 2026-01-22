namespace Nexus.Domain.Entities;

public abstract class BaseEntity
{
    public string Id { get; protected set; } = Guid.NewGuid().ToString();
    public DateTime CreatedAt { get; protected set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; protected set; }
    public bool IsDeleted { get; protected set; }
    public string? CreatedBy { get; protected set; }
    public string? UpdatedBy { get; protected set; }

    protected BaseEntity() { }

    public void MarkAsUpdated(string? userId = null)
    {
        UpdatedAt = DateTime.UtcNow;
        if (!string.IsNullOrEmpty(userId))
        {
            UpdatedBy = userId;
        }
    }

    public void SetCreatedBy(string? userId)
    {
        if (!string.IsNullOrEmpty(userId))
        {
            CreatedBy = userId;
        }
    }

    public void MarkAsDeleted(string? userId = null)
    {
        IsDeleted = true;
        MarkAsUpdated(userId);
    }
}
