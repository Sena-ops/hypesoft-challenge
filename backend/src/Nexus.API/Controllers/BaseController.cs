using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Nexus.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseController : ControllerBase
{
    protected IActionResult HandleResult<T>(T result)
    {
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    protected IActionResult HandleError(string message, int statusCode = 400)
    {
        return StatusCode(statusCode, new { error = message });
    }

    protected string? GetCurrentUserId()
    {
        return User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? User?.FindFirst("sub")?.Value 
            ?? User?.Identity?.Name;
    }

    protected string? GetCurrentUsername()
    {
        return User?.FindFirst(ClaimTypes.Name)?.Value 
            ?? User?.FindFirst("preferred_username")?.Value 
            ?? User?.Identity?.Name;
    }
}
