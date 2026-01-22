using MediatR;
using Nexus.Application.Commands.Categories;
using Nexus.Application.Common;
using Nexus.Application.Interfaces;
using Nexus.Domain.Repositories;

namespace Nexus.Application.Handlers.Categories;

public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IProductRepository _productRepository;
    private readonly ICacheService _cacheService;

    public DeleteCategoryCommandHandler(
        ICategoryRepository categoryRepository,
        IProductRepository productRepository,
        ICacheService cacheService)
    {
        _categoryRepository = categoryRepository;
        _productRepository = productRepository;
        _cacheService = cacheService;
    }

    public async Task Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        // Verificar se categoria existe
        var exists = await _categoryRepository.ExistsAsync(request.Id, cancellationToken);
        if (!exists)
            throw new KeyNotFoundException($"Categoria com ID '{request.Id}' não encontrada.");

        // Validar se há produtos associados
        var products = await _productRepository.GetByCategoryIdAsync(request.Id, cancellationToken);
        if (products.Any())
        {
            throw new InvalidOperationException($"Não é possível excluir a categoria pois existem {products.Count()} produtos associados a ela.");
        }

        // Excluir (Soft Delete)
        await _categoryRepository.DeleteAsync(request.Id, cancellationToken);

        // Invalidar cache
        await _cacheService.RemoveByPrefixAsync(CacheKeys.CategoriesPrefix, cancellationToken);
        await _cacheService.RemoveByPrefixAsync(CacheKeys.DashboardPrefix, cancellationToken);
    }
}
