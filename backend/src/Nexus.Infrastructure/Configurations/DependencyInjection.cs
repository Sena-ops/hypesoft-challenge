using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Nexus.Application.Interfaces;
using Nexus.Application.Interfaces.Auth;
using Nexus.Domain.Repositories;
using Nexus.Infrastructure.Auth;
using Nexus.Infrastructure.Caching;
using Nexus.Infrastructure.Data;
using Nexus.Infrastructure.Repositories;
using StackExchange.Redis;
using System;

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
        
        // Configura Redis com timeout curto para não bloquear inicialização
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = $"{redisConnectionString},connectTimeout=2000,syncTimeout=2000,abortConnect=false";
            options.InstanceName = "Nexus:";
        });

        // Registrar IConnectionMultiplexer para operações avançadas (ex: RemoveByPrefix)
        // Configurado para não bloquear a inicialização se Redis não estiver disponível
        services.AddSingleton<IConnectionMultiplexer>(sp =>
        {
            var configurationOptions = ConfigurationOptions.Parse(redisConnectionString);
            configurationOptions.ConnectTimeout = 500; // 500ms - muito curto
            configurationOptions.SyncTimeout = 500;
            configurationOptions.AsyncTimeout = 500;
            configurationOptions.AbortOnConnectFail = true; // Aborta rapidamente se não conseguir
            configurationOptions.ConnectRetry = 0; // Não tenta reconectar
            configurationOptions.AllowAdmin = false;
            configurationOptions.ClientName = "Nexus-API";
            
            // Tenta conectar de forma não bloqueante
            // Se falhar, o cache será usado em modo fallback (memory cache)
            try
            {
                var multiplexer = ConnectionMultiplexer.Connect(configurationOptions);
                // Não espera pela conexão - deixa conectar em background
                return multiplexer;
            }
            catch (Exception ex)
            {
                // Log do erro mas não bloqueia a inicialização
                var logger = sp.GetService<ILogger<IConnectionMultiplexer>>();
                logger?.LogWarning(ex, "Falha ao conectar ao Redis. Usando fallback para Memory Cache.");
                
                // Retorna um multiplexer que falhará silenciosamente nas operações
                // O cache service deve ter fallback para memory cache
                return ConnectionMultiplexer.Connect(configurationOptions);
            }
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
