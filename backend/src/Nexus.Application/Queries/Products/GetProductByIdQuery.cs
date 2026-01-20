using MediatR;
using Nexus.Application.DTOs.Products;

namespace Nexus.Application.Queries.Products;

public class GetProductByIdQuery : IRequest<ProductDto?>
{
    public string Id { get; set; } = string.Empty;
}
