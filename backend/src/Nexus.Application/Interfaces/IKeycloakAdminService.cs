using Nexus.Application.DTOs.Users;

namespace Nexus.Application.Interfaces;

public interface IKeycloakAdminService
{
    Task<List<UserRoleDto>> GetAllUsersAsync(CancellationToken cancellationToken = default);
    Task<UserRoleDto?> GetUserByIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<UserRoleDto?> GetUserByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<bool> UpdateUserRolesAsync(string userId, List<string> roles, CancellationToken cancellationToken = default);
    Task<List<string>> GetAvailableRolesAsync(CancellationToken cancellationToken = default);
}
