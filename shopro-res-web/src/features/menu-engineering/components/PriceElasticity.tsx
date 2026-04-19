import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getPriceElasticity } from "@/api/menuEngineering.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export function PriceElasticity() {
  const { restaurantId, periodId } = useParams();
  const rid = Number(restaurantId);
  const pid = Number(periodId);

  const { data, isLoading, error } = useQuery({
    queryKey: ["priceElasticity", rid, pid],
    queryFn: () => getPriceElasticity(rid, pid),
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

  if (error || !data || data.length === 0) {
    return (
      <Card className="p-6">
        <CardContent>
          <div className="text-muted-foreground text-center py-8">
            No price elasticity data available for this period.
            <br />
            <span className="text-sm">Items need sales history to calculate elasticity.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary stats
  const totalPotentialIncrease = data.reduce((sum, item) => sum + (item.potentialRevenueChange || 0), 0);
  const elasticItems = data.filter(item => (item.potentialRevenueChange || 0) > 0);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Items Analyzed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
              <TrendingUp className="h-5 w-5" />
              ${totalPotentialIncrease.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Items with Price Increase Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{elasticItems.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Price Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Price Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Item</th>
                  <th className="text-right py-2">Current Price</th>
                  <th className="text-right py-2">Current Qty</th>
                  <th className="text-right py-2">Elasticity</th>
                  <th className="text-right py-2">Recommended Price</th>
                  <th className="text-right py-2">Potential Change</th>
                  <th className="text-left py-2">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.itemId} className="border-b hover:bg-muted/50">
                    <td className="py-2 font-medium">{item.itemName}</td>
                    <td className="text-right">${item.currentPrice.toFixed(2)}</td>
                    <td className="text-right">{item.currentQty}</td>
                    <td className="text-right">
                      <Badge variant={item.elasticity < 1 ? "default" : "secondary"}>
                        {item.elasticity?.toFixed(2) || "N/A"}
                      </Badge>
                    </td>
                    <td className="text-right font-medium">${item.recommendedPrice?.toFixed(2) || item.currentPrice.toFixed(2)}</td>
                    <td className={`text-right ${
                      (item.potentialRevenueChange || 0) > 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {item.potentialRevenueChange ? (
                        (item.potentialRevenueChange > 0 ? "+" : "") + `$${item.potentialRevenueChange.toFixed(2)}`
                      ) : "$0.00"}
                    </td>
                    <td className="py-2">
                      <Badge variant={(item.potentialRevenueChange || 0) > 0 ? "default" : "destructive"}>
                        {(item.potentialRevenueChange || 0) > 0 ? "Increase" : "Decrease"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Understanding Elasticity */}
      <Card>
        <CardHeader>
          <CardTitle>Understanding Price Elasticity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-green-500" />
                Elastic Items (Elasticity &lt; 1)
              </h4>
              <p className="text-muted-foreground">
                Demand is relatively unresponsive to price changes. 
                Consider increasing prices to maximize revenue.
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-amber-500" />
                Inelastic Items (Elasticity &gt; 1)
              </h4>
              <p className="text-muted-foreground">
                Demand is sensitive to price changes. 
                Price increases may reduce total revenue.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PriceElasticity;
