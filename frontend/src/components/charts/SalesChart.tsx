"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tags, BarChart3 } from "lucide-react";

interface CategoryPoint {
  name: string;
  count: number;
}

interface SalesChartProps {
  data: CategoryPoint[];
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Tags className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base font-semibold">
              Produtos por Categoria
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Distribuição de produtos cadastrados por categoria
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-0">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center h-[300px]">
            <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Nenhuma categoria cadastrada
            </p>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "currentColor", fontSize: 12 }}
                  dy={8}
                  className="text-muted-foreground"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "currentColor", fontSize: 12 }}
                  dx={-8}
                  allowDecimals={false}
                  className="text-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number) => [`${value} produtos`, "Quantidade"]}
                />
                <Bar
                  dataKey="count"
                  radius={[8, 8, 0, 0]}
                  fill="hsl(var(--primary))"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
