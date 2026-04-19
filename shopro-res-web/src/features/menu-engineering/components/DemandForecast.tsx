import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getDemandForecast } from "@/api/menuEngineering.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  BarChart, LineChart, 
  Bar, Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { TrendingUp, TrendingDown, Package, AlertTriangle } from "lucide-react";

export function DemandForecast() {
  const { restaurantId, periodId } = useParams();
  const rid = Number(restaurantId);
  const pid = Number(periodId);

  const { data, isLoading, error } = useQuery({
    queryKey: ["demandForecast", rid, pid],
    queryFn: () => getDemandForecast(rid, pid),
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
            No demand forecast data available for this period.
            <br />
            <span className="text-sm">More historical data needed for forecasting.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary stats
  const trendingUp = data.filter(item => item.trend === "UP").length;
  const trendingDown = data.filter(item => item.trend === "DOWN").length;
  const stable = data.filter(item => item.trend === "STABLE").length;

  // Get top 5 by forecasted increase
  const topForecasted = [...data]
    .sort((a, b) => (b.forecastedDailyAvg || 0) - (a.forecastedDailyAvg || 0))
    .slice(0, 5);

  // Create chart data for top items
  const chartData = topForecasted.map(item => ({
    name: item.itemName.length > 20 ? item.itemName.substring(0, 20) + "..." : item.itemName,
    current: item.currentDailyAvg,
    forecast: item.forecastedDailyAvg,
    trend: item.trend,
  }));

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Items Forecasted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trending Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
              <TrendingUp className="h-5 w-5" />
              {trendingUp}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 flex items-center gap-1">
              <Package className="h-5 w-5" />
              {stable}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trending Down
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 flex items-center gap-1">
              <TrendingDown className="h-5 w-5" />
              {trendingDown}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Items - Current vs Forecasted Demand</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="current" name="Current Avg" fill="#94a3b8" />
              <Bar dataKey="forecast" name="Forecasted" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Demand Forecast Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Item</th>
                  <th className="text-right py-2">Current Daily Avg</th>
                  <th className="text-right py-2">Forecasted Daily Avg</th>
                  <th className="text-right py-2">Change</th>
                  <th className="text-center py-2">Trend</th>
                  <th className="text-right py-2">Confidence</th>
                  <th className="text-left py-2">Stock Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => {
                  const change = item.forecastedDailyAvg - item.currentDailyAvg;
                  const changePct = item.currentDailyAvg > 0 
                    ? (change / item.currentDailyAvg) * 100 
                    : 0;
                    
                  return (
                    <tr key={item.itemId} className="border-b hover:bg-muted/50">
                      <td className="py-2 font-medium">{item.itemName}</td>
                      <td className="text-right">{item.currentDailyAvg?.toFixed(1)}</td>
                      <td className="text-right">{item.forecastedDailyAvg?.toFixed(1)}</td>
                      <td className={`text-right ${
                        change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-muted-foreground"
                      }`}>
                        {change > 0 ? "+" : ""}{change?.toFixed(1)} ({changePct?.toFixed(0)}%)
                      </td>
                      <td className="text-center">
                        <Badge variant={
                          item.trend === "UP" ? "default" : 
                          item.trend === "DOWN" ? "destructive" : "secondary"
                        }>
                          {item.trend === "UP" && <TrendingUp className="h-3 w-3 mr-1" />}
                          {item.trend === "DOWN" && <TrendingDown className="h-3 w-3 mr-1" />}
                          {item.trend}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <Badge variant="outline">
                          {((item.confidence || 0) * 100).toFixed(0)}%
                        </Badge>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-1 text-xs">
                          {item.stockRecommendation?.includes("High") && (
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                          )}
                          {item.stockRecommendation}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Planning Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <span className="font-medium">Trending Up Items:</span>
                <p className="text-muted-foreground">
                  Consider increasing stock levels. These items are gaining popularity.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <Package className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <span className="font-medium">Stable Items:</span>
                <p className="text-muted-foreground">
                  Maintain current stock levels. Demand is consistent.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <TrendingDown className="h-4 w-4 text-red-600 mt-0.5" />
              <div>
                <span className="font-medium">Trending Down Items:</span>
                <p className="text-muted-foreground">
                  Consider reducing stock. Demand is decreasing.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DemandForecast;
