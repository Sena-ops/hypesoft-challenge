using FluentValidation;
using Nexus.Application.DTOs.Categories;

namespace Nexus.Application.Validators.Categories;

public class CreateCategoryDtoValidator : AbstractValidator<CreateCategoryDto>
{
    public CreateCategoryDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("O nome da categoria é obrigatório.")
            .MaximumLength(100)
            .WithMessage("O nome da categoria não pode ter mais de 100 caracteres.")
            .MinimumLength(2)
            .WithMessage("O nome da categoria deve ter pelo menos 2 caracteres.");

        RuleFor(x => x.Description)
            .MaximumLength(500)
            .WithMessage("A descrição da categoria não pode ter mais de 500 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));
    }
}
