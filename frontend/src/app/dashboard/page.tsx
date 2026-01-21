"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { LowStockList } from "@/components/dashboard/LowStockList";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { LatestTransactions } from "@/components/dashboard/LatestTransactions";
import { CustomersCountries } from "@/components/dashboard/CustomersCountries";
import { Package, DollarSign, AlertTriangle, Filter, Users } from "lucide-react";
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/dashboard");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const categoryData =
    stats?.categoryStats?.map((category) => ({
      name: category.categoryName,
      count: category.productCount,
    })) ?? [];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              May 6 - Jun 6
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Valor total do estoque"
                value={`R$ ${stats?.totalStockValue.toLocaleString("pt-BR") ?? "0"}`}
                icon={DollarSign}
                trend={{ value: 8, label: "from last month" }}
              />
              <StatsCard
                title="Clientes"
                value="1,520"
                icon={Users}
                trend={{ value: 20, label: "from last month" }}
              />
              <StatsCard
                title="Total de produtos"
                value={stats?.totalProducts ?? 0}
                icon={Package}
                trend={{ value: 12, label: "from last month" }}
              />
              <StatsCard
                title="Estoque baixo"
                value={stats?.lowStockCount ?? 0}
                icon={AlertTriangle}
                trend={{ value: -5, label: "from last month" }}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <SalesChart data={categoryData} />
              <TopProducts />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <LatestTransactions />
              <CustomersCountries />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <LowStockList products={stats?.lowStockProducts ?? []} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
