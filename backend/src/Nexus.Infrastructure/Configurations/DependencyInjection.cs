using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nexus.Application.Interfaces;
using Nexus.Application.Interfaces.Auth;
using Nexus.Domain.Repositories;
using Nexus.Infrastructure.Auth;
using Nexus.Infrastructure.Caching;
using Nexus.Infrastructure.Data;
using Nexus.Infrastructure.Repositories;

namespace Nexus.Infrastructure.Configurations;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // MongoDB
        services.AddSingleton<MongoDbContext>();
        
        // Configurar índices do MongoDB para otimização de queries
        services.AddHostedService<MongoDbIndexInitializer>();
        
        // Cache - Memory Cache para consultas frequentes
        services.AddMemoryCache();
        services.AddSingleton<ICacheService, MemoryCacheService>();
        
        // Repositories
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        
        // Auth Services
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<ITokenService, TokenService>();

        // Nota: A configuração de autenticação JWT/Keycloak está em AuthenticationExtensions.cs
        // para evitar duplicação de esquemas de autenticação

        return services;
    }
}
