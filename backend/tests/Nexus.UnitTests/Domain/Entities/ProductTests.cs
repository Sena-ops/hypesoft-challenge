using FluentAssertions;
using Nexus.Domain.Entities;
using Nexus.Domain.ValueObjects;

namespace Nexus.UnitTests.Domain.Entities;

public class ProductTests
{
    [Fact]
    public void Constructor_ShouldCreateProduct_WhenParametersAreValid()
    {
        // Arrange
        var name = "Test Product";
        var description = "Description";
        var price = new Money(100);
        var categoryId = Guid.NewGuid().ToString();
        var stockQuantity = 10;

        // Act
        var product = new Product(name, description, price, categoryId, stockQuantity);

        // Assert
        product.Name.Should().Be(name);
        product.StockQuantity.Should().Be(stockQuantity);
        product.Id.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void Constructor_ShouldThrowException_WhenStockIsNegative()
    {
        // Arrange
        var stockQuantity = -1;

        // Act
        Action action = () => new Product("Name", "Desc", new Money(10), Guid.NewGuid().ToString(), stockQuantity);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*Stock quantity cannot be negative*");
    }

    [Fact]
    public void UpdateStock_ShouldUpdateQuantity_WhenValueIsValid()
    {
        // Arrange
        var product = new Product("Name", "Desc", new Money(10), Guid.NewGuid().ToString(), 10);
        var newQuantity = 20;

        // Act
        product.UpdateStock(newQuantity);

        // Assert
        product.StockQuantity.Should().Be(newQuantity);
    }

    [Fact]
    public void UpdateStock_ShouldThrowException_WhenValueIsNegative()
    {
        // Arrange
        var product = new Product("Name", "Desc", new Money(10), Guid.NewGuid().ToString(), 10);

        // Act
        Action action = () => product.UpdateStock(-5);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*Stock quantity cannot be negative*");
    }

    [Fact]
    public void IncreaseStock_ShouldAddQuantity()
    {
        // Arrange
        var product = new Product("Name", "Desc", new Money(10), Guid.NewGuid().ToString(), 10);

        // Act
        product.IncreaseStock(5);

        // Assert
        product.StockQuantity.Should().Be(15);
    }

    [Fact]
    public void DecreaseStock_ShouldSubtractQuantity_WhenStockIsSufficient()
    {
        // Arrange
        var product = new Product("Name", "Desc", new Money(10), Guid.NewGuid().ToString(), 10);

        // Act
        product.DecreaseStock(5);

        // Assert
        product.StockQuantity.Should().Be(5);
    }

    [Fact]
    public void DecreaseStock_ShouldThrowException_WhenStockIsInsufficient()
    {
        // Arrange
        var product = new Product("Name", "Desc", new Money(10), Guid.NewGuid().ToString(), 10);

        // Act
        Action action = () => product.DecreaseStock(15);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Insufficient stock");
    }
}
