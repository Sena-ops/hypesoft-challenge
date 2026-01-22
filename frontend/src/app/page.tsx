"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useKeycloak } from "@/stores/KeycloakContext";
import { RefreshCw } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useKeycloak();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}
