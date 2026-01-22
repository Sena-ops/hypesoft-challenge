namespace Nexus.Application.Interfaces;

/// <summary>
/// Interface para serviço de cache genérico
/// </summary>
public interface ICacheService
{
    /// <summary>
    /// Obtém um item do cache
    /// </summary>
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Define um item no cache com tempo de expiração
    /// </summary>
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Remove um item do cache
    /// </summary>
    Task RemoveAsync(string key, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Remove todos os itens que começam com o prefixo
    /// </summary>
    Task RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Obtém ou cria um item no cache
    /// </summary>
    Task<T> GetOrCreateAsync<T>(
        string key, 
        Func<Task<T>> factory, 
        TimeSpan? expiration = null, 
        CancellationToken cancellationToken = default);
}
