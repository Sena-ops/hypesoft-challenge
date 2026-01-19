using Nexus.Domain.ValueObjects;

namespace Nexus.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; private set; }
    public string Description { get; private set; }
    public Money Price { get; private set; }
    public string CategoryId { get; private set; }
    public int StockQuantity { get; private set; }

    private Product() { }

    public Product(string name, string description, Money price, string categoryId, int stockQuantity)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Product name cannot be empty", nameof(name));
        
        if (string.IsNullOrWhiteSpace(categoryId))
            throw new ArgumentException("Category ID cannot be empty", nameof(categoryId));
        
        if (stockQuantity < 0)
            throw new ArgumentException("Stock quantity cannot be negative", nameof(stockQuantity));

        Name = name;
        Description = description ?? string.Empty;
        Price = price ?? throw new ArgumentNullException(nameof(price));
        CategoryId = categoryId;
        StockQuantity = stockQuantity;
    }

    public void UpdateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Product name cannot be empty", nameof(name));
        
        Name = name;
        MarkAsUpdated();
    }

    public void UpdateDescription(string description)
    {
        Description = description ?? string.Empty;
        MarkAsUpdated();
    }

    public void UpdatePrice(Money price)
    {
        Price = price ?? throw new ArgumentNullException(nameof(price));
        MarkAsUpdated();
    }

    public void UpdateCategory(string categoryId)
    {
        if (string.IsNullOrWhiteSpace(categoryId))
            throw new ArgumentException("Category ID cannot be empty", nameof(categoryId));
        
        CategoryId = categoryId;
        MarkAsUpdated();
    }

    public void UpdateStock(int quantity)
    {
        if (quantity < 0)
            throw new ArgumentException("Stock quantity cannot be negative", nameof(quantity));
        
        StockQuantity = quantity;
        MarkAsUpdated();
    }

    public void IncreaseStock(int quantity)
    {
        if (quantity < 0)
            throw new ArgumentException("Quantity to add cannot be negative", nameof(quantity));
        
        StockQuantity += quantity;
        MarkAsUpdated();
    }

    public void DecreaseStock(int quantity)
    {
        if (quantity < 0)
            throw new ArgumentException("Quantity to remove cannot be negative", nameof(quantity));
        
        if (StockQuantity < quantity)
            throw new InvalidOperationException("Insufficient stock");
        
        StockQuantity -= quantity;
        MarkAsUpdated();
    }

    public bool IsLowStock(int threshold = 10) => StockQuantity < threshold;
}
