import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

interface User {
  userId: string; // Backend retorna UserId (com U maiúsculo)
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  enabled?: boolean;
}

interface UpdateUserRolesDto {
  roles: string[];
}

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: () => [...userKeys.lists()] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  me: () => [...userKeys.all, "me"] as const,
};

// Hook para listar todos os usuários
export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: async () => {
      const response = await api.get<User[]>("/users");
      return response.data;
    },
    staleTime: 60 * 1000, // 1 minuto
  });
}

// Hook para atualizar roles de um usuário
export function useUpdateUserRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roles }: { userId: string; roles: string[] }) => {
      const response = await api.put(`/users/${userId}/roles`, { roles });
      return response.data;
    },
    onSuccess: () => {
      // Invalida a lista de usuários
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

// Hook para buscar informações do usuário atual (debug)
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: async () => {
      const response = await api.get("/debug/me");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
