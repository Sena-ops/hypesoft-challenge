namespace Nexus.API.Middlewares;

/// <summary>
/// Middleware para adicionar headers de segurança HTTP
/// Protege contra ataques comuns como XSS, clickjacking, MIME sniffing, etc.
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<SecurityHeadersMiddleware> _logger;

    public SecurityHeadersMiddleware(
        RequestDelegate next,
        ILogger<SecurityHeadersMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Adiciona headers de segurança antes de processar a requisição
        AddSecurityHeaders(context);

        await _next(context);
    }

    private static void AddSecurityHeaders(HttpContext context)
    {
        var response = context.Response;

        // Previne MIME type sniffing
        if (!response.Headers.ContainsKey("X-Content-Type-Options"))
        {
            response.Headers.Append("X-Content-Type-Options", "nosniff");
        }

        // Previne clickjacking
        if (!response.Headers.ContainsKey("X-Frame-Options"))
        {
            response.Headers.Append("X-Frame-Options", "DENY");
        }

        // Proteção XSS (legado, mas ainda útil)
        if (!response.Headers.ContainsKey("X-XSS-Protection"))
        {
            response.Headers.Append("X-XSS-Protection", "1; mode=block");
        }

        // Content Security Policy - política restritiva
        if (!response.Headers.ContainsKey("Content-Security-Policy"))
        {
            // Permite apenas recursos do mesmo origin e inline scripts/styles necessários
            response.Headers.Append("Content-Security-Policy", 
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data: https:; " +
                "font-src 'self' data:; " +
                "connect-src 'self' http://localhost:8080 http://localhost:5000; " +
                "frame-ancestors 'none';");
        }

        // Referrer Policy - controla quanto do referrer é enviado
        if (!response.Headers.ContainsKey("Referrer-Policy"))
        {
            response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
        }

        // Permissions Policy (antigo Feature-Policy)
        if (!response.Headers.ContainsKey("Permissions-Policy"))
        {
            response.Headers.Append("Permissions-Policy", 
                "geolocation=(), " +
                "microphone=(), " +
                "camera=(), " +
                "payment=(), " +
                "usb=(), " +
                "magnetometer=(), " +
                "gyroscope=(), " +
                "speaker=()");
        }

        // Strict Transport Security (HSTS) - apenas em HTTPS
        if (context.Request.IsHttps && !response.Headers.ContainsKey("Strict-Transport-Security"))
        {
            response.Headers.Append("Strict-Transport-Security", 
                "max-age=31536000; includeSubDomains; preload");
        }

        // Remove header que expõe versão do servidor
        if (response.Headers.ContainsKey("Server"))
        {
            response.Headers.Remove("Server");
        }

        // Remove header X-Powered-By que expõe tecnologia
        if (response.Headers.ContainsKey("X-Powered-By"))
        {
            response.Headers.Remove("X-Powered-By");
        }
    }
}

/// <summary>
/// Extensões para registrar o middleware de security headers
/// </summary>
public static class SecurityHeadersMiddlewareExtensions
{
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<SecurityHeadersMiddleware>();
    }
}
