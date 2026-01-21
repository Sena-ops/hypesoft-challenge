using Nexus.Application.DTOs.Categories;
using Nexus.Application.DTOs.Products;

namespace Nexus.Application.DTOs.Dashboard;

public class CategoryStatsDto
{
    public string CategoryName { get; set; } = string.Empty;
    public int ProductCount { get; set; }
}

public class DashboardStatsDto
{
    public int TotalProducts { get; set; }
    public decimal TotalStockValue { get; set; }
    public int LowStockCount { get; set; }
    public List<CategoryStatsDto> CategoryStats { get; set; } = new();
    public List<ProductDto> LowStockProducts { get; set; } = new();
}
