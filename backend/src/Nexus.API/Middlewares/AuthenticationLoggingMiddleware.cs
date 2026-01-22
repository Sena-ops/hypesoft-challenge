using System.Security.Claims;

namespace Nexus.API.Middlewares;

/// <summary>
/// Middleware para logging de autenticação e autorização.
/// Registra informações sobre requisições autenticadas e falhas de autorização.
/// </summary>
public class AuthenticationLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AuthenticationLoggingMiddleware> _logger;

    public AuthenticationLoggingMiddleware(
        RequestDelegate next,
        ILogger<AuthenticationLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Captura informações antes da execução
        var requestPath = context.Request.Path;
        var requestMethod = context.Request.Method;
        var correlationId = context.TraceIdentifier;

        // Executa o próximo middleware
        await _next(context);

        // Loga informações de autenticação após a execução
        LogAuthenticationInfo(context, requestPath, requestMethod, correlationId);
    }

    private void LogAuthenticationInfo(
        HttpContext context,
        string requestPath,
        string requestMethod,
        string correlationId)
    {
        var user = context.User;
        var statusCode = context.Response.StatusCode;

        if (user.Identity?.IsAuthenticated == true)
        {
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? user.FindFirst("sub")?.Value
                      ?? "unknown";
            var userName = user.FindFirst(ClaimTypes.Name)?.Value
                        ?? user.FindFirst("preferred_username")?.Value
                        ?? "unknown";
            var roles = user.FindAll(ClaimTypes.Role)
                           .Select(c => c.Value)
                           .ToList();

            if (statusCode == StatusCodes.Status403Forbidden)
            {
                _logger.LogWarning(
                    "Acesso negado - CorrelationId: {CorrelationId}, " +
                    "Usuário: {UserName} ({UserId}), " +
                    "Roles: [{Roles}], " +
                    "Método: {Method}, " +
                    "Path: {Path}",
                    correlationId,
                    userName,
                    userId,
                    string.Join(", ", roles),
                    requestMethod,
                    requestPath);
                
                // Log adicional para debug
                var allClaims = user.Claims
                    .Select(c => $"{c.Type}={c.Value}")
                    .ToList();
                _logger.LogDebug("Todas as claims do usuário: {Claims}", string.Join(", ", allClaims));
            }
            else
            {
                _logger.LogDebug(
                    "Requisição autenticada - CorrelationId: {CorrelationId}, " +
                    "Usuário: {UserName} ({UserId}), " +
                    "Roles: [{Roles}], " +
                    "Método: {Method}, " +
                    "Path: {Path}, " +
                    "StatusCode: {StatusCode}",
                    correlationId,
                    userName,
                    userId,
                    string.Join(", ", roles),
                    requestMethod,
                    requestPath,
                    statusCode);
            }
        }
        else if (statusCode == StatusCodes.Status401Unauthorized)
        {
            _logger.LogWarning(
                "Requisição não autenticada - CorrelationId: {CorrelationId}, " +
                "Método: {Method}, " +
                "Path: {Path}, " +
                "IP: {IP}",
                correlationId,
                requestMethod,
                requestPath,
                context.Connection.RemoteIpAddress?.ToString() ?? "unknown");
        }
    }
}

/// <summary>
/// Extensões para registrar o middleware de logging de autenticação.
/// </summary>
public static class AuthenticationLoggingMiddlewareExtensions
{
    public static IApplicationBuilder UseAuthenticationLogging(
        this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<AuthenticationLoggingMiddleware>();
    }
}
