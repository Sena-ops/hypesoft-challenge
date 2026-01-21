using AutoMapper;
using FluentAssertions;
using Moq;
using Nexus.Application.Commands.Products;
using Nexus.Application.DTOs.Products;
using Nexus.Application.Handlers.Products;
using Nexus.Domain.Entities;
using Nexus.Domain.Repositories;
using Nexus.Domain.ValueObjects;

namespace Nexus.UnitTests.Application.Handlers;

public class CreateProductCommandHandlerTests
{
    private readonly Mock<IProductRepository> _productRepositoryMock;
    private readonly Mock<ICategoryRepository> _categoryRepositoryMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly CreateProductCommandHandler _handler;

    public CreateProductCommandHandlerTests()
    {
        _productRepositoryMock = new Mock<IProductRepository>();
        _categoryRepositoryMock = new Mock<ICategoryRepository>();
        _mapperMock = new Mock<IMapper>();

        _handler = new CreateProductCommandHandler(
            _productRepositoryMock.Object,
            _categoryRepositoryMock.Object,
            _mapperMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldCreateProduct_WhenCategoryExists()
    {
        // Arrange
        var command = new CreateProductCommand
        {
            Product = new CreateProductDto
            {
                Name = "Test Product",
                Price = 100,
                Currency = "BRL",
                CategoryId = Guid.NewGuid().ToString(),
                StockQuantity = 10
            }
        };

        _categoryRepositoryMock.Setup(x => x.ExistsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _productRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<Product>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product p, CancellationToken ct) => p);

        _mapperMock.Setup(x => x.Map<ProductDto>(It.IsAny<Product>()))
            .Returns(new ProductDto { Id = Guid.NewGuid().ToString(), Name = command.Product.Name });

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(command.Product.Name);
        
        _productRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<Product>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrowException_WhenCategoryDoesNotExist()
    {
        // Arrange
        var command = new CreateProductCommand
        {
            Product = new CreateProductDto
            {
                Name = "Test Product",
                CategoryId = "invalid-id"
            }
        };

        _categoryRepositoryMock.Setup(x => x.ExistsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        Func<Task> action = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await action.Should().ThrowAsync<ArgumentException>()
            .WithMessage($"Categoria com ID '{command.Product.CategoryId}' não encontrada.*");
            
        _productRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<Product>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
