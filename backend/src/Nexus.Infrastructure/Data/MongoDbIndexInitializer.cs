using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using Nexus.Domain.Entities;

namespace Nexus.Infrastructure.Data;

/// <summary>
/// Serviço que inicializa os índices do MongoDB na inicialização da aplicação
/// para otimizar as consultas mais frequentes
/// </summary>
public class MongoDbIndexInitializer : IHostedService
{
    private readonly MongoDbContext _context;
    private readonly ILogger<MongoDbIndexInitializer> _logger;

    public MongoDbIndexInitializer(MongoDbContext context, ILogger<MongoDbIndexInitializer> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Iniciando criação de índices do MongoDB...");

        try
        {
            await CreateProductIndexes(cancellationToken);
            await CreateCategoryIndexes(cancellationToken);
            await CreateUserIndexes(cancellationToken);
            
            _logger.LogInformation("Índices do MongoDB criados com sucesso!");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar índices do MongoDB");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private async Task CreateProductIndexes(CancellationToken cancellationToken)
    {
        var collection = _context.GetCollection<Product>("products");

        var indexes = new List<CreateIndexModel<Product>>
        {
            // Índice para busca por nome (text search)
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys.Text(p => p.Name),
                new CreateIndexOptions { Name = "idx_products_name_text" }
            ),
            
            // Índice para filtro por categoria + soft delete
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys
                    .Ascending(p => p.CategoryId)
                    .Ascending(p => p.IsDeleted),
                new CreateIndexOptions { Name = "idx_products_category_deleted" }
            ),
            
            // Índice para consulta de estoque baixo
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys
                    .Ascending(p => p.StockQuantity)
                    .Ascending(p => p.IsDeleted),
                new CreateIndexOptions { Name = "idx_products_stock_deleted" }
            ),
            
            // Índice para soft delete (usado em todas as consultas)
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys.Ascending(p => p.IsDeleted),
                new CreateIndexOptions { Name = "idx_products_deleted" }
            ),
            
            // Índice composto para paginação ordenada por data de criação
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys
                    .Ascending(p => p.IsDeleted)
                    .Descending(p => p.CreatedAt),
                new CreateIndexOptions { Name = "idx_products_deleted_created" }
            ),
            
            // Índice para busca por nome (ascending para ordenação)
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys.Ascending(p => p.Name),
                new CreateIndexOptions { Name = "idx_products_name" }
            )
        };

        await collection.Indexes.CreateManyAsync(indexes, cancellationToken);
        _logger.LogDebug("Índices de produtos criados");
    }

    private async Task CreateCategoryIndexes(CancellationToken cancellationToken)
    {
        var collection = _context.GetCollection<Category>("categories");

        var indexes = new List<CreateIndexModel<Category>>
        {
            // Índice para soft delete
            new CreateIndexModel<Category>(
                Builders<Category>.IndexKeys.Ascending(c => c.IsDeleted),
                new CreateIndexOptions { Name = "idx_categories_deleted" }
            ),
            
            // Índice para busca por nome
            new CreateIndexModel<Category>(
                Builders<Category>.IndexKeys.Ascending(c => c.Name),
                new CreateIndexOptions { Name = "idx_categories_name" }
            )
        };

        await collection.Indexes.CreateManyAsync(indexes, cancellationToken);
        _logger.LogDebug("Índices de categorias criados");
    }

    private async Task CreateUserIndexes(CancellationToken cancellationToken)
    {
        var collection = _context.GetCollection<User>("users");

        var indexes = new List<CreateIndexModel<User>>
        {
            // Índice único para email
            new CreateIndexModel<User>(
                Builders<User>.IndexKeys.Ascending(u => u.Email),
                new CreateIndexOptions { Name = "idx_users_email", Unique = true }
            ),
            
            // Índice para busca por nome
            new CreateIndexModel<User>(
                Builders<User>.IndexKeys.Ascending(u => u.Name),
                new CreateIndexOptions { Name = "idx_users_name" }
            )
        };

        await collection.Indexes.CreateManyAsync(indexes, cancellationToken);
        _logger.LogDebug("Índices de usuários criados");
    }
}
