"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { LowStockList } from "@/components/dashboard/LowStockList";
import { Package, DollarSign, AlertTriangle, BarChart3, Filter } from "lucide-react";
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

  // Mock chart data - in a real app this would come from the API
  const chartData = [
    { name: "Sun", value: 4000, value2: 2400 },
    { name: "Mon", value: 3000, value2: 1398 },
    { name: "Tue", value: 2000, value2: 9800 },
    { name: "Wed", value: 2780, value2: 3908 },
    { name: "Thu", value: 1890, value2: 4800 },
    { name: "Fri", value: 2390, value2: 3800 },
    { name: "Sat", value: 3490, value2: 4300 },
  ];

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
                title="Total Sales"
                value={`$${stats?.totalStockValue.toLocaleString() ?? "0"}`}
                icon={DollarSign}
                trend={{ value: 8, label: "from last month" }}
              />
              <StatsCard
                title="Customers"
                value="1,520"
                icon={Package} // Placeholder for Customers
                trend={{ value: 20, label: "from last month" }}
              />
              <StatsCard
                title="Total Products"
                value={stats?.totalProducts ?? 0}
                icon={Package}
                trend={{ value: 12, label: "from last month" }}
              />
              <StatsCard
                title="Low Stock Alert"
                value={stats?.lowStockCount ?? 0}
                icon={AlertTriangle}
                trend={{ value: -5, label: "from last month" }}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <SalesChart data={chartData} />
              <LowStockList products={stats?.lowStockProducts ?? []} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
