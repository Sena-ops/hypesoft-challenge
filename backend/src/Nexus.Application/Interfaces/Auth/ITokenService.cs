using Nexus.Domain.Entities;

namespace Nexus.Application.Interfaces.Auth;

public interface ITokenService
{
    string GenerateToken(User user);
}
