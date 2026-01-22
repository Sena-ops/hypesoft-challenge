using MediatR;
using Nexus.Application.DTOs.Products;

namespace Nexus.Application.Commands.Products;

public class UpdateProductCommand : IRequest<ProductDto>
{
    public string Id { get; set; } = string.Empty;
    public UpdateProductDto Product { get; set; } = null!;
    public string? UserId { get; set; }
}
