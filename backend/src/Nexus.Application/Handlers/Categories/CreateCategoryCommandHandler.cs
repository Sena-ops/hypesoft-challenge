using AutoMapper;
using MediatR;
using Nexus.Application.Commands.Categories;
using Nexus.Application.Common;
using Nexus.Application.DTOs.Categories;
using Nexus.Application.Interfaces;
using Nexus.Domain.Entities;
using Nexus.Domain.Repositories;

namespace Nexus.Application.Handlers.Categories;

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, CategoryDto>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly ICacheService _cacheService;
    private readonly IMapper _mapper;

    public CreateCategoryCommandHandler(
        ICategoryRepository categoryRepository, 
        ICacheService cacheService,
        IMapper mapper)
    {
        _categoryRepository = categoryRepository;
        _cacheService = cacheService;
        _mapper = mapper;
    }

    public async Task<CategoryDto> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        // Sanitiza inputs para prevenir XSS e injection
        var sanitizedName = InputSanitizer.Sanitize(request.Category.Name);
        var sanitizedDescription = InputSanitizer.Sanitize(request.Category.Description);

        // Valida se o nome sanitizado não ficou vazio
        if (string.IsNullOrWhiteSpace(sanitizedName))
        {
            throw new ArgumentException("O nome da categoria não pode ser vazio após sanitização.", nameof(request.Category.Name));
        }

        // Criar entidade com dados sanitizados
        var category = new Category(sanitizedName, sanitizedDescription);

        // Salvar
        var createdCategory = await _categoryRepository.CreateAsync(category, cancellationToken);

        // Invalidar cache de categorias e dashboard
        await _cacheService.RemoveByPrefixAsync(CacheKeys.CategoriesPrefix, cancellationToken);
        await _cacheService.RemoveByPrefixAsync(CacheKeys.DashboardPrefix, cancellationToken);

        // Retornar DTO
        return _mapper.Map<CategoryDto>(createdCategory);
    }
}
