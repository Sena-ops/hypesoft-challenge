"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { ArrowLeft, Save, RefreshCw, Package } from "lucide-react";
import { api } from "@/services/api";
import { Category, Product, UpdateProductDto } from "@/types";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notFound, setNotFound] = useState(false);
  
  const [formData, setFormData] = useState<UpdateProductDto>({
    name: "",
    description: "",
    price: 0,
    currency: "BRL",
    categoryId: "",
    stockQuantity: 0,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get<Product>(`/products/${productId}`);
        const product = response.data;
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          currency: product.currency || "BRL",
          categoryId: product.categoryId,
          stockQuantity: product.stockQuantity,
        });
      } catch (error: any) {
        console.error("Erro ao carregar produto:", error);
        if (error.response?.status === 404) {
          setNotFound(true);
        }
      } finally {
        setLoadingProduct(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await api.get<Category[]>("/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchProduct();
    fetchCategories();
  }, [productId]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Preço deve ser maior que zero";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Categoria é obrigatória";
    }

    if (formData.stockQuantity !== undefined && formData.stockQuantity < 0) {
      newErrors.stockQuantity = "Quantidade não pode ser negativa";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await api.put(`/products/${productId}`, formData);
      router.push("/products");
    } catch (error: any) {
      console.error("Erro ao atualizar produto:", error);
      if (error.response?.data?.error) {
        setErrors({ submit: error.response.data.error });
      } else {
        setErrors({ submit: "Erro ao atualizar produto. Tente novamente." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UpdateProductDto, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  if (loadingProduct) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (notFound) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Produto não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            O produto que você está procurando não existe ou foi removido.
          </p>
          <Link href="/products">
            <Button>Voltar para produtos</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Produto</h1>
            <p className="text-muted-foreground">
              Atualize as informações do produto
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
            <CardDescription>
              Altere os dados abaixo para atualizar o produto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Nome do produto"
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição do produto"
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className={errors.description ? "border-red-500" : ""}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price || ""}
                    onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Quantidade em Estoque *</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.stockQuantity ?? ""}
                    onChange={(e) => handleChange("stockQuantity", parseInt(e.target.value) || 0)}
                    className={errors.stockQuantity ? "border-red-500" : ""}
                  />
                  {errors.stockQuantity && (
                    <p className="text-sm text-red-500">{errors.stockQuantity}</p>
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
                  <Select
                    value={formData.categoryId || ""}
                    onValueChange={(value) => handleChange("categoryId", value)}
                  >
                    <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
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
                {errors.categoryId && (
                  <p className="text-sm text-red-500">{errors.categoryId}</p>
                )}
              </div>

              {errors.submit && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
                  {errors.submit}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Link href="/products">
                  <Button type="button" variant="outline">
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
