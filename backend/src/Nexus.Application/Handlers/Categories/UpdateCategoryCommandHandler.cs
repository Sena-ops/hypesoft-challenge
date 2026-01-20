using AutoMapper;
using MediatR;
using Nexus.Application.Commands.Categories;
using Nexus.Application.DTOs.Categories;
using Nexus.Domain.Repositories;

namespace Nexus.Application.Handlers.Categories;

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, CategoryDto>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMapper _mapper;

    public UpdateCategoryCommandHandler(ICategoryRepository categoryRepository, IMapper mapper)
    {
        _categoryRepository = categoryRepository;
        _mapper = mapper;
    }

    public async Task<CategoryDto> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _categoryRepository.GetByIdAsync(request.Id, cancellationToken);

        if (category == null)
            throw new KeyNotFoundException($"Categoria com ID '{request.Id}' não encontrada.");

        // Atualizar usando métodos de domínio
        category.UpdateName(request.Category.Name);
        category.UpdateDescription(request.Category.Description);

        // Salvar
        var updatedCategory = await _categoryRepository.UpdateAsync(category, cancellationToken);

        return _mapper.Map<CategoryDto>(updatedCategory);
    }
}
