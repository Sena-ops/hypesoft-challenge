using FluentValidation;
using Nexus.Application.DTOs.Products;

namespace Nexus.Application.Validators.Products;

public class CreateProductDtoValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("O nome do produto é obrigatório.")
            .MaximumLength(200)
            .WithMessage("O nome do produto não pode ter mais de 200 caracteres.")
            .MinimumLength(2)
            .WithMessage("O nome do produto deve ter pelo menos 2 caracteres.");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("A descrição do produto não pode ter mais de 1000 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        RuleFor(x => x.Price)
            .GreaterThan(0)
            .WithMessage("O preço do produto deve ser maior que zero.");

        RuleFor(x => x.Currency)
            .NotEmpty()
            .WithMessage("A moeda é obrigatória.")
            .Length(3)
            .WithMessage("A moeda deve ter 3 caracteres (ex: BRL, USD, EUR).")
            .Matches(@"^[A-Z]{3}$")
            .WithMessage("A moeda deve estar em formato ISO (ex: BRL, USD, EUR).");

        RuleFor(x => x.CategoryId)
            .NotEmpty()
            .WithMessage("A categoria é obrigatória.")
            .Must(BeValidGuid)
            .WithMessage("O ID da categoria deve ser um GUID válido.");

        RuleFor(x => x.StockQuantity)
            .GreaterThanOrEqualTo(0)
            .WithMessage("A quantidade em estoque não pode ser negativa.");
    }

    private static bool BeValidGuid(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return false;

        return Guid.TryParse(value, out _);
    }
}
