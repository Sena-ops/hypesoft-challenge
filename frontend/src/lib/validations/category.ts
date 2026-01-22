import { z } from "zod"

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(200, "O nome não pode ter mais de 200 caracteres")
    .trim(),
  description: z
    .string()
    .min(1, "A descrição é obrigatória")
    .max(1000, "A descrição não pode ter mais de 1000 caracteres")
    .trim(),
})

export const updateCategorySchema = createCategorySchema

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>
