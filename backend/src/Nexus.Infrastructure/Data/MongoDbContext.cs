using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace Nexus.Infrastructure.Data;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("MongoDB") 
            ?? throw new InvalidOperationException("MongoDB connection string is not configured");
        
        var databaseName = configuration["MongoDB:DatabaseName"] 
            ?? throw new InvalidOperationException("MongoDB database name is not configured");

        var client = new MongoClient(connectionString);
        _database = client.GetDatabase(databaseName);
    }

    public IMongoDatabase Database => _database;

    public IMongoCollection<T> GetCollection<T>(string collectionName)
    {
        return _database.GetCollection<T>(collectionName);
    }
}
