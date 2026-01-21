import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

const transactions = [
  { id: "763463983289", customer: "Ananda Faris", product: "Bomber Jacket", category: "Jacket", qty: "2pcs", total: "R$ 130,00" },
  { id: "763463988239", customer: "Firman Alam", product: "Bomber Jacket", category: "Jacket", qty: "1pc", total: "R$ 65,00" },
  { id: "763463989237", customer: "John Lee", product: "Linen Shirt", category: "Shirt", qty: "1pc", total: "R$ 45,00" },
  { id: "763463982395", customer: "Alan Michael", product: "Black Shirt", category: "Shirt", qty: "1pc", total: "R$ 65,00" },
];

export function LatestTransactions() {
  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Latest Transaction</CardTitle>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
          <Filter className="h-3 w-3" />
          Filter
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="text-xs text-muted-foreground">{transaction.id}</TableCell>
                <TableCell>{transaction.customer}</TableCell>
                <TableCell>{transaction.product}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>{transaction.qty}</TableCell>
                <TableCell className="text-right">{transaction.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
