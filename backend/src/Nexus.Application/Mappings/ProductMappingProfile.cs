using AutoMapper;
using Nexus.Application.DTOs.Products;
using Nexus.Domain.Entities;
using Nexus.Domain.ValueObjects;

namespace Nexus.Application.Mappings;

public class ProductMappingProfile : Profile
{
    public ProductMappingProfile()
    {
        // CreateProductDto -> Product
        CreateMap<CreateProductDto, Product>()
            .ConstructUsing(dto => new Product(
                dto.Name,
                dto.Description,
                new Money(dto.Price, dto.Currency),
                dto.CategoryId,
                dto.StockQuantity
            ));

        // UpdateProductDto -> Product (para atualizações, não cria nova instância)
        CreateMap<UpdateProductDto, Product>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
            .AfterMap((src, dest) =>
            {
                dest.UpdateName(src.Name);
                dest.UpdateDescription(src.Description);
                dest.UpdatePrice(new Money(src.Price, src.Currency));
                dest.UpdateCategory(src.CategoryId);
                dest.UpdateStock(src.StockQuantity);
            });

        // Product -> ProductDto
        CreateMap<Product, ProductDto>()
            .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.Price.Amount))
            .ForMember(dest => dest.Currency, opt => opt.MapFrom(src => src.Price.Currency));
    }
}
