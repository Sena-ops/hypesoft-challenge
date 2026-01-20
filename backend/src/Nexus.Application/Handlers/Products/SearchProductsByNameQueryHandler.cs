using AutoMapper;
using MediatR;
using Nexus.Application.DTOs.Common;
using Nexus.Application.DTOs.Products;
using Nexus.Application.Queries.Products;
using Nexus.Domain.Repositories;

namespace Nexus.Application.Handlers.Products;

public class SearchProductsByNameQueryHandler : IRequestHandler<SearchProductsByNameQuery, PagedResultDto<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public SearchProductsByNameQueryHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<PagedResultDto<ProductDto>> Handle(SearchProductsByNameQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            return new PagedResultDto<ProductDto>
            {
                Items = Enumerable.Empty<ProductDto>(),
                Page = request.Page,
                PageSize = request.PageSize,
                TotalCount = 0
            };
        }

        var products = await _productRepository.SearchByNameAsync(request.SearchTerm, cancellationToken);
        var totalCount = products.Count();

        var pagedProducts = products
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var productDtos = _mapper.Map<IEnumerable<ProductDto>>(pagedProducts);

        return new PagedResultDto<ProductDto>
        {
            Items = productDtos,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };
    }
}
