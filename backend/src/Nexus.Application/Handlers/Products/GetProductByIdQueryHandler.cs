using AutoMapper;
using MediatR;
using Nexus.Application.DTOs.Products;
using Nexus.Application.Queries.Products;
using Nexus.Domain.Repositories;

namespace Nexus.Application.Handlers.Products;

public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductDto?>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public GetProductByIdQueryHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<ProductDto?> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);

        if (product == null)
            return null;

        return _mapper.Map<ProductDto>(product);
    }
}
