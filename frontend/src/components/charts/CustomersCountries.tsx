import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { country: "BR", value: 18 },
  { country: "US", value: 12 },
  { country: "DE", value: 9 },
  { country: "ID", value: 14 },
  { country: "JP", value: 10 },
];

export function CustomersCountries() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Customers Countries</CardTitle>
      </CardHeader>
      <CardContent className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis
              dataKey="country"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#7c3aed" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
