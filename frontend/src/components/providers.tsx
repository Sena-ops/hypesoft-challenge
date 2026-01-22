"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { KeycloakProvider } from "@/stores/KeycloakContext";
import { ToastProvider } from "@/components/ui/toast";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
            retry: 1,
            refetchOnWindowFocus: false, // Evita refetch automático ao focar na janela
          },
          mutations: {
            retry: 0, // Não tenta novamente mutações que falharam
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <KeycloakProvider>
          <ToastProvider>{children}</ToastProvider>
        </KeycloakProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
