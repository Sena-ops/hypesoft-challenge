using System;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Logging;
using Nexus.API.Extensions;
using Nexus.API.Middlewares;
using Nexus.Application.Extensions;
using Nexus.Infrastructure.Configurations;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Add Keycloak Authentication
builder.Services.AddKeycloakAuthentication(builder.Configuration);

// Add Swagger with JWT Authentication support
builder.Services.AddSwaggerWithAuth(builder.Configuration);

// Add Infrastructure
builder.Services.AddInfrastructure(builder.Configuration);

// Add Application
builder.Services.AddApplication();

// Add Health Checks
builder.Services.AddHealthChecks();
    //.AddMongoDb(
    //    builder.Configuration.GetConnectionString("MongoDB") ?? ""
    //);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(builder.Configuration["Cors:AllowedOrigins"]?.Split(',') ?? new[] { "http://localhost:3000" })
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Add Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User.Identity?.Name ?? context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1)
            }));
});

var app = builder.Build();

// Configure the HTTP request pipeline
// Swagger sempre disponível em Development, mesmo sem Keycloak
// IMPORTANTE: Swagger deve vir ANTES dos middlewares de autenticação
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Nexus API v1");
        c.RoutePrefix = "swagger";
        c.DisplayRequestDuration();
    });
}

// Security Headers - deve ser um dos primeiros middlewares
app.UseSecurityHeaders();

// Middleware de monitoramento de performance (primeiro para medir tempo total)
app.UsePerformanceMonitoring(thresholdMs: 500);

// HTTPS Redirection apenas em produção com HTTPS configurado
if (!app.Environment.IsDevelopment() && app.Configuration["ASPNETCORE_HTTPS_PORT"] != null)
{
    app.UseHttpsRedirection();
}

app.UseCors();

// Rate Limiter - exclui Swagger e Health endpoints
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

// Middleware de logging de autenticação/autorização
app.UseAuthenticationLogging();

app.MapControllers();

// Health check endpoint (sem autenticação)
app.MapHealthChecks("/health");
app.MapHealthChecks("/api/health");

// Log de inicialização
app.Logger.LogInformation("API configurada. Iniciando servidor...");
app.Logger.LogInformation("Swagger disponível em: /swagger");
app.Logger.LogInformation("Health check disponível em: /api/health");

try
{
    app.Logger.LogInformation("Iniciando servidor HTTP na porta 80...");
    app.Logger.LogInformation("URLs configuradas: {Urls}", string.Join(", ", app.Urls));
    app.Run();
}
catch (Exception ex)
{
    app.Logger.LogError(ex, "Erro ao iniciar servidor: {Message}", ex.Message);
    throw;
}
