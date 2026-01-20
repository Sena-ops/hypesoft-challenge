using AutoMapper;
using MediatR;
using Nexus.Application.DTOs.Common;
using Nexus.Application.DTOs.Products;
using Nexus.Application.Queries.Products;
using Nexus.Domain.Repositories;

namespace Nexus.Application.Handlers.Products;

public class GetProductsByCategoryQueryHandler : IRequestHandler<GetProductsByCategoryQuery, PagedResultDto<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public GetProductsByCategoryQueryHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<PagedResultDto<ProductDto>> Handle(GetProductsByCategoryQuery request, CancellationToken cancellationToken)
    {
        // Busca todos da categoria (idealmente seria paginado no repositório)
        var products = await _productRepository.GetByCategoryIdAsync(request.CategoryId, cancellationToken);
        var totalCount = products.Count();

        // Paginação em memória
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
