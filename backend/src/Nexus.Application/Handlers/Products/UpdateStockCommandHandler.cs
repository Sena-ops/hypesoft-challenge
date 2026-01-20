using AutoMapper;
using MediatR;
using Nexus.Application.Commands.Products;
using Nexus.Application.DTOs.Products;
using Nexus.Domain.Repositories;

namespace Nexus.Application.Handlers.Products;

public class UpdateStockCommandHandler : IRequestHandler<UpdateStockCommand, ProductDto>
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;

    public UpdateStockCommandHandler(IProductRepository productRepository, IMapper mapper)
    {
        _productRepository = productRepository;
        _mapper = mapper;
    }

    public async Task<ProductDto> Handle(UpdateStockCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);

        if (product == null)
            throw new KeyNotFoundException($"Produto com ID '{request.Id}' não encontrado.");

        // Atualiza o estoque usando o método de domínio (que já valida se < 0)
        product.UpdateStock(request.Quantity);

        await _productRepository.UpdateAsync(product, cancellationToken);

        return _mapper.Map<ProductDto>(product);
    }
}
