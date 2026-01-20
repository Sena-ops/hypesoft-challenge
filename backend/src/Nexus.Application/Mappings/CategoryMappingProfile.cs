using AutoMapper;
using Nexus.Application.DTOs.Categories;
using Nexus.Domain.Entities;

namespace Nexus.Application.Mappings;

public class CategoryMappingProfile : Profile
{
    public CategoryMappingProfile()
    {
        // CreateCategoryDto -> Category
        CreateMap<CreateCategoryDto, Category>()
            .ConstructUsing(dto => new Category(dto.Name, dto.Description));

        // UpdateCategoryDto -> Category
        CreateMap<UpdateCategoryDto, Category>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
            .AfterMap((src, dest) =>
            {
                dest.UpdateName(src.Name);
                dest.UpdateDescription(src.Description);
            });

        // Category -> CategoryDto
        CreateMap<Category, CategoryDto>();
    }
}
