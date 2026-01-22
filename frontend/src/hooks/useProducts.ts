import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Product, PagedResult, CreateProductDto, UpdateProductDto } from "@/types";

// Query keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Hook para listar produtos com paginação e filtros
export function useProducts(params?: {
  page?: number;
  pageSize?: number;
  categoryId?: string;
}) {
  return useQuery({
    queryKey: productKeys.list(params || {}),
    queryFn: async () => {
      let url = `/products?page=${params?.page || 1}&pageSize=${params?.pageSize || 10}`;
      if (params?.categoryId && params.categoryId !== "all") {
        url += `&categoryId=${params.categoryId}`;
      }
      const response = await api.get<PagedResult<Product>>(url);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 segundos
  });
}

// Hook para buscar um produto específico
export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get<Product>(`/products/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minuto
  });
}

// Hook para criar produto
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductDto) => {
      const response = await api.post<Product>("/products", data);
      return response.data;
    },
    onSuccess: () => {
      // Invalida a lista de produtos para refetch
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// Hook para atualizar produto
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductDto }) => {
      const response = await api.put<Product>(`/products/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Atualiza o cache do produto específico
      queryClient.setQueryData(productKeys.detail(variables.id), data);
      // Invalida a lista de produtos
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// Hook para deletar produto
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
      return id;
    },
    onSuccess: () => {
      // Invalida a lista de produtos
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// Hook para deletar múltiplos produtos
export function useBulkDeleteProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => api.delete(`/products/${id}`)));
      return ids;
    },
    onSuccess: () => {
      // Invalida a lista de produtos
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// Hook para buscar produtos por nome
export function useSearchProducts(params?: {
  name: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: [...productKeys.lists(), "search", params],
    queryFn: async () => {
      if (!params?.name?.trim()) {
        return { items: [], totalCount: 0, totalPages: 0, page: 1, pageSize: params?.pageSize || 10 } as PagedResult<Product>;
      }
      const url = `/products/search?name=${encodeURIComponent(params.name)}&page=${params?.page || 1}&pageSize=${params?.pageSize || 10}`;
      const response = await api.get<PagedResult<Product>>(url);
      return response.data;
    },
    enabled: !!params?.name?.trim(),
    staleTime: 30 * 1000,
  });
}

// Hook para buscar produtos com estoque baixo
export function useLowStockProducts(threshold: number = 10) {
  return useQuery({
    queryKey: [...productKeys.lists(), "low-stock", threshold],
    queryFn: async () => {
      const response = await api.get<Product[]>(`/products/low-stock?threshold=${threshold}`);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}
