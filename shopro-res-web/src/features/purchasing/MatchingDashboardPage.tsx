import { useAppStore } from '@/App';
import { 
  LayoutGrid, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShoppingCart, 
  PieChart, 
  ArrowUpRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn, formatDate } from '@/lib/utils';
import { useStaleGRNs } from './hooks/useGoodsReceipts';
import { useRestaurantId } from '@/providers/RestaurantProvider';
import MatchAuditPage from './MatchAuditPage';

export default function MatchingDashboardPage() {
  const navigate = useAppStore(s => s.navigate);
  const back = useAppStore(s => s.back);
  const restaurantId = useRestaurantId();
  const { data: staleGRNs, isLoading } = useStaleGRNs(restaurantId);

  return (
 <MatchAuditPage/>   
   );
}
