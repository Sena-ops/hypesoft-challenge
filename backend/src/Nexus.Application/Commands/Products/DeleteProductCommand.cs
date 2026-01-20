using MediatR;

namespace Nexus.Application.Commands.Products;

public class DeleteProductCommand : IRequest
{
    public string Id { get; set; } = string.Empty;
}
