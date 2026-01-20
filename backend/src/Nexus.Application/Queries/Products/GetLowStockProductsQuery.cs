using MediatR;
using Nexus.Application.DTOs.Products;

namespace Nexus.Application.Queries.Products;

public class GetLowStockProductsQuery : IRequest<IEnumerable<ProductDto>>
{
    public int Threshold { get; set; } = 10;
}
