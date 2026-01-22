using Nexus.Domain.Entities;

namespace Nexus.Domain.Repositories;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> GetByCategoryIdAsync(string categoryId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> SearchByNameAsync(string searchTerm, CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> GetLowStockProductsAsync(int threshold = 10, CancellationToken cancellationToken = default);
    Task<Product> CreateAsync(Product product, CancellationToken cancellationToken = default);
    Task<Product> UpdateAsync(Product product, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<decimal> GetTotalStockValueAsync(CancellationToken cancellationToken = default);
    
    // Métodos otimizados com paginação no banco de dados
    Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedAsync(
        int page, 
        int pageSize, 
        string? categoryId = null,
        CancellationToken cancellationToken = default);
    
    Task<(IEnumerable<Product> Items, int TotalCount)> SearchByNamePagedAsync(
        string searchTerm, 
        int page, 
        int pageSize, 
        CancellationToken cancellationToken = default);
}
