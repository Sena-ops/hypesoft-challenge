"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LowStockList } from "@/components/dashboard/LowStockList";
import { SalesChart } from "@/components/charts";
import { Package, DollarSign, AlertTriangle, Tags, RefreshCw } from "lucide-react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalProducts: number;
  totalStockValue: number;
  lowStockCount: number;
  categoryStats: { categoryName: string; productCount: number }[];
  lowStockProducts: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get("/dashboard");
      setStats(response.data);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const categoryData =
    stats?.categoryStats?.map((category) => ({
      name: category.categoryName,
      count: category.productCount,
    })) ?? [];

  const totalCategories = stats?.categoryStats?.length ?? 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral do sistema de gestão de produtos
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {loading && !stats ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
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
