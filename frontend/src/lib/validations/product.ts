import { z } from "zod"

export const createProductSchema = z.object({
  name: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(200, "O nome não pode ter mais de 200 caracteres")
    .trim(),
  description: z
    .string()
    .max(1000, "A descrição não pode ter mais de 1000 caracteres")
    .trim()
    .default(""),
  price: z
    .number({
      required_error: "O preço é obrigatório",
      invalid_type_error: "O preço deve ser um número",
    })
    .positive("O preço deve ser maior que zero")
    .min(0.01, "O preço deve ser maior que zero"),
  currency: z
    .string()
    .length(3, "A moeda deve ter 3 caracteres")
    .regex(/^[A-Z]{3}$/, "A moeda deve estar em formato ISO (ex: BRL, USD, EUR)")
    .default("BRL"),
  categoryId: z
    .string()
    .min(1, "A categoria é obrigatória")
    .uuid("O ID da categoria deve ser um GUID válido"),
  stockQuantity: z
    .number({
      required_error: "A quantidade em estoque é obrigatória",
      invalid_type_error: "A quantidade deve ser um número",
    })
    .int("A quantidade deve ser um número inteiro")
    .min(0, "A quantidade não pode ser negativa"),
})

export const updateProductSchema = createProductSchema

export type CreateProductFormData = z.infer<typeof createProductSchema>
export type UpdateProductFormData = z.infer<typeof updateProductSchema>
