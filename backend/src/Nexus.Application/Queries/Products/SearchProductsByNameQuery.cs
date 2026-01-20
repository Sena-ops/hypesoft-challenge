using MediatR;
using Nexus.Application.DTOs.Common;
using Nexus.Application.DTOs.Products;

namespace Nexus.Application.Queries.Products;

public class SearchProductsByNameQuery : IRequest<PagedResultDto<ProductDto>>
{
    public string SearchTerm { get; set; } = string.Empty;
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
