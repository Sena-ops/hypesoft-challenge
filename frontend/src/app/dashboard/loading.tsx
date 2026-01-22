"use client";

import { RefreshCw } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando dashboard...</p>
      </div>
    </div>
  );
}
