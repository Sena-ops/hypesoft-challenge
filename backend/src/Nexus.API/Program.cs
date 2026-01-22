using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
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
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

// Middleware de logging de autenticação/autorização
app.UseAuthenticationLogging();

app.MapControllers();

app.MapHealthChecks("/health");

app.Run();
