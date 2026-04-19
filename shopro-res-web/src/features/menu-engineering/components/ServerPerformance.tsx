import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getServerPerformance } from "@/api/menuEngineering.api";
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
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Users, DollarSign, TrendingUp, Award } from "lucide-react";

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export function ServerPerformance() {
  const { restaurantId, periodId } = useParams();
  const rid = Number(restaurantId);
  const pid = Number(periodId);

  const { data, isLoading, error } = useQuery({
    queryKey: ["serverPerformance", rid, pid],
    queryFn: () => getServerPerformance(rid, pid),
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
          <div className="text-muted-foreground text-center py-8">
            No server performance data available for this period.
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalOrders = 0, totalRevenue = 0, serverRankings = [] } = data;
  const topServer = serverRankings[0];

  // Prepare chart data
  const revenueData = serverRankings.map((s) => ({
    name: s.server,
    revenue: s.totalRevenue,
    orders: s.orderCount,
  }));

  const orderDistribution = serverRankings.map((s) => ({
    name: s.server,
    value: s.percentageOfTotalOrders,
  }));

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              {totalOrders}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              ${totalRevenue?.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Server
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              {topServer?.server || "N/A"}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Top Server Ticket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              ${topServer?.averageTicket?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Server</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={orderDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value?.toFixed(0)}%`}
                >
                  {orderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Server Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Server Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Rank</th>
                  <th className="text-left py-2">Server</th>
                  <th className="text-right py-2">Orders</th>
                  <th className="text-right py-2">Revenue</th>
                  <th className="text-right py-2">Avg Ticket</th>
                  <th className="text-right py-2">Avg Items/Order</th>
                  <th className="text-right py-2">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {serverRankings.map((server, idx) => (
                  <tr key={server.server} className="border-b hover:bg-muted/50">
                    <td className="py-2">
                      <Badge variant={idx === 0 ? "default" : "secondary"}>
                        #{idx + 1}
                      </Badge>
                    </td>
                    <td className="py-2 font-medium">{server.server}</td>
                    <td className="text-right">{server.orderCount}</td>
                    <td className="text-right">${server.totalRevenue?.toFixed(2)}</td>
                    <td className="text-right">${server.averageTicket?.toFixed(2)}</td>
                    <td className="text-right">{server.averageItemsPerOrder?.toFixed(1)}</td>
                    <td className="text-right">
                      <Badge variant="outline">
                        {server.percentageOfTotalOrders?.toFixed(1)}%
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

export default ServerPerformance;
