namespace Nexus.Application.Common;

/// <summary>
/// Constantes para chaves de cache centralizadas
/// </summary>
public static class CacheKeys
{
    public const string CategoriesPrefix = "categories";
    public const string ProductsPrefix = "products";
    public const string DashboardPrefix = "dashboard";
    
    public static string AllCategories => $"{CategoriesPrefix}:all";
    public static string CategoryById(string id) => $"{CategoriesPrefix}:{id}";
    
    public static string AllProducts => $"{ProductsPrefix}:all";
    public static string ProductById(string id) => $"{ProductsPrefix}:{id}";
    public static string ProductsByCategory(string categoryId) => $"{ProductsPrefix}:category:{categoryId}";
    public static string ProductsSearch(string term, int page, int pageSize) => $"{ProductsPrefix}:search:{term}:{page}:{pageSize}";
    public static string ProductsPaged(int page, int pageSize, string? category = null) => 
        category is null 
            ? $"{ProductsPrefix}:paged:{page}:{pageSize}" 
            : $"{ProductsPrefix}:paged:{page}:{pageSize}:{category}";
    public static string ProductsLowStock(int threshold) => $"{ProductsPrefix}:lowstock:{threshold}";
    
    public static string DashboardStats => $"{DashboardPrefix}:stats";
}
