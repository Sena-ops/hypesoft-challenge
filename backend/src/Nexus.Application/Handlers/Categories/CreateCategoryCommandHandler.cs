using AutoMapper;
using MediatR;
using Nexus.Application.Commands.Categories;
using Nexus.Application.DTOs.Categories;
using Nexus.Domain.Entities;
using Nexus.Domain.Repositories;

namespace Nexus.Application.Handlers.Categories;

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, CategoryDto>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMapper _mapper;

    public CreateCategoryCommandHandler(ICategoryRepository categoryRepository, IMapper mapper)
    {
        _categoryRepository = categoryRepository;
        _mapper = mapper;
    }

    public async Task<CategoryDto> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        // Criar entidade
        var category = new Category(request.Category.Name, request.Category.Description);

        // Salvar
        var createdCategory = await _categoryRepository.CreateAsync(category, cancellationToken);

        // Retornar DTO
        return _mapper.Map<CategoryDto>(createdCategory);
    }
}
