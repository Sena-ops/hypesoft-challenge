"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Save, RefreshCw, Tags } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { updateCategorySchema, type UpdateCategoryFormData } from "@/lib/validations/category";
import Link from "next/link";
import { useCategory, useUpdateCategory } from "@/hooks";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const { toast } = useToast();
  
  // React Query hooks
  const { data: category, isLoading: loadingCategory, isError: categoryError } = useCategory(categoryId);
  const updateCategoryMutation = useUpdateCategory();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCategoryFormData>({
    resolver: zodResolver(updateCategorySchema),
    mode: "onChange", // Validação em tempo real
  });

  // Atualizar formulário quando categoria for carregada
  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description,
      });
    }
  }, [category, reset]);

  // Mostrar erro se categoria não encontrada
  useEffect(() => {
    if (categoryError) {
      toast({
        variant: "error",
        title: "Categoria não encontrada",
        description: "A categoria que você está procurando não existe ou foi removida.",
      });
    }
  }, [categoryError, toast]);

  const onSubmit = async (data: UpdateCategoryFormData) => {
    try {
      await updateCategoryMutation.mutateAsync({ id: categoryId, data });
      toast({
        variant: "success",
        title: "Categoria atualizada!",
        description: "A categoria foi atualizada com sucesso.",
      });
      router.push("/categories");
    } catch (error: any) {
      console.error("Erro ao atualizar categoria:", error);
      toast({
        variant: "error",
        title: "Erro ao atualizar categoria",
        description: error.response?.data?.error || "Ocorreu um erro ao atualizar a categoria. Tente novamente.",
      });
    }
  };

  if (loadingCategory) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (categoryError || !category) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Tags className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Categoria não encontrada</h2>
          <p className="text-muted-foreground mb-4">
            A categoria que você está procurando não existe ou foi removida.
          </p>
          <Link href="/categories">
            <Button>Voltar para categorias</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

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
            <h1 className="text-2xl font-bold tracking-tight">Editar Categoria</h1>
            <p className="text-muted-foreground">
              Atualize as informações da categoria
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Categoria</CardTitle>
            <CardDescription>
              Altere os dados abaixo para atualizar a categoria
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
                <Button 
                  type="submit" 
                  disabled={isSubmitting || updateCategoryMutation.isPending} 
                  className="gap-2"
                >
                  {isSubmitting || updateCategoryMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSubmitting || updateCategoryMutation.isPending ? "Salvando..." : "Salvar Alterações"}
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
