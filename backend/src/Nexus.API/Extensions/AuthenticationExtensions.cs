using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace Nexus.API.Extensions;

public static class AuthenticationExtensions
{
    /// <summary>
    /// Configura autenticação JWT Bearer com Keycloak
    /// </summary>
    public static IServiceCollection AddKeycloakAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var keycloakSection = configuration.GetSection("Keycloak");
        var authority = keycloakSection["Authority"];
        var audience = keycloakSection["Audience"];
        var requireHttpsMetadata = keycloakSection.GetValue<bool>("RequireHttpsMetadata", false);

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.Authority = authority;
            options.Audience = audience;
            options.RequireHttpsMetadata = requireHttpsMetadata;
            
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = authority,
                ValidateAudience = true,
                ValidAudiences = new[] { audience, "account" },
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ClockSkew = TimeSpan.FromMinutes(1),
                NameClaimType = "preferred_username",
                RoleClaimType = "roles"
            };

            // Mapeamento de claims do Keycloak para o formato .NET
            options.Events = new JwtBearerEvents
            {
                OnTokenValidated = context =>
                {
                    MapKeycloakRolesToClaims(context);
                    return Task.CompletedTask;
                },
                OnAuthenticationFailed = context =>
                {
                    var logger = context.HttpContext.RequestServices
                        .GetRequiredService<ILoggerFactory>()
                        .CreateLogger("Authentication");
                    
                    logger.LogWarning(
                        context.Exception,
                        "Falha na autenticação: {Message}",
                        context.Exception.Message);
                    
                    return Task.CompletedTask;
                },
                OnChallenge = context =>
                {
                    var logger = context.HttpContext.RequestServices
                        .GetRequiredService<ILoggerFactory>()
                        .CreateLogger("Authentication");
                    
                    if (context.AuthenticateFailure != null)
                    {
                        logger.LogWarning(
                            "Challenge de autenticação falhou: {Error}",
                            context.AuthenticateFailure.Message);
                    }
                    
                    return Task.CompletedTask;
                }
            };
        });

        services.AddAuthorization(options =>
        {
            // Política padrão: requer usuário autenticado
            options.AddPolicy("RequireAuthenticated", policy =>
                policy.RequireAuthenticatedUser());
            
            // Políticas baseadas em roles do Keycloak
            options.AddPolicy("RequireAdmin", policy =>
                policy.RequireRole("admin", "Admin"));
            
            options.AddPolicy("RequireManager", policy =>
                policy.RequireRole("manager", "Manager", "admin", "Admin"));
            
            options.AddPolicy("RequireUser", policy =>
                policy.RequireRole("user", "User", "manager", "Manager", "admin", "Admin"));
        });

        return services;
    }

    /// <summary>
    /// Configura o Swagger com suporte a autenticação JWT Bearer
    /// </summary>
    public static IServiceCollection AddSwaggerWithAuth(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Nexus API",
                Version = "v1",
                Description = "API para Sistema de Gestão de Produtos - Nexus",
                Contact = new OpenApiContact
                {
                    Name = "Nexus Team",
                    Email = "contato@nexus.com"
                }
            });

            // Configuração de segurança JWT Bearer
            var securityScheme = new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Description = "JWT Authorization header usando Bearer scheme. \r\n\r\n" +
                              "Digite 'Bearer' [espaço] e então o token.\r\n\r\n" +
                              "Exemplo: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Reference = new OpenApiReference
                {
                    Id = JwtBearerDefaults.AuthenticationScheme,
                    Type = ReferenceType.SecurityScheme
                }
            };

            options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, securityScheme);

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                { securityScheme, Array.Empty<string>() }
            });
        });

        return services;
    }

    /// <summary>
    /// Mapeia as roles do Keycloak para claims do .NET
    /// O Keycloak armazena roles em realm_access.roles e resource_access.[client].roles
    /// </summary>
    private static void MapKeycloakRolesToClaims(TokenValidatedContext context)
    {
        if (context.Principal?.Identity is not System.Security.Claims.ClaimsIdentity claimsIdentity)
            return;

        // Extrai roles do realm_access
        var realmAccessClaim = context.Principal.FindFirst("realm_access");
        if (realmAccessClaim != null)
        {
            try
            {
                var realmAccess = System.Text.Json.JsonDocument.Parse(realmAccessClaim.Value);
                if (realmAccess.RootElement.TryGetProperty("roles", out var roles))
                {
                    foreach (var role in roles.EnumerateArray())
                    {
                        var roleValue = role.GetString();
                        if (!string.IsNullOrEmpty(roleValue) && 
                            !claimsIdentity.HasClaim(System.Security.Claims.ClaimTypes.Role, roleValue))
                        {
                            claimsIdentity.AddClaim(new System.Security.Claims.Claim(
                                System.Security.Claims.ClaimTypes.Role, roleValue));
                        }
                    }
                }
            }
            catch
            {
                // Ignora erro de parsing
            }
        }

        // Extrai roles do resource_access (client-specific roles)
        var resourceAccessClaim = context.Principal.FindFirst("resource_access");
        if (resourceAccessClaim != null)
        {
            try
            {
                var resourceAccess = System.Text.Json.JsonDocument.Parse(resourceAccessClaim.Value);
                foreach (var client in resourceAccess.RootElement.EnumerateObject())
                {
                    if (client.Value.TryGetProperty("roles", out var clientRoles))
                    {
                        foreach (var role in clientRoles.EnumerateArray())
                        {
                            var roleValue = role.GetString();
                            if (!string.IsNullOrEmpty(roleValue) && 
                                !claimsIdentity.HasClaim(System.Security.Claims.ClaimTypes.Role, roleValue))
                            {
                                claimsIdentity.AddClaim(new System.Security.Claims.Claim(
                                    System.Security.Claims.ClaimTypes.Role, roleValue));
                            }
                        }
                    }
                }
            }
            catch
            {
                // Ignora erro de parsing
            }
        }
    }
}
