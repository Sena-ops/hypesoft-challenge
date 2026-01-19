using MongoDB.Driver;
using Nexus.Domain.Entities;
using Nexus.Domain.Repositories;
using Nexus.Infrastructure.Data;

namespace Nexus.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly IMongoCollection<Category> _collection;

    public CategoryRepository(MongoDbContext context)
    {
        _collection = context.GetCollection<Category>("categories");
    }

    public async Task<Category?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _collection
            .Find(c => c.Id == id && !c.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<Category>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _collection
            .Find(c => !c.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public async Task<Category> CreateAsync(Category category, CancellationToken cancellationToken = default)
    {
        await _collection.InsertOneAsync(category, cancellationToken: cancellationToken);
        return category;
    }

    public async Task<Category> UpdateAsync(Category category, CancellationToken cancellationToken = default)
    {
        await _collection.ReplaceOneAsync(
            c => c.Id == category.Id,
            category,
            cancellationToken: cancellationToken
        );
        return category;
    }

    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var category = await GetByIdAsync(id, cancellationToken);
        if (category != null)
        {
            category.MarkAsDeleted();
            await UpdateAsync(category, cancellationToken);
        }
    }

    public async Task<bool> ExistsAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _collection
            .CountDocumentsAsync(c => c.Id == id && !c.IsDeleted, cancellationToken: cancellationToken) > 0;
    }
}
