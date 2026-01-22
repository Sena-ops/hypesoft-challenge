using System.Diagnostics;

namespace Nexus.API.Middlewares;

/// <summary>
/// Middleware para monitorar e logar tempo de resposta das requisições
/// Alerta quando requisições excedem o limite configurado (padrão: 500ms)
/// </summary>
public class PerformanceMonitoringMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<PerformanceMonitoringMiddleware> _logger;
    private readonly int _thresholdMs;

    public PerformanceMonitoringMiddleware(
        RequestDelegate next, 
        ILogger<PerformanceMonitoringMiddleware> logger,
        int thresholdMs = 500)
    {
        _next = next;
        _logger = logger;
        _thresholdMs = thresholdMs;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var requestPath = context.Request.Path;
        var requestMethod = context.Request.Method;

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            var elapsedMs = stopwatch.ElapsedMilliseconds;
            var statusCode = context.Response.StatusCode;

            if (elapsedMs > _thresholdMs)
            {
                _logger.LogWarning(
                    "SLOW REQUEST: {Method} {Path} respondeu em {ElapsedMs}ms (limite: {Threshold}ms) - Status: {StatusCode}",
                    requestMethod, requestPath, elapsedMs, _thresholdMs, statusCode);
            }
            else
            {
                _logger.LogDebug(
                    "Request: {Method} {Path} - {ElapsedMs}ms - Status: {StatusCode}",
                    requestMethod, requestPath, elapsedMs, statusCode);
            }

            // Adiciona header com tempo de resposta (útil para debugging)
            if (!context.Response.HasStarted)
            {
                context.Response.Headers.Append("X-Response-Time-Ms", elapsedMs.ToString());
            }
        }
    }
}

/// <summary>
/// Extensão para adicionar o middleware de performance
/// </summary>
public static class PerformanceMonitoringMiddlewareExtensions
{
    /// <summary>
    /// Adiciona middleware de monitoramento de performance
    /// </summary>
    /// <param name="app">Application builder</param>
    /// <param name="thresholdMs">Limite em milissegundos para alertas (padrão: 500ms)</param>
    public static IApplicationBuilder UsePerformanceMonitoring(
        this IApplicationBuilder app, 
        int thresholdMs = 500)
    {
        return app.UseMiddleware<PerformanceMonitoringMiddleware>(thresholdMs);
    }
}
