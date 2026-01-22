"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useKeycloak } from "@/stores/KeycloakContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { LogIn, UserPlus, Shield } from "lucide-react";

export default function LoginPage() {
  const { login, register, isAuthenticated, isLoading } = useKeycloak();
  const router = useRouter();

  // Redireciona para dashboard se já estiver autenticado
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="flex flex-col items-center gap-4">
          <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se já está autenticado, não renderiza (vai redirecionar)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Bem-vindo ao Nexus
          </CardTitle>
          <CardDescription className="text-center">
            Sistema de Gestão de Produtos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Faça login com sua conta para acessar o sistema de gestão de produtos.
          </p>
          
          <Button 
            className="w-full gap-2" 
            size="lg"
            onClick={login}
          >
            <LogIn className="h-4 w-4" />
            Entrar com Keycloak
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                ou
              </span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full gap-2"
            size="lg"
            onClick={register}
          >
            <UserPlus className="h-4 w-4" />
            Criar nova conta
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center">
          <p className="text-xs text-muted-foreground">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
