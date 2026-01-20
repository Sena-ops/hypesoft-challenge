using AutoMapper;
using MediatR;
using Nexus.Application.DTOs.Products;
using Nexus.Application.Queries.Products;
using Nexus.Domain.Repositories;

namespace Nexus.Application.Handlers.Products;

public class GetLowStockProductsQueryHandler : IRequestHandler<GetLowStockProductsQuery, IEnumerable<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public GetLowStockProductsQueryHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ProductDto>> Handle(GetLowStockProductsQuery request, CancellationToken cancellationToken)
    {
        var products = await _productRepository.GetLowStockProductsAsync(request.Threshold, cancellationToken);
        return _mapper.Map<IEnumerable<ProductDto>>(products);
    }
}
