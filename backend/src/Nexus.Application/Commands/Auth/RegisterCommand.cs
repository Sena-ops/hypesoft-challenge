using MediatR;
using Nexus.Application.DTOs.Auth;

namespace Nexus.Application.Commands.Auth;

public class RegisterCommand : IRequest<AuthResponseDto>
{
    public RegisterDto RegisterDto { get; }

    public RegisterCommand(RegisterDto registerDto)
    {
        RegisterDto = registerDto;
    }
}
