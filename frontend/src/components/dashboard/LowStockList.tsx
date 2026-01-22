import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, PackageX } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  stockQuantity: number;
  price: number;
  currency: string;
  categoryId: string;
}

interface LowStockListProps {
  products: Product[];
}

export function LowStockList({ products }: LowStockListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <div>
            <CardTitle className="text-base font-semibold">Produtos com Estoque Baixo</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Produtos com menos de 10 unidades em estoque
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <PackageX className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Nenhum produto com estoque baixo
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead className="text-right">Preço</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Link 
                      href={`/products/${product.id}/edit`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="destructive" 
                      className="bg-red-100 text-red-600 hover:bg-red-100 hover:text-red-600 border-none dark:bg-red-900/30 dark:text-red-400"
                    >
                      {product.stockQuantity} {product.stockQuantity === 1 ? "unidade" : "unidades"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {product.price?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) ?? "0,00"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
