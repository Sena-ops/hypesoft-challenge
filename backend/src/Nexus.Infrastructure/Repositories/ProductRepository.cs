using MongoDB.Driver;
using Nexus.Domain.Entities;
using Nexus.Domain.Repositories;
using Nexus.Infrastructure.Data;

namespace Nexus.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly IMongoCollection<Product> _collection;

    public ProductRepository(MongoDbContext context)
    {
        _collection = context.GetCollection<Product>("products");
    }

    public async Task<Product?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _collection
            .Find(p => p.Id == id && !p.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<Product>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _collection
            .Find(p => !p.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Product>> GetByCategoryIdAsync(string categoryId, CancellationToken cancellationToken = default)
    {
        return await _collection
            .Find(p => p.CategoryId == categoryId && !p.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Product>> SearchByNameAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Product>.Filter.Regex(
            p => p.Name, 
            new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")
        ) & Builders<Product>.Filter.Eq(p => p.IsDeleted, false);

        return await _collection
            .Find(filter)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Product>> GetLowStockProductsAsync(int threshold = 10, CancellationToken cancellationToken = default)
    {
        return await _collection
            .Find(p => p.StockQuantity < threshold && !p.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public async Task<Product> CreateAsync(Product product, CancellationToken cancellationToken = default)
    {
        await _collection.InsertOneAsync(product, cancellationToken: cancellationToken);
        return product;
    }

    public async Task<Product> UpdateAsync(Product product, CancellationToken cancellationToken = default)
    {
        await _collection.ReplaceOneAsync(
            p => p.Id == product.Id,
            product,
            cancellationToken: cancellationToken
        );
        return product;
    }

    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var product = await GetByIdAsync(id, cancellationToken);
        if (product != null)
        {
            product.MarkAsDeleted();
            await UpdateAsync(product, cancellationToken);
        }
    }

    public async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        return (int)await _collection.CountDocumentsAsync(
            p => !p.IsDeleted,
            cancellationToken: cancellationToken
        );
    }

    public async Task<decimal> GetTotalStockValueAsync(CancellationToken cancellationToken = default)
    {
        var products = await GetAllAsync(cancellationToken);
        return products.Sum(p => p.Price.Amount * p.StockQuantity);
    }

    /// <summary>
    /// Obtém produtos paginados diretamente do banco de dados (mais eficiente para grandes volumes)
    /// </summary>
    public async Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedAsync(
        int page, 
        int pageSize, 
        string? categoryId = null,
        CancellationToken cancellationToken = default)
    {
        var filterBuilder = Builders<Product>.Filter;
        var filter = filterBuilder.Eq(p => p.IsDeleted, false);
        
        if (!string.IsNullOrEmpty(categoryId))
        {
            filter &= filterBuilder.Eq(p => p.CategoryId, categoryId);
        }

        // Executa contagem e busca em paralelo para melhor performance
        var countTask = _collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
        var itemsTask = _collection
            .Find(filter)
            .SortByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(cancellationToken);

        await Task.WhenAll(countTask, itemsTask);

        return (itemsTask.Result, (int)countTask.Result);
    }

    /// <summary>
    /// Busca produtos por nome com paginação no banco de dados
    /// </summary>
    public async Task<(IEnumerable<Product> Items, int TotalCount)> SearchByNamePagedAsync(
        string searchTerm, 
        int page, 
        int pageSize, 
        CancellationToken cancellationToken = default)
    {
        var filter = Builders<Product>.Filter.Regex(
            p => p.Name, 
            new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")
        ) & Builders<Product>.Filter.Eq(p => p.IsDeleted, false);

        // Executa contagem e busca em paralelo
        var countTask = _collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
        var itemsTask = _collection
            .Find(filter)
            .SortByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(cancellationToken);

        await Task.WhenAll(countTask, itemsTask);

        return (itemsTask.Result, (int)countTask.Result);
    }
}
