"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Save, RefreshCw } from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { createCategorySchema, type CreateCategoryFormData } from "@/lib/validations/category";
import Link from "next/link";

export default function NewCategoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    mode: "onChange", // Validação em tempo real
  });

  const onSubmit = async (data: CreateCategoryFormData) => {
    try {
      await api.post("/categories", data);
      toast({
        variant: "success",
        title: "Categoria criada!",
        description: "A categoria foi criada com sucesso.",
      });
      router.push("/categories");
    } catch (error: any) {
      console.error("Erro ao criar categoria:", error);
      toast({
        variant: "error",
        title: "Erro ao criar categoria",
        description: error.response?.data?.error || "Ocorreu um erro ao criar a categoria. Tente novamente.",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/categories">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nova Categoria</h1>
            <p className="text-muted-foreground">
              Cadastre uma nova categoria de produtos
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Categoria</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para cadastrar uma nova categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Nome da categoria"
                  {...register("name")}
                  className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                  aria-invalid={errors.name ? "true" : "false"}
                />
                {errors.name && (
                  <p className="text-sm text-red-500" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição da categoria"
                  rows={4}
                  {...register("description")}
                  className={errors.description ? "border-red-500 focus-visible:ring-red-500" : ""}
                  aria-invalid={errors.description ? "true" : "false"}
                />
                {errors.description && (
                  <p className="text-sm text-red-500" role="alert">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSubmitting ? "Salvando..." : "Salvar Categoria"}
                </Button>
                <Link href="/categories" className="w-full sm:w-auto">
                  <Button type="button" variant="outline" className="w-full sm:w-auto">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
