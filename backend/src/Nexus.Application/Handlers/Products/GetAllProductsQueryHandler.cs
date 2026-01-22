using AutoMapper;
using MediatR;
using Nexus.Application.DTOs.Common;
using Nexus.Application.DTOs.Products;
using Nexus.Application.Queries.Products;
using Nexus.Domain.Repositories;

namespace Nexus.Application.Handlers.Products;

public class GetAllProductsQueryHandler : IRequestHandler<GetAllProductsQuery, PagedResultDto<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public GetAllProductsQueryHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<PagedResultDto<ProductDto>> Handle(GetAllProductsQuery request, CancellationToken cancellationToken)
    {
        // Usa paginação diretamente no banco de dados (muito mais eficiente para grandes volumes)
        var (products, totalCount) = await _productRepository.GetPagedAsync(
            request.Page, 
            request.PageSize, 
            request.CategoryId,
            cancellationToken);

        var productDtos = _mapper.Map<IEnumerable<ProductDto>>(products);

        return new PagedResultDto<ProductDto>
        {
            Items = productDtos,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };
    }
}
