"use client";

import { useKeycloak } from "@/stores/KeycloakContext";
import { RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";

interface RoleGuardProps {
  /**
   * Roles necessárias para renderizar o conteúdo
   * O usuário precisa ter pelo menos uma das roles
   */
  roles: string[];
  
  /**
   * Conteúdo a ser renderizado quando autorizado
   */
  children: React.ReactNode;
  
  /**
   * Conteúdo alternativo quando não autorizado
   * Se não especificado, não renderiza nada
   */
  fallback?: React.ReactNode;
  
  /**
   * Se deve mostrar loading enquanto verifica
   * @default false
   */
  showLoading?: boolean;
}

/**
 * Componente para renderização condicional baseada em roles.
 * 
 * @example
 * ```tsx
 * // Mostra apenas para admin
 * <RoleGuard roles={["admin"]}>
 *   <Button>Excluir</Button>
 * </RoleGuard>
 * 
 * // Mostra para admin ou manager, com fallback
 * <RoleGuard 
 *   roles={["admin", "manager"]} 
 *   fallback={<span>Sem permissão</span>}
 * >
 *   <Button>Editar</Button>
 * </RoleGuard>
 * ```
 */
export function RoleGuard({
  roles,
  children,
  fallback = null,
  showLoading = false,
}: RoleGuardProps) {
  const { hasAnyRole, isLoading, isAuthenticated } = useKeycloak();

  // Mostra loading se configurado
  if (isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Se não está autenticado ou não tem as roles, mostra fallback
  if (!isAuthenticated || !hasAnyRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Componente que mostra conteúdo apenas para administradores
 */
export function AdminOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard roles={["admin"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Componente que mostra conteúdo para managers e admins
 */
export function ManagerOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard roles={["admin", "manager"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Componente de alerta para acesso não autorizado
 */
export function UnauthorizedAlert({
  message = "Você não tem permissão para acessar este recurso.",
  compact = false,
}: {
  message?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldAlert className="h-4 w-4" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full bg-destructive/10 p-3">
        <ShieldAlert className="h-8 w-8 text-destructive" />
      </div>
      <div>
        <h3 className="font-semibold text-lg">Acesso Não Autorizado</h3>
        <p className="text-muted-foreground mt-1">{message}</p>
      </div>
    </div>
  );
}

/**
 * Componente que mostra badge de autorização
 */
export function AuthorizedBadge({
  roles,
  showWhenUnauthorized = false,
}: {
  roles: string[];
  showWhenUnauthorized?: boolean;
}) {
  const { hasAnyRole, isAuthenticated } = useKeycloak();

  const isAuthorized = isAuthenticated && hasAnyRole(roles);

  if (!isAuthorized && !showWhenUnauthorized) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-1 text-xs ${
        isAuthorized
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-muted-foreground"
      }`}
    >
      {isAuthorized ? (
        <>
          <ShieldCheck className="h-3 w-3" />
          <span>Autorizado</span>
        </>
      ) : (
        <>
          <ShieldAlert className="h-3 w-3" />
          <span>Não autorizado</span>
        </>
      )}
    </div>
  );
}
