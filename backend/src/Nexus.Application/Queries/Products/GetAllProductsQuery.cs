using MediatR;
using Nexus.Application.DTOs.Common;
using Nexus.Application.DTOs.Products;

namespace Nexus.Application.Queries.Products;

public class GetAllProductsQuery : IRequest<PagedResultDto<ProductDto>>
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
