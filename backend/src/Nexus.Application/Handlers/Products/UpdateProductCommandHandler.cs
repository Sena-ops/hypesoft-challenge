using AutoMapper;
using MediatR;
using Nexus.Application.Commands.Products;
using Nexus.Application.DTOs.Products;
using Nexus.Domain.Repositories;
using Nexus.Domain.ValueObjects;

namespace Nexus.Application.Handlers.Products;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, ProductDto>
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMapper _mapper;

    public UpdateProductCommandHandler(
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        IMapper mapper)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _mapper = mapper;
    }

    public async Task<ProductDto> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        // Buscar produto existente
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (product == null)
        {
            throw new KeyNotFoundException($"Produto com ID '{request.Id}' não encontrado.");
        }

        // Validar se a categoria existe (se foi alterada)
        if (product.CategoryId != request.Product.CategoryId)
        {
            var categoryExists = await _categoryRepository.ExistsAsync(request.Product.CategoryId, cancellationToken);
            if (!categoryExists)
            {
                throw new ArgumentException($"Categoria com ID '{request.Product.CategoryId}' não encontrada.", nameof(request.Product.CategoryId));
            }
        }

        // Atualizar produto usando métodos do domínio
        product.UpdateName(request.Product.Name);
        product.UpdateDescription(request.Product.Description);
        product.UpdatePrice(new Money(request.Product.Price, request.Product.Currency));
        product.UpdateCategory(request.Product.CategoryId);
        product.UpdateStock(request.Product.StockQuantity);

        // Salvar no repositório
        var updatedProduct = await _productRepository.UpdateAsync(product, cancellationToken);

        // Mapear para DTO e retornar
        return _mapper.Map<ProductDto>(updatedProduct);
    }
}
