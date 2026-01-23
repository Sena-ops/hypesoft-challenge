using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Nexus.Application.DTOs.Users;
using Nexus.Application.Interfaces;

namespace Nexus.Infrastructure.Services;

public class KeycloakAdminService : IKeycloakAdminService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<KeycloakAdminService> _logger;
    private readonly string _keycloakUrl;
    private readonly string _realm;
    private readonly string _adminUsername;
    private readonly string _adminPassword;
    private readonly string _adminClientId;
    private readonly string _adminClientSecret;
    private string? _adminToken;
    private DateTime _tokenExpiry;

    public KeycloakAdminService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<KeycloakAdminService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
        
        // Tenta obter a URL do Keycloak de diferentes fontes
        var adminUrl = _configuration["Keycloak:AdminUrl"];
        var authority = _configuration["Keycloak:Authority"];
        
        if (!string.IsNullOrEmpty(adminUrl))
        {
            _keycloakUrl = adminUrl;
        }
        else if (!string.IsNullOrEmpty(authority))
        {
            // Extrai a URL base do Authority (remove /realms/nexus)
            _keycloakUrl = authority.Replace("/realms/nexus", "").Replace("/realms/master", "");
        }
        else
        {
            // Tenta detectar se está rodando no Docker ou localmente
            var isDocker = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true";
            _keycloakUrl = isDocker ? "http://keycloak:8080" : "http://localhost:8080";
        }
        
        // Garante que não tenha barra no final
        _keycloakUrl = _keycloakUrl.TrimEnd('/');
        
        // Se estiver no Docker e a URL ainda for localhost, tenta corrigir
        var isDockerContainer = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true";
        if (isDockerContainer && _keycloakUrl.Contains("localhost"))
        {
            _logger.LogWarning("Detectado Docker mas URL do Keycloak é localhost. Corrigindo para usar nome do serviço...");
            _keycloakUrl = _keycloakUrl.Replace("localhost", "keycloak");
            _logger.LogInformation("URL do Keycloak corrigida para: {Url}", _keycloakUrl);
        }
        
        _realm = _configuration["Keycloak:Realm"] ?? "nexus";
        _adminUsername = _configuration["Keycloak:AdminUsername"] ?? "admin";
        _adminPassword = _configuration["Keycloak:AdminPassword"] ?? "admin";
        _adminClientId = _configuration["Keycloak:AdminClientId"] ?? "nexus-api";
        _adminClientSecret = _configuration["Keycloak:AdminClientSecret"] ?? "nexus-api-secret";
        
        _logger.LogInformation("KeycloakAdminService inicializado. URL: {Url}, Realm: {Realm}, ClientId: {ClientId}", 
            _keycloakUrl, _realm, _adminClientId);
    }

    private async Task<string> GetAdminTokenAsync(CancellationToken cancellationToken)
    {
        // Se o token ainda é válido, retorna ele
        if (!string.IsNullOrEmpty(_adminToken) && DateTime.UtcNow < _tokenExpiry)
        {
            return _adminToken;
        }

        try
        {
            _logger.LogInformation("Obtendo token de admin do Keycloak. URL: {Url}, ClientId: {ClientId}", 
                _keycloakUrl, _adminClientId);
            
            // Verifica se o Keycloak está acessível
            try
            {
                var healthUrl = $"{_keycloakUrl}/health";
                var healthResponse = await _httpClient.GetAsync(healthUrl, cancellationToken);
                if (!healthResponse.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Keycloak health check retornou {Status}. Continuando mesmo assim...", healthResponse.StatusCode);
                }
            }
            catch (Exception healthEx)
            {
                _logger.LogWarning(healthEx, "Não foi possível verificar saúde do Keycloak. Continuando mesmo assim...");
            }
            
            // Tenta primeiro usar service account (client credentials) - método recomendado
            // O service account precisa ter roles do client "realm-management" configuradas
            HttpResponseMessage? response = null;
            string? errorContent = null;
            
            // Tentativa 1: Service account com client credentials grant
            try
            {
                var serviceAccountTokenUrl = $"{_keycloakUrl}/realms/{_realm}/protocol/openid-connect/token";
                _logger.LogInformation("Tentativa 1: Autenticando com service account (client credentials) no realm {Realm}", _realm);
                
                var authHeader = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_adminClientId}:{_adminClientSecret}"));
                var request = new HttpRequestMessage(HttpMethod.Post, serviceAccountTokenUrl);
                request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authHeader);
                request.Content = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("grant_type", "client_credentials")
                });
                
                response = await _httpClient.SendAsync(request, cancellationToken);
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Autenticação com service account bem-sucedida");
                }
                else
                {
                    errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                    _logger.LogWarning("Falha ao autenticar com service account. Status: {Status}, Response: {Response}", 
                        response.StatusCode, errorContent);
                    response = null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Erro ao tentar autenticar com service account");
            }
            
            // Tentativa 2: Realm master com admin-cli (fallback)
            if (response == null || !response.IsSuccessStatusCode)
            {
                try
                {
                    var masterTokenUrl = $"{_keycloakUrl}/realms/master/protocol/openid-connect/token";
                    _logger.LogInformation("Tentativa 2: Autenticando no realm master com admin-cli");
                    
                    var masterContent = new FormUrlEncodedContent(new[]
                    {
                        new KeyValuePair<string, string>("grant_type", "password"),
                        new KeyValuePair<string, string>("client_id", "admin-cli"),
                        new KeyValuePair<string, string>("username", _adminUsername),
                        new KeyValuePair<string, string>("password", _adminPassword)
                    });
                    
                    response = await _httpClient.PostAsync(masterTokenUrl, masterContent, cancellationToken);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        _logger.LogInformation("Autenticação no realm master bem-sucedida");
                    }
                    else
                    {
                        var masterErrorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                        _logger.LogWarning("Falha ao autenticar no realm master. Status: {Status}, Response: {Response}", 
                            response.StatusCode, masterErrorContent);
                        errorContent = masterErrorContent;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Erro ao tentar autenticar no realm master");
                }
            }
            
            // Tentativa 3: Realm nexus com usuário admin local (último recurso)
            if (response == null || !response.IsSuccessStatusCode)
            {
                try
                {
                    var nexusTokenUrl = $"{_keycloakUrl}/realms/{_realm}/protocol/openid-connect/token";
                    _logger.LogInformation("Tentativa 3: Autenticando no realm {Realm} com usuário {Username}", _realm, _adminUsername);
                    
                    var nexusContent = new FormUrlEncodedContent(new[]
                    {
                        new KeyValuePair<string, string>("grant_type", "password"),
                        new KeyValuePair<string, string>("client_id", _adminClientId),
                        new KeyValuePair<string, string>("client_secret", _adminClientSecret),
                        new KeyValuePair<string, string>("username", _adminUsername),
                        new KeyValuePair<string, string>("password", _adminPassword)
                    });
                    
                    response = await _httpClient.PostAsync(nexusTokenUrl, nexusContent, cancellationToken);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        _logger.LogInformation("Autenticação no realm {Realm} bem-sucedida", _realm);
                    }
                    else
                    {
                        var nexusErrorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                        _logger.LogError("Falha ao autenticar no realm {Realm}. Status: {Status}, Response: {Response}", 
                            _realm, response.StatusCode, nexusErrorContent);
                        errorContent = nexusErrorContent;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erro ao tentar autenticar no realm {Realm}", _realm);
                }
            }

            if (response == null || !response.IsSuccessStatusCode)
            {
                _logger.LogError("Todas as tentativas de autenticação falharam. Último erro: {Error}", errorContent);
                
                if (response?.StatusCode == HttpStatusCode.Unauthorized)
                {
                    throw new UnauthorizedAccessException(
                        $"Credenciais inválidas para Keycloak Admin. " +
                        $"Tentamos autenticar no realm 'master' e no realm '{_realm}'. " +
                        $"Verifique se as credenciais (AdminUsername: '{_adminUsername}', AdminPassword) " +
                        $"estão corretas no appsettings.json. " +
                        $"Erro: {errorContent ?? "Desconhecido"}");
                }
                
                throw new HttpRequestException($"Falha ao obter token de admin após múltiplas tentativas. Último erro: {errorContent ?? "Desconhecido"}");
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            
            if (string.IsNullOrWhiteSpace(json))
            {
                throw new Exception("Resposta vazia ao obter token de admin");
            }
            
            var tokenResponse = JsonSerializer.Deserialize<JsonElement>(json);
            
            if (!tokenResponse.TryGetProperty("access_token", out var accessTokenProp))
            {
                _logger.LogError("Resposta do token não contém 'access_token'. Response: {Response}", json);
                throw new Exception("Resposta do Keycloak não contém access_token.");
            }
            
            _adminToken = accessTokenProp.GetString();
            var expiresIn = tokenResponse.TryGetProperty("expires_in", out var expiresInProp) 
                ? expiresInProp.GetInt32() 
                : 300; // Default 5 minutos
            
            // Decodificar o token JWT para verificar as claims (roles)
            try
            {
                var tokenParts = _adminToken.Split('.');
                if (tokenParts.Length == 3)
                {
                    // Decodificar o payload (parte 2 do JWT)
                    var payload = tokenParts[1];
                    // Adicionar padding se necessário
                    switch (payload.Length % 4)
                    {
                        case 2: payload += "=="; break;
                        case 3: payload += "="; break;
                    }
                    var payloadBytes = Convert.FromBase64String(payload);
                    var payloadJson = Encoding.UTF8.GetString(payloadBytes);
                    var payloadElement = JsonSerializer.Deserialize<JsonElement>(payloadJson);
                    
                    // Log das roles no token
                    if (payloadElement.TryGetProperty("realm_access", out var realmAccess))
                    {
                        if (realmAccess.TryGetProperty("roles", out var roles))
                        {
                            var rolesList = roles.EnumerateArray().Select(r => r.GetString()).Where(r => r != null).ToList();
                            _logger.LogInformation("Roles no token (realm_access): {Roles}", string.Join(", ", rolesList));
                        }
                    }
                    
                    if (payloadElement.TryGetProperty("resource_access", out var resourceAccess))
                    {
                        _logger.LogInformation("Resource access no token: {ResourceAccess}", resourceAccess.ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Não foi possível decodificar o token JWT para verificar roles");
            }
            
            _tokenExpiry = DateTime.UtcNow.AddSeconds(expiresIn - 60); // Renova 1 minuto antes

            _logger.LogInformation("Token de admin obtido com sucesso. Expira em {ExpiresIn} segundos", expiresIn);
            return _adminToken ?? throw new Exception("Token não retornado");
        }
        catch (UnauthorizedAccessException)
        {
            throw;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Erro HTTP ao obter token de admin do Keycloak. URL: {Url}", _keycloakUrl);
            throw new Exception($"Não foi possível conectar ao Keycloak Admin API em {_keycloakUrl}. Verifique se o Keycloak está rodando e acessível.", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter token de admin do Keycloak");
            throw;
        }
    }

    private async Task<HttpRequestMessage> CreateAuthenticatedRequestAsync(
        HttpMethod method,
        string url,
        CancellationToken cancellationToken)
    {
        var token = await GetAdminTokenAsync(cancellationToken);
        var request = new HttpRequestMessage(method, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        // Log para debug (apenas primeiros caracteres do token por segurança)
        _logger.LogDebug("Criando requisição autenticada para {Url} com token (primeiros 20 chars): {TokenPrefix}", 
            url, token?.Substring(0, Math.Min(20, token?.Length ?? 0)));
        
        return request;
    }

    public async Task<List<UserRoleDto>> GetAllUsersAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Buscando todos os usuários do realm {Realm}", _realm);
            var url = $"{_keycloakUrl}/admin/realms/{_realm}/users";
            var request = await CreateAuthenticatedRequestAsync(HttpMethod.Get, url, cancellationToken);
            var response = await _httpClient.SendAsync(request, cancellationToken);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("Falha ao buscar usuários. Status: {Status}, Response: {Response}", 
                    response.StatusCode, errorContent);
                
                if (response.StatusCode == HttpStatusCode.Forbidden)
                {
                    throw new UnauthorizedAccessException(
                        $"Acesso negado à Admin REST API. " +
                        $"O token obtido não tem permissões suficientes para acessar a Admin REST API. " +
                        $"Para resolver isso, você precisa configurar um service account no realm '{_realm}' " +
                        $"com roles do client 'realm-management' (view-users, manage-users, etc.) " +
                        $"ou usar o usuário admin do realm 'master'. " +
                        $"Erro: {errorContent}");
                }
                
                throw new HttpRequestException($"Falha ao buscar usuários: {response.StatusCode}. {errorContent}");
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            var users = JsonSerializer.Deserialize<List<JsonElement>>(json) ?? new List<JsonElement>();
            
            _logger.LogInformation("Encontrados {Count} usuários no Keycloak", users.Count);

            var result = new List<UserRoleDto>();
            foreach (var user in users)
            {
                var userDto = await MapUserToDtoAsync(user, cancellationToken);
                if (userDto != null)
                {
                    result.Add(userDto);
                }
            }

            _logger.LogInformation("Mapeados {Count} usuários com sucesso", result.Count);
            return result;
        }
        catch (HttpRequestException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar usuários do Keycloak");
            throw new Exception("Erro ao buscar usuários do Keycloak. Verifique os logs para mais detalhes.", ex);
        }
    }

    public async Task<UserRoleDto?> GetUserByIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var url = $"{_keycloakUrl}/admin/realms/{_realm}/users/{userId}";
            var request = await CreateAuthenticatedRequestAsync(HttpMethod.Get, url, cancellationToken);
            var response = await _httpClient.SendAsync(request, cancellationToken);
            
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                return null;

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            var user = JsonSerializer.Deserialize<JsonElement>(json);
            
            return await MapUserToDtoAsync(user, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar usuário {UserId} do Keycloak", userId);
            throw;
        }
    }

    public async Task<UserRoleDto?> GetUserByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        try
        {
            var url = $"{_keycloakUrl}/admin/realms/{_realm}/users?username={Uri.EscapeDataString(username)}";
            var request = await CreateAuthenticatedRequestAsync(HttpMethod.Get, url, cancellationToken);
            var response = await _httpClient.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            var users = JsonSerializer.Deserialize<List<JsonElement>>(json) ?? new List<JsonElement>();
            
            if (users.Count == 0)
                return null;

            return await MapUserToDtoAsync(users[0], cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar usuário {Username} do Keycloak", username);
            throw;
        }
    }

    private async Task<UserRoleDto?> MapUserToDtoAsync(JsonElement user, CancellationToken cancellationToken)
    {
        try
        {
            var userId = user.GetProperty("id").GetString() ?? string.Empty;
            
            var userDto = new UserRoleDto
            {
                UserId = userId,
                Username = user.TryGetProperty("username", out var username) ? username.GetString() ?? string.Empty : string.Empty,
                Email = user.TryGetProperty("email", out var email) ? email.GetString() ?? string.Empty : string.Empty,
                FirstName = user.TryGetProperty("firstName", out var firstName) ? firstName.GetString() ?? string.Empty : string.Empty,
                LastName = user.TryGetProperty("lastName", out var lastName) ? lastName.GetString() ?? string.Empty : string.Empty,
                Enabled = user.TryGetProperty("enabled", out var enabled) && enabled.GetBoolean()
            };

            // Buscar roles do usuário
            var rolesUrl = $"{_keycloakUrl}/admin/realms/{_realm}/users/{userId}/role-mappings/realm";
            var rolesRequest = await CreateAuthenticatedRequestAsync(HttpMethod.Get, rolesUrl, cancellationToken);
            var rolesResponse = await _httpClient.SendAsync(rolesRequest, cancellationToken);
            
            if (rolesResponse.IsSuccessStatusCode)
            {
                var rolesJson = await rolesResponse.Content.ReadAsStringAsync(cancellationToken);
                var roles = JsonSerializer.Deserialize<List<JsonElement>>(rolesJson) ?? new List<JsonElement>();
                userDto.Roles = roles
                    .Where(r => r.TryGetProperty("name", out var name))
                    .Select(r => r.GetProperty("name").GetString() ?? string.Empty)
                    .Where(r => !string.IsNullOrEmpty(r))
                    .ToList();
            }
            else
            {
                // Se não conseguir buscar roles, inicializa com lista vazia
                userDto.Roles = new List<string>();
                _logger.LogWarning("Não foi possível buscar roles para o usuário {UserId}. Status: {Status}", userId, rolesResponse.StatusCode);
            }

            return userDto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao mapear usuário do Keycloak");
            return null;
        }
    }

    public async Task<bool> UpdateUserRolesAsync(string userId, List<string> roles, CancellationToken cancellationToken = default)
    {
        try
        {
            // Primeiro, buscar as roles disponíveis
            var availableRoles = await GetAvailableRolesAsync(cancellationToken);
            
            // Filtrar apenas roles válidas (admin, editor, leitor)
            var validRoles = roles
                .Where(r => availableRoles.Contains(r, StringComparer.OrdinalIgnoreCase))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            // Buscar informações das roles do realm
            var rolesUrl = $"{_keycloakUrl}/admin/realms/{_realm}/roles";
            var rolesRequest = await CreateAuthenticatedRequestAsync(HttpMethod.Get, rolesUrl, cancellationToken);
            var rolesResponse = await _httpClient.SendAsync(rolesRequest, cancellationToken);
            rolesResponse.EnsureSuccessStatusCode();

            var rolesJson = await rolesResponse.Content.ReadAsStringAsync(cancellationToken);
            var allRoles = JsonSerializer.Deserialize<List<JsonElement>>(rolesJson) ?? new List<JsonElement>();
            
            // Filtrar apenas as roles que queremos adicionar
            var rolesToAdd = allRoles
                .Where(r => 
                {
                    var roleName = r.GetProperty("name").GetString() ?? string.Empty;
                    return validRoles.Contains(roleName, StringComparer.OrdinalIgnoreCase);
                })
                .ToList();

            // Buscar roles atuais do usuário
            var currentRolesUrl = $"{_keycloakUrl}/admin/realms/{_realm}/users/{userId}/role-mappings/realm";
            var currentRolesRequest = await CreateAuthenticatedRequestAsync(HttpMethod.Get, currentRolesUrl, cancellationToken);
            var currentRolesResponse = await _httpClient.SendAsync(currentRolesRequest, cancellationToken);
            
            List<JsonElement> currentRoles = new();
            if (currentRolesResponse.IsSuccessStatusCode)
            {
                var currentRolesJson = await currentRolesResponse.Content.ReadAsStringAsync(cancellationToken);
                currentRoles = JsonSerializer.Deserialize<List<JsonElement>>(currentRolesJson) ?? new List<JsonElement>();
            }

            // Remover todas as roles atuais (apenas as principais: admin, editor, leitor)
            var mainRoleNames = new[] { "admin", "editor", "leitor" };
            var rolesToRemove = currentRoles
                .Where(r => 
                {
                    var roleName = r.GetProperty("name").GetString() ?? string.Empty;
                    return mainRoleNames.Contains(roleName, StringComparer.OrdinalIgnoreCase);
                })
                .ToList();

            if (rolesToRemove.Count > 0)
            {
                var deleteRequest = await CreateAuthenticatedRequestAsync(HttpMethod.Delete, currentRolesUrl, cancellationToken);
                deleteRequest.Content = new StringContent(JsonSerializer.Serialize(rolesToRemove), Encoding.UTF8, "application/json");
                var deleteResponse = await _httpClient.SendAsync(deleteRequest, cancellationToken);
                deleteResponse.EnsureSuccessStatusCode();
            }

            // Adicionar novas roles
            if (rolesToAdd.Count > 0)
            {
                var addRequest = await CreateAuthenticatedRequestAsync(HttpMethod.Post, currentRolesUrl, cancellationToken);
                addRequest.Content = new StringContent(JsonSerializer.Serialize(rolesToAdd), Encoding.UTF8, "application/json");
                var addResponse = await _httpClient.SendAsync(addRequest, cancellationToken);
                addResponse.EnsureSuccessStatusCode();
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar roles do usuário {UserId}", userId);
            throw;
        }
    }

    public async Task<List<string>> GetAvailableRolesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var url = $"{_keycloakUrl}/admin/realms/{_realm}/roles";
            var request = await CreateAuthenticatedRequestAsync(HttpMethod.Get, url, cancellationToken);
            var response = await _httpClient.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            var roles = JsonSerializer.Deserialize<List<JsonElement>>(json) ?? new List<JsonElement>();
            
            return roles
                .Where(r => r.TryGetProperty("name", out var _))
                .Select(r => r.GetProperty("name").GetString() ?? string.Empty)
                .Where(r => !string.IsNullOrEmpty(r))
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar roles disponíveis do Keycloak");
            throw;
        }
    }
}
