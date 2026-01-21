import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

const products = [
  { name: "Bomber Jacket", category: "Jacket", sold: "55 pcs sold", revenue: "R$ 3.575,00" },
  { name: "Linen Shirt", category: "Shirt", sold: "35 pcs sold", revenue: "R$ 1.575,00" },
  { name: "Ankle Pants", category: "Pants", sold: "33 pcs sold", revenue: "R$ 1.320,00" },
  { name: "Black Shirt", category: "Shirt", sold: "15 pcs sold", revenue: "R$ 975,00" },
];

export function TopProducts() {
  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Top Products</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs">
            Weekly
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
            <Filter className="h-3 w-3" />
            Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.map((product) => (
          <div key={product.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 flex items-center justify-center text-sm font-semibold">
                {product.name.split(" ").map((word) => word[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-500 font-medium">{product.sold}</p>
              <p className="text-sm font-semibold">{product.revenue}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
