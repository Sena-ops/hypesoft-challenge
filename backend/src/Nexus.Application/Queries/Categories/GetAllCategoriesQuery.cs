using MediatR;
using Nexus.Application.DTOs.Categories;

namespace Nexus.Application.Queries.Categories;

public class GetAllCategoriesQuery : IRequest<IEnumerable<CategoryDto>>
{
}
