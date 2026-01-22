using MongoDB.Driver;
using Nexus.Domain.Entities;
using Nexus.Domain.Repositories;
using Nexus.Infrastructure.Data;

namespace Nexus.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<User> _collection;

    public UserRepository(MongoDbContext context)
    {
        _collection = context.GetCollection<User>("Users");
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        return await _collection.Find(u => u.Id == id && !u.IsDeleted).FirstOrDefaultAsync();
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _collection.Find(u => u.Email == email && !u.IsDeleted).FirstOrDefaultAsync();
    }

    public async Task AddAsync(User user)
    {
        await _collection.InsertOneAsync(user);
    }

    public async Task UpdateAsync(User user)
    {
        await _collection.ReplaceOneAsync(u => u.Id == user.Id, user);
    }

    public async Task DeleteAsync(string id)
    {
        var update = Builders<User>.Update
            .Set(u => u.IsDeleted, true)
            .Set(u => u.UpdatedAt, DateTime.UtcNow);

        await _collection.UpdateOneAsync(u => u.Id == id, update);
    }
}
