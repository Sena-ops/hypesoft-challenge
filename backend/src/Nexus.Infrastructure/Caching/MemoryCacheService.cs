using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Nexus.Application.Interfaces;

namespace Nexus.Infrastructure.Caching;

/// <summary>
/// Implementação do serviço de cache usando IMemoryCache
/// </summary>
public class MemoryCacheService : ICacheService
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<MemoryCacheService> _logger;
    private readonly ConcurrentDictionary<string, byte> _keys = new();
    private static readonly TimeSpan DefaultExpiration = TimeSpan.FromMinutes(5);

    public MemoryCacheService(IMemoryCache cache, ILogger<MemoryCacheService> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        if (_cache.TryGetValue(key, out T? value))
        {
            _logger.LogDebug("Cache HIT para chave: {Key}", key);
            return Task.FromResult(value);
        }

        _logger.LogDebug("Cache MISS para chave: {Key}", key);
        return Task.FromResult(default(T?));
    }

    public Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        var cacheOptions = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expiration ?? DefaultExpiration,
            SlidingExpiration = TimeSpan.FromMinutes(2)
        };

        cacheOptions.RegisterPostEvictionCallback((evictedKey, evictedValue, reason, state) =>
        {
            _keys.TryRemove(evictedKey.ToString()!, out _);
            _logger.LogDebug("Cache item removido: {Key}, Razão: {Reason}", evictedKey, reason);
        });

        _cache.Set(key, value, cacheOptions);
        _keys.TryAdd(key, 0);
        
        _logger.LogDebug("Cache SET para chave: {Key}, Expiração: {Expiration}", key, expiration ?? DefaultExpiration);
        
        return Task.CompletedTask;
    }

    public Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        _cache.Remove(key);
        _keys.TryRemove(key, out _);
        
        _logger.LogDebug("Cache REMOVE para chave: {Key}", key);
        
        return Task.CompletedTask;
    }

    public Task RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default)
    {
        var keysToRemove = _keys.Keys.Where(k => k.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)).ToList();
        
        foreach (var key in keysToRemove)
        {
            _cache.Remove(key);
            _keys.TryRemove(key, out _);
        }

        _logger.LogDebug("Cache REMOVE BY PREFIX: {Prefix}, Removidos: {Count} itens", prefix, keysToRemove.Count);
        
        return Task.CompletedTask;
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
