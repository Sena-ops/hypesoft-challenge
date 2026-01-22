"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createProductSchema, type CreateProductFormData } from "@/lib/validations/product";
import Link from "next/link";
import { useKeycloak } from "@/stores/KeycloakContext";
import { useCategories, useCreateProduct } from "@/hooks";

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: keycloakLoading } = useKeycloak();
  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const createProductMutation = useCreateProduct();
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    mode: "onChange", // Validação em tempo real
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      currency: "BRL",
      categoryId: "",
      stockQuantity: 0,
    },
  });

  const onSubmit = async (data: CreateProductFormData) => {
    try {
      await createProductMutation.mutateAsync(data);
      toast({
        variant: "success",
        title: "Produto criado!",
        description: "O produto foi criado com sucesso.",
      });
      router.push("/products");
    } catch (error: any) {
      console.error("Erro ao criar produto:", error);
      toast({
        variant: "error",
        title: "Erro ao criar produto",
        description: error.response?.data?.error || "Ocorreu um erro ao criar o produto. Tente novamente.",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Novo Produto</h1>
            <p className="text-muted-foreground">
              Cadastre um novo produto no sistema
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para cadastrar um novo produto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Nome do produto"
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
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição do produto"
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register("price", { valueAsNumber: true })}
                    className={errors.price ? "border-red-500 focus-visible:ring-red-500" : ""}
                    aria-invalid={errors.price ? "true" : "false"}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500" role="alert">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Quantidade em Estoque *</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register("stockQuantity", { valueAsNumber: true })}
                    className={errors.stockQuantity ? "border-red-500 focus-visible:ring-red-500" : ""}
                    aria-invalid={errors.stockQuantity ? "true" : "false"}
                  />
                  {errors.stockQuantity && (
                    <p className="text-sm text-red-500" role="alert">
                      {errors.stockQuantity.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoria *</Label>
                {loadingCategories ? (
                  <div className="flex items-center gap-2 h-10 text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Carregando categorias...
                  </div>
                ) : categories.length === 0 ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                      Nenhuma categoria cadastrada.
                    </p>
                    <Link href="/categories/new">
                      <Button type="button" variant="outline" size="sm">
                        Criar categoria
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className={errors.categoryId ? "border-red-500 focus-visible:ring-red-500" : ""}
                          aria-invalid={errors.categoryId ? "true" : "false"}
                        >
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {errors.categoryId && (
                  <p className="text-sm text-red-500" role="alert">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || createProductMutation.isPending} 
                  className="gap-2"
                >
                  {isSubmitting || createProductMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSubmitting || createProductMutation.isPending ? "Salvando..." : "Criar Produto"}
                </Button>
                <Link href="/products" className="w-full sm:w-auto">
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
