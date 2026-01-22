using System.Linq;
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
                // Aceita tokens tanto do frontend quanto da API e account
                ValidAudiences = new[] { audience, "nexus-frontend", "account" },
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ClockSkew = TimeSpan.FromMinutes(1),
                NameClaimType = "preferred_username",
                // Usar ClaimTypes.Role para que RequireRole funcione corretamente
                RoleClaimType = System.Security.Claims.ClaimTypes.Role
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
            
            // Editor pode criar e editar (compatível com manager)
            options.AddPolicy("RequireEditor", policy =>
                policy.RequireRole("editor", "Editor", "manager", "Manager", "admin", "Admin"));
            
            // Manager (compatibilidade - mesmo que editor)
            options.AddPolicy("RequireManager", policy =>
                policy.RequireRole("editor", "Editor", "manager", "Manager", "admin", "Admin"));
            
            // Leitor pode apenas visualizar (compatível com user)
            options.AddPolicy("RequireLeitor", policy =>
                policy.RequireRole("leitor", "Leitor", "editor", "Editor", "manager", "Manager", "admin", "Admin", "user", "User"));
            
            // User (compatibilidade - mesmo que leitor)
            options.AddPolicy("RequireUser", policy =>
                policy.RequireRole("leitor", "Leitor", "user", "User", "editor", "Editor", "manager", "Manager", "admin", "Admin"));
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
        var logger = context.HttpContext.RequestServices
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger("RoleMapping");

        if (context.Principal?.Identity is not System.Security.Claims.ClaimsIdentity claimsIdentity)
        {
            logger.LogWarning("ClaimsIdentity não encontrada");
            return;
        }

        logger.LogInformation("Iniciando mapeamento de roles do Keycloak");
        
        // Log de todas as claims disponíveis
        foreach (var claim in context.Principal.Claims)
        {
            logger.LogDebug("Claim: {Type} = {Value}", claim.Type, claim.Value.Length > 100 ? claim.Value[..100] + "..." : claim.Value);
        }

        // Extrai roles do realm_access
        var realmAccessClaim = context.Principal.FindFirst("realm_access");
        if (realmAccessClaim != null)
        {
            logger.LogInformation("realm_access encontrado: {Value}", realmAccessClaim.Value);
            try
            {
                var realmAccess = System.Text.Json.JsonDocument.Parse(realmAccessClaim.Value);
                if (realmAccess.RootElement.TryGetProperty("roles", out var roles))
                {
                    foreach (var role in roles.EnumerateArray())
                    {
                        var roleValue = role.GetString();
                        if (!string.IsNullOrEmpty(roleValue))
                        {
                            logger.LogInformation("Adicionando realm role: {Role}", roleValue);
                            if (!claimsIdentity.HasClaim(System.Security.Claims.ClaimTypes.Role, roleValue))
                            {
                                claimsIdentity.AddClaim(new System.Security.Claims.Claim(
                                    System.Security.Claims.ClaimTypes.Role, roleValue));
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erro ao parsear realm_access");
            }
        }
        else
        {
            logger.LogWarning("realm_access não encontrado no token");
        }

        // Extrai roles do resource_access (client-specific roles)
        var resourceAccessClaim = context.Principal.FindFirst("resource_access");
        if (resourceAccessClaim != null)
        {
            logger.LogInformation("resource_access encontrado: {Value}", resourceAccessClaim.Value);
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
                            if (!string.IsNullOrEmpty(roleValue))
                            {
                                logger.LogInformation("Adicionando client role ({Client}): {Role}", client.Name, roleValue);
                                if (!claimsIdentity.HasClaim(System.Security.Claims.ClaimTypes.Role, roleValue))
                                {
                                    claimsIdentity.AddClaim(new System.Security.Claims.Claim(
                                        System.Security.Claims.ClaimTypes.Role, roleValue));
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erro ao parsear resource_access");
            }
        }
        else
        {
            logger.LogWarning("resource_access não encontrado no token");
        }

        // Log das roles finais
        var finalRoles = claimsIdentity.Claims
            .Where(c => c.Type == System.Security.Claims.ClaimTypes.Role)
            .Select(c => c.Value)
            .ToList();
        logger.LogInformation("Roles finais mapeadas: {Roles}", string.Join(", ", finalRoles));
    }
}
