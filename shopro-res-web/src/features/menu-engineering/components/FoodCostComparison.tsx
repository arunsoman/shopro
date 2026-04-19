import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getFoodCostComparison } from "@/api/menuEngineering.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

export function FoodCostComparison() {
  const { restaurantId, periodId } = useParams();
  const rid = Number(restaurantId);
  const pid = Number(periodId);

  const { data, isLoading, error } = useQuery({
    queryKey: ["foodCostComparison", rid, pid],
    queryFn: () => getFoodCostComparison(rid, pid),
    enabled: !!rid && !!pid,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-6">
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>No food cost comparison data available</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.items?.slice(0, 10).map((item) => ({
    name: item.itemName.length > 15 ? item.itemName.substring(0, 15) + "..." : item.itemName,
    theoretical: item.theoreticalCost,
    actual: item.actualCost,
    variance: item.variance,
  })) || [];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Theoretical Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.theoreticalCost?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Actual Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.actualCost?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Variance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-1 ${
              (data.variance || 0) > 0 ? "text-red-500" : "text-green-500"
            }`}>
              {(data.variance || 0) > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              ${Math.abs(data.variance || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Variance %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={Math.abs(data.variancePct || 0) > 10 ? "destructive" : "default"}>
              {data.variancePct?.toFixed(1) || "0.0"}%
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Theoretical vs Actual Cost by Item</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="theoretical" name="Theoretical" fill="#94a3b8" />
              <Bar dataKey="actual" name="Actual" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Item Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Item</th>
                  <th className="text-right py-2">Theoretical</th>
                  <th className="text-right py-2">Actual</th>
                  <th className="text-right py-2">Variance</th>
                  <th className="text-right py-2">Variance %</th>
                </tr>
              </thead>
              <tbody>
                {data.items?.map((item) => (
                  <tr key={item.itemId} className="border-b">
                    <td className="py-2">{item.itemName}</td>
                    <td className="text-right">${item.theoreticalCost.toFixed(2)}</td>
                    <td className="text-right">${item.actualCost.toFixed(2)}</td>
                    <td className={`text-right ${item.variance > 0 ? "text-red-500" : "text-green-500"}`}>
                      ${item.variance.toFixed(2)}
                    </td>
                    <td className="text-right">
                      <Badge variant={Math.abs(item.variancePct) > 10 ? "destructive" : "secondary"}>
                        {item.variancePct.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FoodCostComparison;
