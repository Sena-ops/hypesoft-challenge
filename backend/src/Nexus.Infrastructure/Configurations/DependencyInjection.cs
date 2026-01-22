using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nexus.Application.Interfaces;
using Nexus.Application.Interfaces.Auth;
using Nexus.Domain.Repositories;
using Nexus.Infrastructure.Auth;
using Nexus.Infrastructure.Caching;
using Nexus.Infrastructure.Data;
using Nexus.Infrastructure.Repositories;
using StackExchange.Redis;

namespace Nexus.Infrastructure.Configurations;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // MongoDB
        services.AddSingleton<MongoDbContext>();
        
        // Configurar índices do MongoDB para otimização de queries
        services.AddHostedService<MongoDbIndexInitializer>();
        
        // Database Seeder (executa após os índices)
        services.AddHostedService<DatabaseSeeder>();
        
        // Redis Cache - Distribuído para escalabilidade horizontal
        var redisConnectionString = configuration.GetConnectionString("Redis") 
            ?? configuration["Redis:ConnectionString"] 
            ?? "localhost:6379";
        
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = redisConnectionString;
            options.InstanceName = "Nexus:";
        });

        // Registrar IConnectionMultiplexer para operações avançadas (ex: RemoveByPrefix)
        services.AddSingleton<IConnectionMultiplexer>(sp =>
        {
            return ConnectionMultiplexer.Connect(redisConnectionString);
        });

        // Cache Service usando Redis
        services.AddSingleton<ICacheService, RedisCacheService>();
        
        // Repositories
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        
        // Auth Services
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<ITokenService, TokenService>();

        // Keycloak Admin Service
        services.AddHttpClient<Application.Interfaces.IKeycloakAdminService, Services.KeycloakAdminService>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        // Nota: A configuração de autenticação JWT/Keycloak está em AuthenticationExtensions.cs
        // para evitar duplicação de esquemas de autenticação

        return services;
    }
}
