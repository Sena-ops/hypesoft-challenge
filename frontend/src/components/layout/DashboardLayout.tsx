"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useKeycloak } from "@/stores/KeycloakContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { RefreshCw } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function DashboardLayout({ children, requiredRoles }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading, hasAnyRole, user } = useKeycloak();
  const router = useRouter();

  // Redireciona para página de login se não autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

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

  // Se não está autenticado, mostra loading enquanto redireciona
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  // Verifica roles se necessário
  if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="rounded-full bg-destructive/10 p-4">
                <RefreshCw className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">Acesso Negado</h2>
              <p className="text-muted-foreground text-center max-w-md">
                Você não tem permissão para acessar esta página.
                Entre em contato com o administrador do sistema.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
