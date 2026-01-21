using MediatR;
using Nexus.Application.DTOs.Auth;

namespace Nexus.Application.Commands.Auth;

public class LoginCommand : IRequest<AuthResponseDto>
{
    public LoginDto LoginDto { get; }

    public LoginCommand(LoginDto loginDto)
    {
        LoginDto = loginDto;
    }
}
