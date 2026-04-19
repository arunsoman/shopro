import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getMarketBasketAnalysis } from "@/api/menuEngineering.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  ArrowRight,
  Sparkles
} from "lucide-react";

export function MarketBasketAnalysis() {
  const { restaurantId, periodId } = useParams();
  const rid = Number(restaurantId);
  const pid = Number(periodId);

  const { data, isLoading, error } = useQuery({
    queryKey: ["marketBasket", rid, pid],
    queryFn: () => getMarketBasketAnalysis(rid, pid),
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
            No market basket data available for this period.
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalOrders = 0, uniqueItems = 0, topItemPairs = [], bundleRecommendations = [] } = data;

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
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueItems}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Item Pairs Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topItemPairs.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bundle Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bundleRecommendations.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Item Pairs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Frequently Co-Purchased Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topItemPairs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No item pairs found. More order data needed.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Item 1</th>
                    <th className="text-center py-2"></th>
                    <th className="text-left py-2">Item 2</th>
                    <th className="text-right py-2">Co-occurences</th>
                    <th className="text-right py-2">Support</th>
                    <th className="text-right py-2">Confidence</th>
                    <th className="text-right py-2">Lift</th>
                  </tr>
                </thead>
                <tbody>
                  {topItemPairs.slice(0, 10).map((pair, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="py-2 font-medium">{pair.item1Name}</td>
                      <td className="text-center py-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground inline" />
                      </td>
                      <td className="py-2 font-medium">{pair.item2Name}</td>
                      <td className="text-right">{pair.coOccurrenceCount}</td>
                      <td className="text-right">
                        <Badge variant="secondary">
                          {((pair.support || 0) * 100).toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="text-right">
                        <Badge variant="secondary">
                          {((pair.confidence || 0) * 100).toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="text-right">
                        <Badge variant={(pair.lift || 0) > 1 ? "default" : "secondary"}>
                          {(pair.lift || 0).toFixed(2)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bundle Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recommended Bundles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bundleRecommendations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No bundle recommendations available yet.
              <br />
              <span className="text-sm">More order data needed to identify patterns.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bundleRecommendations.map((bundle, idx) => (
                <div 
                  key={idx} 
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">{bundle.bundleName}</span>
                    </div>
                    <Badge variant="default">
                      +${bundle.potentialRevenue?.toFixed(0)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {bundle.items?.join(" + ")}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span>Expected lift: {(bundle.expectedLift || 0).toFixed(2)}x</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Understanding Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Understanding Market Basket Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Support</h4>
              <p className="text-muted-foreground">
                Percentage of orders containing both items. Higher = more common pairing.
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Confidence</h4>
              <p className="text-muted-foreground">
                Probability of buying Item 2 given Item 1 was purchased.
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Lift</h4>
              <p className="text-muted-foreground">
                How much more likely items are bought together vs. randomly. 
                Lift &gt; 1 indicates positive correlation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MarketBasketAnalysis;
