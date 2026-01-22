"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LowStockList } from "@/components/dashboard/LowStockList";
import { SalesChart } from "@/components/charts";
import { Package, DollarSign, AlertTriangle, Tags, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKeycloak } from "@/stores/KeycloakContext";
import { useDashboardStats } from "@/hooks";

export default function DashboardPage() {
  const { isAuthenticated, isLoading: keycloakLoading } = useKeycloak();
  // Só busca dados quando estiver autenticado
  const { data: stats, isLoading, refetch, isError, error } = useDashboardStats(
    !keycloakLoading && isAuthenticated
  );

  const categoryData =
    stats?.categoryStats?.map((category) => ({
      name: category.categoryName,
      count: category.productCount,
    })) ?? [];

  const totalCategories = stats?.categoryStats?.length ?? 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral do sistema de gestão de produtos
            </p>
          </div>
          <Button 
            variant="outline" 
            className="gap-2 w-full sm:w-auto" 
            onClick={() => refetch()} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {(isLoading || keycloakLoading) && !stats ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-semibold">Erro ao carregar dados</h2>
            <p className="text-muted-foreground text-center max-w-md">
              {error instanceof Error ? error.message : "Não foi possível carregar as estatísticas do dashboard."}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Tentar novamente
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total de Produtos"
                value={stats?.totalProducts ?? 0}
                icon={Package}
                description="Produtos cadastrados no sistema"
              />
              <StatsCard
                title="Valor Total do Estoque"
                value={`R$ ${stats?.totalStockValue?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) ?? "0,00"}`}
                icon={DollarSign}
                description="Valor total em estoque"
              />
              <StatsCard
                title="Total de Categorias"
                value={totalCategories}
                icon={Tags}
                description="Categorias cadastradas"
              />
              <StatsCard
                title="Estoque Baixo"
                value={stats?.lowStockCount ?? 0}
                icon={AlertTriangle}
                description="Produtos com menos de 10 unidades"
                variant={stats?.lowStockCount && stats.lowStockCount > 0 ? "warning" : "default"}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <SalesChart data={categoryData} />
              <LowStockList products={stats?.lowStockProducts ?? []} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
