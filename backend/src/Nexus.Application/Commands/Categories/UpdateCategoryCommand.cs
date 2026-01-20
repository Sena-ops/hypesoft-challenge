using MediatR;
using Nexus.Application.DTOs.Categories;

namespace Nexus.Application.Commands.Categories;

public class UpdateCategoryCommand : IRequest<CategoryDto>
{
    public string Id { get; set; } = string.Empty;
    public UpdateCategoryDto Category { get; set; } = null!;
}
