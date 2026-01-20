using AutoMapper;
using MediatR;
using Nexus.Application.Commands.Products;
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
        // Validar se a categoria existe
        var categoryExists = await _categoryRepository.ExistsAsync(request.Product.CategoryId, cancellationToken);
        if (!categoryExists)
        {
            throw new ArgumentException($"Categoria com ID '{request.Product.CategoryId}' não encontrada.", nameof(request.Product.CategoryId));
        }

        // Criar produto usando o construtor da entidade
        var product = new Nexus.Domain.Entities.Product(
            request.Product.Name,
            request.Product.Description,
            new Money(request.Product.Price, request.Product.Currency),
            request.Product.CategoryId,
            request.Product.StockQuantity
        );

        // Salvar no repositório
        var createdProduct = await _productRepository.CreateAsync(product, cancellationToken);

        // Mapear para DTO e retornar
        return _mapper.Map<ProductDto>(createdProduct);
    }
}
