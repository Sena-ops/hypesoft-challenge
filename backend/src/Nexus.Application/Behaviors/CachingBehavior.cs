using MediatR;
using Microsoft.Extensions.Logging;
using Nexus.Application.Interfaces;

namespace Nexus.Application.Behaviors;

/// <summary>
/// Interface marcadora para requests que devem ser cacheados
/// </summary>
public interface ICacheableQuery<TResponse> : IRequest<TResponse>
{
    string CacheKey { get; }
    TimeSpan? CacheExpiration { get; }
}

/// <summary>
/// Pipeline behavior do MediatR que implementa cache para queries
/// </summary>
public class CachingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : ICacheableQuery<TResponse>
{
    private readonly ICacheService _cacheService;
    private readonly ILogger<CachingBehavior<TRequest, TResponse>> _logger;

    public CachingBehavior(ICacheService cacheService, ILogger<CachingBehavior<TRequest, TResponse>> logger)
    {
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request, 
        RequestHandlerDelegate<TResponse> next, 
        CancellationToken cancellationToken)
    {
        var cacheKey = request.CacheKey;
        
        // Tenta obter do cache
        var cached = await _cacheService.GetAsync<TResponse>(cacheKey, cancellationToken);
        if (cached is not null)
        {
            _logger.LogDebug("Cache HIT para {RequestType} - Key: {CacheKey}", typeof(TRequest).Name, cacheKey);
            return cached;
        }

        _logger.LogDebug("Cache MISS para {RequestType} - Key: {CacheKey}", typeof(TRequest).Name, cacheKey);
        
        // Executa o handler
        var response = await next();
        
        // Salva no cache
        await _cacheService.SetAsync(
            cacheKey, 
            response, 
            request.CacheExpiration ?? TimeSpan.FromMinutes(5), 
            cancellationToken);

        return response;
    }
}
