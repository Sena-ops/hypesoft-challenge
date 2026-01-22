"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useKeycloak } from "@/stores/KeycloakContext";

interface UseRequireAuthOptions {
  /**
   * Roles necessárias para acessar a página
   * Se não especificado, apenas verifica se está autenticado
   */
  requiredRoles?: string[];
  
  /**
   * Rota para redirecionar se não autenticado
   * @default "/auth/login"
   */
  redirectTo?: string;
  
  /**
   * Rota para redirecionar se não tiver as roles necessárias
   * @default "/dashboard"
   */
  unauthorizedRedirectTo?: string;
  
  /**
   * Se deve redirecionar automaticamente para login quando não autenticado
   * Se false, apenas retorna o estado sem redirecionar
   * @default true
   */
  autoRedirect?: boolean;
}

interface UseRequireAuthReturn {
  /**
   * Se o usuário está autenticado
   */
  isAuthenticated: boolean;
  
  /**
   * Se está carregando o estado de autenticação
   */
  isLoading: boolean;
  
  /**
   * Se o usuário tem as roles necessárias
   */
  hasRequiredRoles: boolean;
  
  /**
   * Se a verificação de autenticação foi concluída e está tudo OK
   */
  isReady: boolean;
  
  /**
   * Dados do usuário autenticado
   */
  user: ReturnType<typeof useKeycloak>["user"];
}

/**
 * Hook para verificar autenticação e autorização em páginas protegidas.
 * 
 * @example
 * ```tsx
 * // Apenas verifica autenticação
 * const { isReady, user } = useRequireAuth();
 * 
 * // Verifica autenticação e roles
 * const { isReady, hasRequiredRoles } = useRequireAuth({
 *   requiredRoles: ["admin", "manager"]
 * });
 * 
 * // Sem redirecionamento automático
 * const { isAuthenticated, isLoading } = useRequireAuth({
 *   autoRedirect: false
 * });
 * ```
 */
export function useRequireAuth(
  options: UseRequireAuthOptions = {}
): UseRequireAuthReturn {
  const {
    requiredRoles = [],
    redirectTo = "/auth/login",
    unauthorizedRedirectTo = "/dashboard",
    autoRedirect = true,
  } = options;

  const { isAuthenticated, isLoading, hasAnyRole, user, login } = useKeycloak();
  const router = useRouter();

  // Verifica se tem as roles necessárias
  const hasRequiredRoles =
    requiredRoles.length === 0 || hasAnyRole(requiredRoles);

  // Verifica se está pronto (autenticado e com roles)
  const isReady = !isLoading && isAuthenticated && hasRequiredRoles;

  useEffect(() => {
    if (isLoading || !autoRedirect) return;

    // Se não está autenticado, redireciona para login
    if (!isAuthenticated) {
      login();
      return;
    }

    // Se está autenticado mas não tem as roles necessárias
    if (requiredRoles.length > 0 && !hasRequiredRoles) {
      router.push(unauthorizedRedirectTo);
    }
  }, [
    isLoading,
    isAuthenticated,
    hasRequiredRoles,
    autoRedirect,
    requiredRoles.length,
    login,
    router,
    unauthorizedRedirectTo,
  ]);

  return {
    isAuthenticated,
    isLoading,
    hasRequiredRoles,
    isReady,
    user,
  };
}

/**
 * Hook para verificar se o usuário tem uma role específica
 * 
 * @example
 * ```tsx
 * const canDelete = useHasRole("admin");
 * const canEdit = useHasRole(["admin", "manager"]);
 * ```
 */
export function useHasRole(roles: string | string[]): boolean {
  const { hasAnyRole, hasRole, isAuthenticated } = useKeycloak();

  if (!isAuthenticated) return false;

  if (Array.isArray(roles)) {
    return hasAnyRole(roles);
  }

  return hasRole(roles);
}

/**
 * Hook para verificar permissões específicas baseadas em roles
 * 
 * @example
 * ```tsx
 * const permissions = usePermissions();
 * 
 * if (permissions.canCreate) {
 *   // mostrar botão de criar
 * }
 * ```
 */
export function usePermissions() {
  const { hasRole, hasAnyRole, isAuthenticated } = useKeycloak();

  if (!isAuthenticated) {
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      isAdmin: false,
      isManager: false,
    };
  }

  const isAdmin = hasRole("admin");
  const isEditor = hasAnyRole(["admin", "editor", "manager"]);
  const isLeitor = hasAnyRole(["admin", "editor", "leitor", "manager", "user"]);

  return {
    /**
     * Pode visualizar recursos (qualquer usuário autenticado - leitor, editor ou admin)
     */
    canView: isLeitor,
    
    /**
     * Pode criar recursos (editor ou admin)
     */
    canCreate: isEditor,
    
    /**
     * Pode editar recursos (editor ou admin)
     */
    canEdit: isEditor,
    
    /**
     * Pode excluir recursos (apenas admin)
     */
    canDelete: isAdmin,
    
    /**
     * É administrador
     */
    isAdmin,
    
    /**
     * É editor, manager ou admin
     */
    isManager: isEditor,
  };
}
