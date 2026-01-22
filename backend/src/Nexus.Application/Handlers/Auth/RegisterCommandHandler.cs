using MediatR;
using Nexus.Application.Commands.Auth;
using Nexus.Application.DTOs.Auth;
using Nexus.Application.Interfaces.Auth;
using Nexus.Domain.Entities;
using Nexus.Domain.Repositories;

namespace Nexus.Application.Handlers.Auth;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public RegisterCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _userRepository.GetByEmailAsync(request.RegisterDto.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException("Email already registered");
        }

        var passwordHash = _passwordHasher.Hash(request.RegisterDto.Password);
        
        var user = new User(
            request.RegisterDto.Name,
            request.RegisterDto.Email,
            passwordHash,
            request.RegisterDto.Role
        );

        await _userRepository.AddAsync(user);

        var token = _tokenService.GenerateToken(user);

        return new AuthResponseDto
        {
            Token = token,
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role
        };
    }
}
