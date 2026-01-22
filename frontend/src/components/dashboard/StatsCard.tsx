import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "warning" | "success" | "danger";
  trend?: {
    value: number;
    label: string;
  };
}

export function StatsCard({ title, value, icon: Icon, description, variant = "default", trend }: StatsCardProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    warning: "bg-amber-500/10 text-amber-500",
    success: "bg-emerald-500/10 text-emerald-500",
    danger: "bg-red-500/10 text-red-500",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("rounded-full p-2", variantStyles[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            <span
              className={
                trend.value > 0
                  ? "text-emerald-500 font-medium"
                  : "text-red-500 font-medium"
              }
            >
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>{" "}
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
