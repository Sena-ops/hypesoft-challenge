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
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface Product {
  id: string;
  name: string;
  stockQuantity: number;
  price: { amount: number; currency: string };
  categoryId: string;
}

interface LowStockListProps {
  products: Product[];
}

export function LowStockList({ products }: LowStockListProps) {
  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Low Stock Products</CardTitle>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
          <Filter className="h-3 w-3" />
          Filter
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.categoryId}</TableCell>
                <TableCell>
                  <Badge variant="destructive" className="bg-red-100 text-red-600 hover:bg-red-100 hover:text-red-600 border-none">
                    {product.stockQuantity} left
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  ${product.price.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
