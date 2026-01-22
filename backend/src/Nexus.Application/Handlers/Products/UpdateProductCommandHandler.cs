using AutoMapper;
using MediatR;
using Nexus.Application.Commands.Products;
using Nexus.Application.Common;
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

        // Sanitiza inputs de texto para prevenir XSS e injection
        var sanitizedName = InputSanitizer.Sanitize(request.Product.Name);
        var sanitizedDescription = InputSanitizer.Sanitize(request.Product.Description);
        // Currency não precisa ser sanitizado - já é validado pelo FluentValidation como código ISO de 3 letras
        var sanitizedCurrency = request.Product.Currency;

        // Valida CategoryId (GUID) sem sanitizar - apenas valida formato
        if (!string.IsNullOrWhiteSpace(request.Product.CategoryId) && !Guid.TryParse(request.Product.CategoryId, out _))
        {
            throw new ArgumentException("O ID da categoria deve ser um GUID válido.", nameof(request.Product.CategoryId));
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

        // Atualizar produto usando métodos do domínio com dados sanitizados
        product.UpdateName(sanitizedName);
        product.UpdateDescription(sanitizedDescription);
        product.UpdatePrice(new Money(request.Product.Price, sanitizedCurrency));
        product.UpdateCategory(request.Product.CategoryId); // Usa o ID original, não sanitizado
        product.UpdateStock(request.Product.StockQuantity);

        // Salvar no repositório
        var updatedProduct = await _productRepository.UpdateAsync(product, cancellationToken);

        // Mapear para DTO e retornar
        return _mapper.Map<ProductDto>(updatedProduct);
    }
}
