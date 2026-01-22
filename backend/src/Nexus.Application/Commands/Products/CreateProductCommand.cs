using MediatR;
using Nexus.Application.DTOs.Products;

namespace Nexus.Application.Commands.Products;

public class CreateProductCommand : IRequest<ProductDto>
{
    public CreateProductDto Product { get; set; } = null!;
    public string? UserId { get; set; }
}
