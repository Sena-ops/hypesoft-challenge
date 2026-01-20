using MediatR;
using Nexus.Application.Commands.Products;
using Nexus.Domain.Repositories;

namespace Nexus.Application.Handlers.Products;

public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand>
{
    private readonly IProductRepository _productRepository;

    public DeleteProductCommandHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (product == null)
        {
            throw new KeyNotFoundException($"Produto com ID '{request.Id}' não encontrado.");
        }

        await _productRepository.DeleteAsync(request.Id, cancellationToken);
    }
}
