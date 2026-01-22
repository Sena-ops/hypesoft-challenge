using AutoMapper;
using MediatR;
using Nexus.Application.Commands.Products;
using Nexus.Application.Common;
using Nexus.Application.DTOs.Products;
using Nexus.Domain.Repositories;
using Nexus.Domain.ValueObjects;

namespace Nexus.Application.Handlers.Products;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ProductDto>
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMapper _mapper;

    public CreateProductCommandHandler(
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        IMapper mapper)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _mapper = mapper;
    }

    public async Task<ProductDto> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        // Sanitiza inputs de texto para prevenir XSS e injection
        var sanitizedName = InputSanitizer.Sanitize(request.Product.Name);
        var sanitizedDescription = InputSanitizer.Sanitize(request.Product.Description);
        // Currency não precisa ser sanitizado - já é validado pelo FluentValidation como código ISO de 3 letras
        var sanitizedCurrency = request.Product.Currency;

        // Valida se o nome sanitizado não ficou vazio
        if (string.IsNullOrWhiteSpace(sanitizedName))
        {
            throw new ArgumentException("O nome do produto não pode ser vazio após sanitização.", nameof(request.Product.Name));
        }

        // Valida CategoryId (GUID) sem sanitizar - apenas valida formato
        if (string.IsNullOrWhiteSpace(request.Product.CategoryId) || !Guid.TryParse(request.Product.CategoryId, out _))
        {
            throw new ArgumentException("O ID da categoria deve ser um GUID válido.", nameof(request.Product.CategoryId));
        }

        // Validar se a categoria existe
        var categoryExists = await _categoryRepository.ExistsAsync(request.Product.CategoryId, cancellationToken);
        if (!categoryExists)
        {
            throw new ArgumentException($"Categoria com ID '{request.Product.CategoryId}' não encontrada.", nameof(request.Product.CategoryId));
        }

        // Criar produto usando o construtor da entidade com dados sanitizados
        var product = new Nexus.Domain.Entities.Product(
            sanitizedName,
            sanitizedDescription,
            new Money(request.Product.Price, sanitizedCurrency),
            request.Product.CategoryId, // Usa o ID original, não sanitizado
            request.Product.StockQuantity
        );

        // Salvar no repositório
        var createdProduct = await _productRepository.CreateAsync(product, cancellationToken);

        // Mapear para DTO e retornar
        return _mapper.Map<ProductDto>(createdProduct);
    }
}
