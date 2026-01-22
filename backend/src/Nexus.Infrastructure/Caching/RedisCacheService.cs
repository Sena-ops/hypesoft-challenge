using System.Linq;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Nexus.Application.Interfaces;
using StackExchange.Redis;

namespace Nexus.Infrastructure.Caching;

/// <summary>
/// Implementação do serviço de cache usando Redis (IDistributedCache)
/// Permite escalabilidade horizontal compartilhando cache entre múltiplas instâncias
/// </summary>
public class RedisCacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    private readonly IConnectionMultiplexer? _redis;
    private readonly ILogger<RedisCacheService> _logger;
    private static readonly TimeSpan DefaultExpiration = TimeSpan.FromMinutes(5);

    public RedisCacheService(
        IDistributedCache cache, 
        IConnectionMultiplexer? redis,
        ILogger<RedisCacheService> logger)
    {
        _cache = cache;
        _redis = redis;
        _logger = logger;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var cachedBytes = await _cache.GetAsync(key, cancellationToken);
            
            if (cachedBytes == null || cachedBytes.Length == 0)
            {
                _logger.LogDebug("Cache MISS para chave: {Key}", key);
                return default(T?);
            }

            var json = Encoding.UTF8.GetString(cachedBytes);
            var value = JsonSerializer.Deserialize<T>(json);
            
            _logger.LogDebug("Cache HIT para chave: {Key}", key);
            return value;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter cache para chave: {Key}", key);
            return default(T?);
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var json = JsonSerializer.Serialize(value);
            var bytes = Encoding.UTF8.GetBytes(json);

            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration ?? DefaultExpiration,
                SlidingExpiration = TimeSpan.FromMinutes(2)
            };

            await _cache.SetAsync(key, bytes, options, cancellationToken);
            
            _logger.LogDebug("Cache SET para chave: {Key}, Expiração: {Expiration}", key, expiration ?? DefaultExpiration);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao definir cache para chave: {Key}", key);
            // Não lança exceção para não quebrar o fluxo da aplicação se o Redis estiver indisponível
        }
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            await _cache.RemoveAsync(key, cancellationToken);
            _logger.LogDebug("Cache REMOVE para chave: {Key}", key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao remover cache para chave: {Key}", key);
        }
    }

    public async Task RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default)
    {
        try
        {
            if (_redis == null)
            {
                _logger.LogWarning(
                    "IConnectionMultiplexer não disponível. RemoveByPrefixAsync não pode ser executado. Prefixo: {Prefix}", 
                    prefix);
                return;
            }

            var server = _redis.GetServer(_redis.GetEndPoints().First());
            
            // O InstanceName "Nexus:" é adicionado automaticamente pelo IDistributedCache
            // Então as chaves são armazenadas como "Nexus:categories:all"
            // Precisamos incluir o InstanceName no padrão de busca
            const string instanceName = "Nexus:";
            var pattern = $"{instanceName}{prefix}*";
            
            _logger.LogDebug("Buscando chaves com padrão: {Pattern}", pattern);
            var keys = server.Keys(pattern: pattern).ToArray();

            if (keys.Length == 0)
            {
                _logger.LogDebug("Nenhuma chave encontrada com prefixo: {Prefix} (padrão: {Pattern})", prefix, pattern);
                return;
            }

            // Remove cada chave encontrada
            // As chaves do Redis incluem o InstanceName, mas o RemoveAsync do IDistributedCache
            // adiciona automaticamente o InstanceName, então precisamos remover o prefixo
            var tasks = keys.Select(key =>
            {
                var keyString = key.ToString();
                // Remove o InstanceName da chave antes de passar para RemoveAsync
                var keyWithoutInstance = keyString.StartsWith(instanceName) 
                    ? keyString.Substring(instanceName.Length) 
                    : keyString;
                return _cache.RemoveAsync(keyWithoutInstance, cancellationToken);
            });
            await Task.WhenAll(tasks);

            _logger.LogInformation("Cache REMOVE BY PREFIX: {Prefix}, Removidos: {Count} itens", prefix, keys.Length);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao remover cache por prefixo: {Prefix}", prefix);
        }
    }

    public async Task<T> GetOrCreateAsync<T>(
        string key, 
        Func<Task<T>> factory, 
        TimeSpan? expiration = null, 
        CancellationToken cancellationToken = default)
    {
        var cached = await GetAsync<T>(key, cancellationToken);
        
        if (cached is not null)
        {
            return cached;
        }

        var value = await factory();
        await SetAsync(key, value, expiration, cancellationToken);
        
        return value;
    }
}
