import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

interface DashboardStats {
  totalProducts: number;
  totalStockValue: number;
  lowStockCount: number;
  categoryStats: { categoryName: string; productCount: number }[];
  lowStockProducts: any[];
}

// Query keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
};

// Hook para buscar estatísticas do dashboard
export function useDashboardStats(enabled: boolean = true) {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      try {
        const response = await api.get<DashboardStats>("/dashboard");
        return response.data;
      } catch (error: any) {
        // Re-throw com mensagem mais clara
        if (error.response?.status === 401) {
          throw new Error("Sessão expirada. Por favor, faça login novamente.");
        }
        if (error.response?.status === 403) {
          throw new Error("Você não tem permissão para acessar esta página.");
        }
        throw error;
      }
    },
    enabled,
    staleTime: 30 * 1000, // 30 segundos
    retry: (failureCount, error: any) => {
      // Não tenta novamente se for erro de autenticação/autorização
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
