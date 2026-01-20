using MediatR;

namespace Nexus.Application.Commands.Categories;

public class DeleteCategoryCommand : IRequest
{
    public string Id { get; set; } = string.Empty;
}
