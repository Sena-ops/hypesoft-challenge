"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ManagerOnly, AdminOnly } from "@/components/auth";
import { 
  Plus, Search, Pencil, Trash2, Package, RefreshCw, ChevronLeft, ChevronRight,
  Download, Filter, X, AlertTriangle
} from "lucide-react";
import { Product, Category } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  usePermissions, 
  useProducts, 
  useCategories, 
  useDeleteProduct, 
  useBulkDeleteProducts,
  useSearchProducts,
  useLowStockProducts
} from "@/hooks";
import { useKeycloak } from "@/stores/KeycloakContext";
import { useToast } from "@/components/ui/use-toast";

export default function ProductsPage() {
  const router = useRouter();
  const permissions = usePermissions();
  const { isAuthenticated, isLoading: keycloakLoading } = useKeycloak();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // React Query hooks
  const { data: productsData, isLoading: loadingProducts, refetch: refetchProducts } = useProducts({
    page,
    pageSize,
    categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
  });

  const { data: categories = [], refetch: refetchCategories } = useCategories();
  const { data: lowStockProducts = [], refetch: refetchLowStock } = useLowStockProducts(10);
  
  // Desabilitar busca quando não há termo
  const shouldUseSearch = searchTerm.trim().length > 0;
  
  const { data: searchData, isLoading: loadingSearch, refetch: refetchSearch } = useSearchProducts(
    shouldUseSearch ? { name: searchTerm, page, pageSize } : undefined
  );

  // Função para atualizar todos os dados
  const handleRefresh = () => {
    refetchProducts();
    refetchCategories();
    refetchLowStock();
    if (shouldUseSearch) {
      refetchSearch();
    }
  };

  const deleteProductMutation = useDeleteProduct();
  const bulkDeleteMutation = useBulkDeleteProducts();

  // Determinar qual fonte de dados usar
  const sourceData = shouldUseSearch ? searchData : productsData;
  const loading = shouldUseSearch ? loadingSearch : loadingProducts;

  // Aplicar filtros no frontend (preço e estoque)
  const filteredProducts = sourceData?.items ? [...sourceData.items] : [];
  let finalProducts = filteredProducts;

  if (minPrice) {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) {
      finalProducts = finalProducts.filter(p => (p.price || 0) >= min);
    }
  }
  if (maxPrice) {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) {
      finalProducts = finalProducts.filter(p => (p.price || 0) <= max);
    }
  }
  if (stockFilter === "low") {
    finalProducts = finalProducts.filter(p => (p.stockQuantity || 0) < 10);
  } else if (stockFilter === "normal") {
    finalProducts = finalProducts.filter(p => (p.stockQuantity || 0) >= 10 && (p.stockQuantity || 0) > 0);
  } else if (stockFilter === "out") {
    finalProducts = finalProducts.filter(p => (p.stockQuantity || 0) === 0);
  }

  const products = finalProducts;
  const totalPages = sourceData?.totalPages || 1;
  const totalCount = sourceData?.totalCount || 0;
  const lowStockCount = lowStockProducts.length;

  // Notificação de estoque baixo
  useEffect(() => {
    if (lowStockProducts.length > 0 && !keycloakLoading && isAuthenticated) {
      toast({
        variant: "warning",
        title: "Atenção: Estoque Baixo",
        description: `${lowStockProducts.length} produto(s) com estoque abaixo de 10 unidades.`,
        duration: 5000,
      });
    }
  }, [lowStockProducts.length, keycloakLoading, isAuthenticated, toast]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProductMutation.mutateAsync(id);
      toast({
        variant: "success",
        title: "Produto excluído!",
        description: "O produto foi excluído com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao excluir produto:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Ocorreu um erro ao excluir o produto.";
      
      let description = errorMessage;
      if (error.response?.status === 403) {
        description = "Você não tem permissão para excluir produtos. Se você tem a role 'editor', tente fazer logout e login novamente para atualizar suas permissões.";
      }
      
      toast({
        variant: "error",
        title: "Erro ao excluir produto",
        description,
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;

    try {
      await bulkDeleteMutation.mutateAsync(Array.from(selectedProducts));
      toast({
        variant: "success",
        title: "Produtos excluídos!",
        description: `${selectedProducts.size} produto(s) foram excluídos com sucesso.`,
      });
      setSelectedProducts(new Set());
    } catch (error: any) {
      console.error("Erro ao excluir produtos em lote:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Ocorreu um erro ao excluir os produtos.";
      
      let description = errorMessage;
      if (error.response?.status === 403) {
        description = "Você não tem permissão para excluir produtos. Se você tem a role 'editor', tente fazer logout e login novamente para atualizar suas permissões.";
      }
      
      toast({
        variant: "error",
        title: "Erro ao excluir produtos",
        description,
      });
    }
  };

  const handleExportCSV = () => {
    const headers = ["Nome", "Descrição", "Preço", "Categoria", "Estoque"];
    const rows = products.map(p => [
      p.name,
      p.description || "",
      p.price?.toFixed(2) || "0.00",
      getCategoryName(p.categoryId),
      p.stockQuantity?.toString() || "0"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `produtos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    try {
      // Para PDF, vamos usar uma abordagem simples com window.print
      // Em produção, seria melhor usar uma biblioteca como jsPDF
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const htmlContent = `
        <html>
          <head>
            <title>Relatório de Produtos</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Relatório de Produtos</h1>
            <p>Data: ${new Date().toLocaleDateString("pt-BR")}</p>
            <p>Total: ${products.length} produto(s)</p>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Preço</th>
                  <th>Categoria</th>
                  <th>Estoque</th>
                </tr>
              </thead>
              <tbody>
                ${products.map(p => `
                  <tr>
                    <td>${p.name}</td>
                    <td>R$ ${p.price?.toFixed(2) || "0.00"}</td>
                    <td>${getCategoryName(p.categoryId)}</td>
                    <td>${p.stockQuantity || 0}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast({
        variant: "error",
        title: "Erro ao exportar PDF",
        description: "Não foi possível gerar o PDF.",
      });
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setStockFilter("all");
    setPage(1);
  };

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchTerm, minPrice, maxPrice, stockFilter]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name ?? "Sem categoria";
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          Sem estoque
        </Badge>
      );
    }
    if (quantity < 10) {
      return (
        <Badge className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          Baixo ({quantity})
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
        {quantity} unidades
      </Badge>
    );
  };

  const hasActiveFilters = selectedCategory !== "all" || minPrice || maxPrice || stockFilter !== "all";

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
            <p className="text-muted-foreground">
              Gerencie os produtos do sistema
            </p>
          </div>
          <div className="flex gap-2">
            <ManagerOnly>
              <Link href="/products/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Produto
                </Button>
              </Link>
            </ManagerOnly>
            {products.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportCSV}>
                    Exportar CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF}>
                    Exportar PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {lowStockCount > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Atenção: {lowStockCount} produto(s) com estoque baixo
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                Alguns produtos estão com menos de 10 unidades em estoque.
              </p>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base font-semibold">
                  Lista de Produtos ({totalCount})
                </CardTitle>
                <div className="flex items-center gap-2">
                  {selectedProducts.size > 0 && (
                    <ManagerOnly>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="gap-2">
                            <Trash2 className="h-4 w-4" />
                            Excluir Selecionados ({selectedProducts.size})
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir produtos</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir {selectedProducts.size} produto(s) selecionado(s)?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleBulkDelete}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </ManagerOnly>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={loading}
                    title="Atualizar dados"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar por nome..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          // A busca é automática via React Query quando searchTerm muda
                        }
                      }}
                    />
                  </div>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => {
                      setSelectedCategory(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas categorias</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 items-end">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Preço Mínimo</label>
                      <Input
                        type="number"
                        placeholder="R$ 0,00"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Preço Máximo</label>
                      <Input
                        type="number"
                        placeholder="R$ 0,00"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <Select
                    value={stockFilter}
                    onValueChange={(value) => {
                      setStockFilter(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Estoque" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="low">Estoque Baixo (&lt;10)</SelectItem>
                      <SelectItem value="normal">Estoque Normal</SelectItem>
                      <SelectItem value="out">Sem Estoque</SelectItem>
                    </SelectContent>
                  </Select>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Limpar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading || keycloakLoading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">
                  Nenhum produto encontrado
                </p>
                <Link href="/products/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Produto
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <ManagerOnly>
                            <Checkbox
                              checked={selectedProducts.size === products.length && products.length > 0}
                              onCheckedChange={toggleSelectAll}
                            />
                          </ManagerOnly>
                        </TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                        <TableHead className="hidden md:table-cell">Preço</TableHead>
                        <TableHead className="hidden lg:table-cell">Estoque</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <ManagerOnly>
                              <Checkbox
                                checked={selectedProducts.has(product.id)}
                                onCheckedChange={() => toggleProductSelection(product.id)}
                              />
                            </ManagerOnly>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground sm:hidden line-clamp-1">
                                {product.description}
                              </p>
                              <div className="flex flex-wrap gap-2 sm:hidden">
                                <span className="text-xs text-muted-foreground">
                                  {getCategoryName(product.categoryId)}
                                </span>
                                <span className="text-xs font-medium">
                                  R$ {product.price?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </span>
                                {getStockBadge(product.stockQuantity)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{getCategoryName(product.categoryId)}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            R$ {product.price?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">{getStockBadge(product.stockQuantity)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                            {permissions.canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/products/${product.id}/edit`)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {permissions.canDelete && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir produto</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir o produto &quot;{product.name}&quot;?
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(product.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Página {page} de {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Anterior</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                      >
                        <span className="hidden sm:inline">Próximo</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
