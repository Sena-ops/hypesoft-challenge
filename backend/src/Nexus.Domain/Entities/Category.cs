namespace Nexus.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; private set; }
    public string Description { get; private set; }

    private Category() { }

    public Category(string name, string description = "")
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Category name cannot be empty", nameof(name));

        Name = name;
        Description = description ?? string.Empty;
    }

    public void UpdateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Category name cannot be empty", nameof(name));
        
        Name = name;
        MarkAsUpdated();
    }

    public void UpdateDescription(string description)
    {
        Description = description ?? string.Empty;
        MarkAsUpdated();
    }
}
