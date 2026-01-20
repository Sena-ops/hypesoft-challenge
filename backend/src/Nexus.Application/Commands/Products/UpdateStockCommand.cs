using MediatR;
using Nexus.Application.DTOs.Products;

namespace Nexus.Application.Commands.Products;

public class UpdateStockCommand : IRequest<ProductDto>
{
    public string Id { get; set; } = string.Empty;
    public int Quantity { get; set; }
}
