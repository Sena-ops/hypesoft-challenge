using AutoMapper;
using MediatR;
using Nexus.Application.DTOs.Dashboard;
using Nexus.Application.DTOs.Products;
using Nexus.Application.Queries.Dashboard;
using Nexus.Domain.Repositories;

namespace Nexus.Application.Handlers.Dashboard;

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMapper _mapper;

    public GetDashboardStatsQueryHandler(
        IProductRepository productRepository, 
        ICategoryRepository categoryRepository,
        IMapper mapper)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _mapper = mapper;
    }

    public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        // Execute independent tasks in parallel
        var totalProductsTask = _productRepository.CountAsync(cancellationToken);
        var totalStockValueTask = _productRepository.GetTotalStockValueAsync(cancellationToken);
        var lowStockProductsTask = _productRepository.GetLowStockProductsAsync(10, cancellationToken);
        var allProductsTask = _productRepository.GetAllAsync(cancellationToken);
        var allCategoriesTask = _categoryRepository.GetAllAsync(cancellationToken);

        await Task.WhenAll(totalProductsTask, totalStockValueTask, lowStockProductsTask, allProductsTask, allCategoriesTask);

        var totalProducts = await totalProductsTask;
        var totalStockValue = await totalStockValueTask;
        var lowStockProducts = await lowStockProductsTask;
        var allProducts = await allProductsTask;
        var allCategories = await allCategoriesTask;

        var categoryStats = allCategories.Select(c => new CategoryStatsDto
        {
            CategoryName = c.Name,
            ProductCount = allProducts.Count(p => p.CategoryId == c.Id)
        }).ToList();

        return new DashboardStatsDto
        {
            TotalProducts = totalProducts,
            TotalStockValue = totalStockValue,
            LowStockCount = lowStockProducts.Count(),
            CategoryStats = categoryStats,
            LowStockProducts = _mapper.Map<List<ProductDto>>(lowStockProducts)
        };
    }
}
