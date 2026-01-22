using AutoMapper;
using MediatR;
using Nexus.Application.Commands.Categories;
using Nexus.Application.Common;
using Nexus.Application.DTOs.Categories;
using Nexus.Application.Interfaces;
using Nexus.Domain.Repositories;

namespace Nexus.Application.Handlers.Categories;

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, CategoryDto>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly ICacheService _cacheService;
    private readonly IMapper _mapper;

    public UpdateCategoryCommandHandler(
        ICategoryRepository categoryRepository, 
        ICacheService cacheService,
        IMapper mapper)
    {
        _categoryRepository = categoryRepository;
        _cacheService = cacheService;
        _mapper = mapper;
    }

    public async Task<CategoryDto> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _categoryRepository.GetByIdAsync(request.Id, cancellationToken);

        if (category == null)
            throw new KeyNotFoundException($"Categoria com ID '{request.Id}' não encontrada.");

        // Sanitiza inputs para prevenir XSS e injection
        var sanitizedName = InputSanitizer.Sanitize(request.Category.Name);
        var sanitizedDescription = InputSanitizer.Sanitize(request.Category.Description);

        // Atualizar usando métodos de domínio com dados sanitizados
        category.UpdateName(sanitizedName);
        category.UpdateDescription(sanitizedDescription);

        // Salvar
        var updatedCategory = await _categoryRepository.UpdateAsync(category, cancellationToken);

        // Invalidar cache
        await _cacheService.RemoveByPrefixAsync(CacheKeys.CategoriesPrefix, cancellationToken);
        await _cacheService.RemoveByPrefixAsync(CacheKeys.DashboardPrefix, cancellationToken);

        return _mapper.Map<CategoryDto>(updatedCategory);
    }
}
