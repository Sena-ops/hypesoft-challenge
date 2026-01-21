using Moq;
using Nexus.Application.Commands.Auth;
using Nexus.Application.DTOs.Auth;
using Nexus.Application.Handlers.Auth;
using Nexus.Application.Interfaces.Auth;
using Nexus.Domain.Entities;
using Nexus.Domain.Repositories;
using Xunit;

namespace Nexus.UnitTests.Application.Handlers.Auth;

public class LoginCommandHandlerTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly LoginCommandHandler _handler;

    public LoginCommandHandlerTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _tokenServiceMock = new Mock<ITokenService>();
        _handler = new LoginCommandHandler(
            _userRepositoryMock.Object,
            _passwordHasherMock.Object,
            _tokenServiceMock.Object
        );
    }

    [Fact]
    public async Task Handle_ValidCredentials_ReturnsAuthResponse()
    {
        // Arrange
        var loginDto = new LoginDto { Email = "test@example.com", Password = "password" };
        var command = new LoginCommand(loginDto);
        var user = new User("Test User", "test@example.com", "hashed_password", "User");

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(loginDto.Email))
            .ReturnsAsync(user);
        _passwordHasherMock.Setup(x => x.Verify(loginDto.Password, user.PasswordHash))
            .Returns(true);
        _tokenServiceMock.Setup(x => x.GenerateToken(user))
            .Returns("valid_token");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("valid_token", result.Token);
        Assert.Equal(user.Email, result.Email);
    }

    [Fact]
    public async Task Handle_InvalidCredentials_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var loginDto = new LoginDto { Email = "test@example.com", Password = "wrong_password" };
        var command = new LoginCommand(loginDto);
        var user = new User("Test User", "test@example.com", "hashed_password", "User");

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(loginDto.Email))
            .ReturnsAsync(user);
        _passwordHasherMock.Setup(x => x.Verify(loginDto.Password, user.PasswordHash))
            .Returns(false);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => 
            _handler.Handle(command, CancellationToken.None));
    }
}
