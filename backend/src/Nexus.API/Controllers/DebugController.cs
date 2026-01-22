using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Nexus.API.Controllers;

/// <summary>
/// Controller de debug para verificar informações do usuário autenticado.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DebugController : BaseController
{
    [HttpGet("me")]
    public IActionResult GetCurrentUserInfo()
    {
        var userId = GetCurrentUserId();
        var username = GetCurrentUsername();
        var roles = User.FindAll(ClaimTypes.Role)
            .Select(c => c.Value)
            .ToList();
        
        var allClaims = User.Claims
            .Select(c => new { Type = c.Type, Value = c.Value })
            .ToList();

        return Ok(new
        {
            userId,
            username,
            roles,
            allClaims,
            isAuthenticated = User.Identity?.IsAuthenticated ?? false,
            authenticationType = User.Identity?.AuthenticationType
        });
    }
}
