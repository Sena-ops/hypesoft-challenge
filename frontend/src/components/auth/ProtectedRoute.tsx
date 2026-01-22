"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useKeycloak } from "@/stores/KeycloakContext";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

/**
 * Componente de proteção de rotas.
 * Verifica se o usuário está autenticado e opcionalmente se possui as roles necessárias.
 */
export function ProtectedRoute({
  children,
  requiredRoles,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, login, hasAnyRole, user } = useKeycloak();
  const router = useRouter();

  // Redireciona para login se não estiver autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      login();
    }
  }, [isLoading, isAuthenticated, login]);

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, não renderiza (vai redirecionar para login)
  if (!isAuthenticated) {
    return fallback || null;
  }

  // Verifica roles se necessário
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRoles = hasAnyRole(requiredRoles);

    if (!hasRequiredRoles) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-destructive/10 p-3">
                  <ShieldAlert className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-xl">Acesso Negado</CardTitle>
              <CardDescription>
                Você não tem permissão para acessar esta página.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Seu usuário ({user?.email}) não possui as permissões necessárias.
                Entre em contato com o administrador do sistema.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => router.back()}>
                  Voltar
                </Button>
                <Button onClick={() => router.push("/dashboard")}>
                  Ir para Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
}
