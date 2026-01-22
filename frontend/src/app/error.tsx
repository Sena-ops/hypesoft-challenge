"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log do erro para debug
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 bg-gray-50 dark:bg-gray-900">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">Algo deu errado</h2>
          <p className="text-muted-foreground text-center max-w-md">
            {error.message || "Ocorreu um erro inesperado. Por favor, tente novamente."}
          </p>
          <div className="flex gap-2">
            <Button onClick={reset} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
            <Button onClick={() => router.push("/")} variant="default" className="gap-2">
              <Home className="h-4 w-4" />
              Ir para início
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
