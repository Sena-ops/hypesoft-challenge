using System;
using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexus.Application.DTOs.Users;
using Nexus.Application.Interfaces;

namespace Nexus.API.Controllers;

/// <summary>
/// Controller para gerenciamento de usuários e permissões.
/// Requer role Admin para todos os endpoints.
/// </summary>
[Authorize(Policy = "RequireAdmin")]
[ApiController]
[Route("api/[controller]")]
public class UsersController : BaseController
{
    private readonly IKeycloakAdminService _keycloakAdminService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IKeycloakAdminService keycloakAdminService,
        ILogger<UsersController> logger)
    {
        _keycloakAdminService = keycloakAdminService;
        _logger = logger;
    }

    /// <summary>
    /// Lista todos os usuários do sistema
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UserRoleDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllUsers(CancellationToken cancellationToken)
    {
        try
        {
            var users = await _keycloakAdminService.GetAllUsersAsync(cancellationToken);
            return Ok(users);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogError(ex, "Erro de autenticação ao acessar Keycloak Admin");
            return StatusCode(500, new { 
                error = "Erro de autenticação com Keycloak Admin",
                details = ex.Message
            });
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Erro de conexão ao listar usuários do Keycloak");
            return StatusCode(503, new { 
                error = "Serviço de gerenciamento de usuários temporariamente indisponível",
                details = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar usuários: {Message}", ex.Message);
            return StatusCode(500, new { 
                error = "Erro ao listar usuários",
                details = ex.Message
            });
        }
    }

    /// <summary>
    /// Obtém um usuário por ID
    /// </summary>
    [HttpGet("{userId}")]
    [ProducesResponseType(typeof(UserRoleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserById(string userId, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _keycloakAdminService.GetUserByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return NotFound(new { error = "Usuário não encontrado" });
            }
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar usuário {UserId}", userId);
            return HandleError("Erro ao buscar usuário", 500);
        }
    }

    /// <summary>
    /// Obtém um usuário por username
    /// </summary>
    [HttpGet("username/{username}")]
    [ProducesResponseType(typeof(UserRoleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserByUsername(string username, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _keycloakAdminService.GetUserByUsernameAsync(username, cancellationToken);
            if (user == null)
            {
                return NotFound(new { error = "Usuário não encontrado" });
            }
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar usuário {Username}", username);
            return HandleError("Erro ao buscar usuário", 500);
        }
    }

    /// <summary>
    /// Atualiza as roles de um usuário
    /// </summary>
    [HttpPut("{userId}/roles")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserRoles(
        string userId,
        [FromBody] UpdateUserRolesDto updateRolesDto,
        CancellationToken cancellationToken)
    {
        try
        {
            // Validar que o usuário existe
            var user = await _keycloakAdminService.GetUserByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return NotFound(new { error = "Usuário não encontrado" });
            }

            // Validar roles (case-insensitive)
            var availableRoles = await _keycloakAdminService.GetAvailableRolesAsync(cancellationToken);
            var invalidRoles = updateRolesDto.Roles
                .Where(r => !availableRoles.Contains(r, StringComparer.OrdinalIgnoreCase))
                .ToList();
            
            if (invalidRoles.Any())
            {
                return BadRequest(new { error = $"Roles inválidas: {string.Join(", ", invalidRoles)}" });
            }

            // Atualizar roles
            var success = await _keycloakAdminService.UpdateUserRolesAsync(
                userId,
                updateRolesDto.Roles,
                cancellationToken);

            if (!success)
            {
                return HandleError("Erro ao atualizar roles do usuário", 500);
            }

            // Retornar usuário atualizado
            var updatedUser = await _keycloakAdminService.GetUserByIdAsync(userId, cancellationToken);
            return Ok(updatedUser);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar roles do usuário {UserId}", userId);
            return HandleError("Erro ao atualizar roles do usuário", 500);
        }
    }

    /// <summary>
    /// Lista todas as roles disponíveis no sistema
    /// </summary>
    [HttpGet("roles/available")]
    [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAvailableRoles(CancellationToken cancellationToken)
    {
        try
        {
            var roles = await _keycloakAdminService.GetAvailableRolesAsync(cancellationToken);
            // Filtrar apenas as roles principais (admin, editor, leitor)
            var mainRoles = roles.Where(r => 
                r.Equals("admin", StringComparison.OrdinalIgnoreCase) ||
                r.Equals("editor", StringComparison.OrdinalIgnoreCase) ||
                r.Equals("leitor", StringComparison.OrdinalIgnoreCase)
            ).ToList();
            return Ok(mainRoles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar roles disponíveis");
            return StatusCode(500, new { 
                error = "Erro ao listar roles disponíveis",
                details = ex.Message
            });
        }
    }
}
