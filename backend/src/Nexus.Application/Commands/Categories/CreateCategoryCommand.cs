using MediatR;
using Nexus.Application.DTOs.Categories;

namespace Nexus.Application.Commands.Categories;

public class CreateCategoryCommand : IRequest<CategoryDto>
{
    public CreateCategoryDto Category { get; set; } = null!;
}
