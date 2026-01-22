import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Category, CreateCategoryDto, UpdateCategoryDto } from "@/types";

// Query keys
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: () => [...categoryKeys.lists()] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// Hook para listar todas as categorias
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: async () => {
      const response = await api.get<Category[]>("/categories");
      return response.data;
    },
    staleTime: 60 * 1000, // 1 minuto
  });
}

// Hook para buscar uma categoria específica
export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: categoryKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get<Category>(`/categories/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minuto
  });
}

// Hook para criar categoria
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryDto) => {
      const response = await api.post<Category>("/categories", data);
      return response.data;
    },
    onSuccess: () => {
      // Invalida a lista de categorias
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

// Hook para atualizar categoria
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCategoryDto }) => {
      const response = await api.put<Category>(`/categories/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Atualiza o cache da categoria específica
      queryClient.setQueryData(categoryKeys.detail(variables.id), data);
      // Invalida a lista de categorias
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

// Hook para deletar categoria
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
      return id;
    },
    onSuccess: () => {
      // Invalida a lista de categorias e produtos (pois produtos dependem de categorias)
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
