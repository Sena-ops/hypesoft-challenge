using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Nexus.Domain.Entities;
using Nexus.Domain.Repositories;
using Nexus.Domain.ValueObjects;

namespace Nexus.Infrastructure.Data;

/// <summary>
/// Serviço que popula o banco de dados com dados de exemplo na primeira inicialização
/// </summary>
public class DatabaseSeeder : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DatabaseSeeder> _logger;
    private readonly IHostEnvironment _environment;

    public DatabaseSeeder(
        IServiceProvider serviceProvider,
        ILogger<DatabaseSeeder> logger,
        IHostEnvironment environment)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _environment = environment;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        // Só popula dados em ambiente de desenvolvimento ou se a variável de ambiente estiver configurada
        var seedDatabaseEnv = Environment.GetEnvironmentVariable("SEED_DATABASE");
        var shouldSeed = _environment.IsDevelopment() || 
                        seedDatabaseEnv == "true" || 
                        seedDatabaseEnv == "True" ||
                        seedDatabaseEnv == "1";

        _logger.LogInformation("Verificando seed do banco de dados. Environment: {Environment}, IsDevelopment: {IsDevelopment}, SEED_DATABASE: {SeedDatabase}, ShouldSeed: {ShouldSeed}", 
            _environment.EnvironmentName, _environment.IsDevelopment(), seedDatabaseEnv ?? "null", shouldSeed);

        if (!shouldSeed)
        {
            _logger.LogInformation("Database seeding desabilitado. Configure SEED_DATABASE=true para habilitar.");
            return;
        }

        _logger.LogInformation("Iniciando seed do banco de dados...");

        try
        {
            // Aguarda um pouco para garantir que os índices foram criados e MongoDB está pronto
            _logger.LogInformation("Aguardando 3 segundos para garantir que MongoDB está pronto...");
            await Task.Delay(3000, cancellationToken);

            using var scope = _serviceProvider.CreateScope();
            var categoryRepository = scope.ServiceProvider.GetRequiredService<ICategoryRepository>();
            var productRepository = scope.ServiceProvider.GetRequiredService<IProductRepository>();

            _logger.LogInformation("Verificando se já existem dados no banco...");
            
            // Verifica se já existem dados
            var existingCategories = await categoryRepository.GetAllAsync(cancellationToken);
            var existingProducts = await productRepository.GetAllAsync(cancellationToken);

            _logger.LogInformation("Categorias existentes: {CategoryCount}, Produtos existentes: {ProductCount}", 
                existingCategories.Count(), existingProducts.Count());

            // Verifica se deve forçar o seed mesmo com dados existentes
            var forceSeed = Environment.GetEnvironmentVariable("FORCE_SEED") == "true" || 
                           Environment.GetEnvironmentVariable("FORCE_SEED") == "True" ||
                           Environment.GetEnvironmentVariable("FORCE_SEED") == "1";

            if ((existingCategories.Any() || existingProducts.Any()) && !forceSeed)
            {
                _logger.LogInformation("Banco de dados já possui dados. Seed não será executado. Configure FORCE_SEED=true para forçar.");
                return;
            }

            if (forceSeed && (existingCategories.Any() || existingProducts.Any()))
            {
                _logger.LogWarning("FORCE_SEED está ativado. Seed será executado mesmo com dados existentes.");
            }

            _logger.LogInformation("Banco de dados vazio. Iniciando população...");

            // Cria categorias de exemplo
            var categories = await SeedCategoriesAsync(categoryRepository, cancellationToken);
            
            // Cria produtos de exemplo
            await SeedProductsAsync(productRepository, categories, cancellationToken);

            _logger.LogInformation("Seed do banco de dados concluído com sucesso!");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao executar seed do banco de dados");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private async Task<List<Category>> SeedCategoriesAsync(ICategoryRepository categoryRepository, CancellationToken cancellationToken)
    {
        var categories = new List<Category>
        {
            new Category("Eletrônicos", "Produtos eletrônicos como smartphones, tablets, computadores e acessórios"),
            new Category("Roupas", "Vestuário masculino, feminino e infantil"),
            new Category("Casa e Jardim", "Móveis, decoração e itens para jardinagem"),
            new Category("Esportes", "Equipamentos e acessórios esportivos"),
            new Category("Livros", "Livros físicos e digitais de diversos gêneros"),
            new Category("Alimentos", "Produtos alimentícios e bebidas"),
            new Category("Beleza", "Produtos de beleza e cuidados pessoais"),
            new Category("Brinquedos", "Brinquedos e jogos para todas as idades")
        };

        var createdCategories = new List<Category>();
        foreach (var category in categories)
        {
            try
            {
                var created = await categoryRepository.CreateAsync(category, cancellationToken);
                createdCategories.Add(created);
                _logger.LogDebug("Categoria criada: {CategoryName}", category.Name);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Erro ao criar categoria {CategoryName}", category.Name);
            }
        }

        _logger.LogInformation("{Count} categorias criadas", createdCategories.Count);
        return createdCategories;
    }

    private async Task SeedProductsAsync(IProductRepository productRepository, List<Category> categories, CancellationToken cancellationToken)
    {
        if (!categories.Any())
        {
            _logger.LogWarning("Nenhuma categoria disponível para criar produtos");
            return;
        }

        var eletronicos = categories.FirstOrDefault(c => c.Name == "Eletrônicos");
        var roupas = categories.FirstOrDefault(c => c.Name == "Roupas");
        var casa = categories.FirstOrDefault(c => c.Name == "Casa e Jardim");
        var esportes = categories.FirstOrDefault(c => c.Name == "Esportes");
        var livros = categories.FirstOrDefault(c => c.Name == "Livros");
        var alimentos = categories.FirstOrDefault(c => c.Name == "Alimentos");
        var beleza = categories.FirstOrDefault(c => c.Name == "Beleza");
        var brinquedos = categories.FirstOrDefault(c => c.Name == "Brinquedos");

        var products = new List<Product>();

        // Produtos Eletrônicos
        if (eletronicos != null)
        {
            products.AddRange(new[]
            {
                new Product("iPhone 15 Pro", "Smartphone Apple com chip A17 Pro, 128GB de armazenamento", new Money(8999.99m, "BRL"), eletronicos.Id, 17),
                new Product("Samsung Galaxy S24", "Smartphone Samsung com tela AMOLED de 6.2 polegadas, 256GB", new Money(5499.99m, "BRL"), eletronicos.Id, 25),
                new Product("MacBook Pro M3", "Notebook Apple com chip M3, 16GB RAM, 512GB SSD", new Money(14999.99m, "BRL"), eletronicos.Id, 8),
                new Product("AirPods Pro", "Fones de ouvido sem fio com cancelamento de ruído ativo", new Money(1899.99m, "BRL"), eletronicos.Id, 42),
                new Product("iPad Air", "Tablet Apple com tela de 10.9 polegadas, 64GB", new Money(4999.99m, "BRL"), eletronicos.Id, 15),
                new Product("Monitor LG UltraWide", "Monitor 34 polegadas UltraWide 4K", new Money(3299.99m, "BRL"), eletronicos.Id, 12),
                new Product("Teclado Mecânico RGB", "Teclado mecânico com switches Cherry MX e iluminação RGB", new Money(599.99m, "BRL"), eletronicos.Id, 30),
                new Product("Mouse Gamer Logitech", "Mouse gamer com sensor óptico de alta precisão", new Money(399.99m, "BRL"), eletronicos.Id, 28)
            });
        }

        // Produtos Roupas
        if (roupas != null)
        {
            products.AddRange(new[]
            {
                new Product("Camiseta Básica Algodão", "Camiseta 100% algodão, várias cores disponíveis", new Money(49.99m, "BRL"), roupas.Id, 150),
                new Product("Jeans Skinny", "Calça jeans skinny, modelo ajustado", new Money(129.99m, "BRL"), roupas.Id, 80),
                new Product("Tênis Esportivo", "Tênis para corrida com tecnologia de amortecimento", new Money(299.99m, "BRL"), roupas.Id, 45),
                new Product("Jaqueta Corta-Vento", "Jaqueta impermeável para atividades ao ar livre", new Money(199.99m, "BRL"), roupas.Id, 35),
                new Product("Vestido Floral", "Vestido estampado, tecido leve e confortável", new Money(89.99m, "BRL"), roupas.Id, 60)
            });
        }

        // Produtos Casa e Jardim
        if (casa != null)
        {
            products.AddRange(new[]
            {
                new Product("Sofá Retrátil", "Sofá 3 lugares com assento retrátil, tecido antimanchas", new Money(2499.99m, "BRL"), casa.Id, 5),
                new Product("Mesa de Jantar", "Mesa de madeira maciça, 6 lugares", new Money(1299.99m, "BRL"), casa.Id, 8),
                new Product("Luminária de Mesa", "Luminária LED com regulagem de intensidade", new Money(149.99m, "BRL"), casa.Id, 25),
                new Product("Kit de Panelas Antiaderente", "Conjunto com 5 panelas antiaderentes", new Money(399.99m, "BRL"), casa.Id, 18),
                new Product("Aspirador de Pó Robot", "Aspirador robô com navegação inteligente", new Money(1299.99m, "BRL"), casa.Id, 7)
            });
        }

        // Produtos Esportes
        if (esportes != null)
        {
            products.AddRange(new[]
            {
                new Product("Bicicleta Mountain Bike", "Bicicleta aro 29, 21 marchas, suspensão dianteira", new Money(1899.99m, "BRL"), esportes.Id, 6),
                new Product("Halteres Ajustáveis", "Par de halteres ajustáveis de 2.5kg a 20kg", new Money(299.99m, "BRL"), esportes.Id, 20),
                new Product("Esteira Ergométrica", "Esteira elétrica com inclinação ajustável", new Money(2499.99m, "BRL"), esportes.Id, 4),
                new Product("Bola de Futebol", "Bola oficial tamanho 5, material sintético", new Money(89.99m, "BRL"), esportes.Id, 50)
            });
        }

        // Produtos Livros
        if (livros != null)
        {
            products.AddRange(new[]
            {
                new Product("Clean Code", "Livro sobre boas práticas de programação", new Money(89.90m, "BRL"), livros.Id, 30),
                new Product("Domain-Driven Design", "Guia sobre DDD e arquitetura de software", new Money(99.90m, "BRL"), livros.Id, 22),
                new Product("O Programador Pragmático", "Manual para desenvolvedores profissionais", new Money(79.90m, "BRL"), livros.Id, 28)
            });
        }

        // Produtos Alimentos
        if (alimentos != null)
        {
            products.AddRange(new[]
            {
                new Product("Café Gourmet 500g", "Café especial torrado, embalagem a vácuo", new Money(24.99m, "BRL"), alimentos.Id, 100),
                new Product("Azeite Extra Virgem", "Azeite de oliva importado, 500ml", new Money(39.99m, "BRL"), alimentos.Id, 75),
                new Product("Chocolate Belga", "Tablete de chocolate belga 200g", new Money(19.99m, "BRL"), alimentos.Id, 120)
            });
        }

        // Produtos Beleza
        if (beleza != null)
        {
            products.AddRange(new[]
            {
                new Product("Kit Shampoo e Condicionador", "Kit com shampoo e condicionador 400ml cada", new Money(49.99m, "BRL"), beleza.Id, 65),
                new Product("Perfume Importado", "Perfume masculino, frasco 100ml", new Money(299.99m, "BRL"), beleza.Id, 15),
                new Product("Creme Hidratante Facial", "Creme hidratante com vitamina C, 50ml", new Money(79.99m, "BRL"), beleza.Id, 40)
            });
        }

        // Produtos Brinquedos
        if (brinquedos != null)
        {
            products.AddRange(new[]
            {
                new Product("Lego Classic", "Caixa de peças LEGO clássicas, 790 peças", new Money(199.99m, "BRL"), brinquedos.Id, 25),
                new Product("Boneca Interativa", "Boneca que fala e interage, bateria inclusa", new Money(149.99m, "BRL"), brinquedos.Id, 18),
                new Product("Carrinho de Controle Remoto", "Carro esportivo com controle remoto", new Money(89.99m, "BRL"), brinquedos.Id, 35)
            });
        }

        // Adiciona alguns produtos com estoque baixo para demonstrar a funcionalidade
        if (eletronicos != null && products.Any())
        {
            var lowStockProduct = new Product("Smartwatch", "Relógio inteligente com monitoramento de saúde", new Money(799.99m, "BRL"), eletronicos.Id, 5);
            products.Add(lowStockProduct);
        }

        if (casa != null && products.Any())
        {
            var lowStockProduct = new Product("Cafeteira Expresso", "Máquina de café expresso automática", new Money(899.99m, "BRL"), casa.Id, 3);
            products.Add(lowStockProduct);
        }

        var createdCount = 0;
        foreach (var product in products)
        {
            try
            {
                await productRepository.CreateAsync(product, cancellationToken);
                createdCount++;
                _logger.LogDebug("Produto criado: {ProductName}", product.Name);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Erro ao criar produto {ProductName}", product.Name);
            }
        }

        _logger.LogInformation("{Count} produtos criados", createdCount);
    }
}
