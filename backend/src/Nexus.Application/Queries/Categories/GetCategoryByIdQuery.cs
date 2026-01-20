using MediatR;
using Nexus.Application.DTOs.Categories;

namespace Nexus.Application.Queries.Categories;

public class GetCategoryByIdQuery : IRequest<CategoryDto?>
{
    public string Id { get; set; } = string.Empty;
}
