/**
 * Component: RecentPOFeed
 * Adapted from: ProjectDashboard (shopro-original-21.tsx) message list
 * DNA Preserved: RING SURFACE, Hover Highlight, Star/Action icons.
 * 
 * Usage:
 * <RecentPOFeed 
 *   orders={[
 *     { id: '1', supplier: 'Fresh Veggies', amount: '$450', status: 'pending', date: '2h ago' },
 *     { id: '2', supplier: 'Meat Co', amount: '$1.2k', status: 'delivered', date: '1d ago' }
 *   ]} 
 * />
 */

import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";

export interface POEntry {
  id: string;
  supplier: string;
  amount: string | number;
  status: string;
  date: string;
  itemsCount?: number;
}

export function RecentPOFeed({ 
  orders, 
  className 
}: { 
  orders: POEntry[]; 
  className?: string 
}) {
  return (
    <div className={cn(
      "divide-y divide-slate-100 dark:divide-slate-800 rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-900",
      className
    )}>
      {orders.map((po) => (
        <div 
          key={po.id} 
          className="group relative flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200 cursor-pointer"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {po.supplier}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {po.date}
              </span>
              <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
              <span className="text-xs text-muted-foreground">
                {po.itemsCount ? `${po.itemsCount} items` : po.amount}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <StatusBadge status={po.status as any} />
            <svg 
              viewBox="0 0 24 24" 
              className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      ))}
      
      {orders.length === 0 && (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No recent purchase orders.
        </div>
      )}
    </div>
  );
}
