using MediatR;
using Nexus.Application.Behaviors;
using Nexus.Application.Common;
using Nexus.Application.DTOs.Categories;

namespace Nexus.Application.Queries.Categories;

public class GetAllCategoriesQuery : ICacheableQuery<IEnumerable<CategoryDto>>
{
    public string CacheKey => CacheKeys.AllCategories;
    public TimeSpan? CacheExpiration => TimeSpan.FromMinutes(10); // Categorias mudam pouco
}
