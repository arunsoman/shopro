import React from 'react';
import { useAppStore } from '@/App';
import { AlertCircle, FileText, ChevronRight } from 'lucide-react';

interface AlertBannersProps {
  lowStockCount: number;
  draftInvoiceCount: number;
}

export const AlertBanners: React.FC<AlertBannersProps> = ({ 
  lowStockCount, 
  draftInvoiceCount 
}) => {
  const navigate = useAppStore(s => s.navigate);

  return (
    <div className="flex flex-col gap-3">
      {lowStockCount > 0 && (
        <button
          onClick={() => navigate('inventory-alerts')}
          className="flex items-center justify-between p-3 sm:p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl sm:rounded-2xl group transition-all active:scale-[0.99] active:bg-rose-500/10"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 transition-colors group-hover:bg-rose-500 group-hover:text-white shrink-0">
              <AlertCircle size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div className="text-left overflow-hidden">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-rose-500 block mb-0.5">Critical Alert</span>
              <p className="text-xs sm:text-sm font-bold text-foreground leading-tight truncate">
                {lowStockCount} items below par
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-rose-500 group-hover:translate-x-1 transition-transform shrink-0" />
        </button>
      )}

      {draftInvoiceCount > 0 && (
        <button
          onClick={() => navigate('purchase-invoice-log')}
          className="flex items-center justify-between p-3 sm:p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl sm:rounded-2xl group transition-all active:scale-[0.99] active:bg-amber-500/10"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 transition-colors group-hover:bg-amber-500 group-hover:text-white shrink-0">
              <FileText size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div className="text-left overflow-hidden">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-500 block mb-0.5">Action Required</span>
              <p className="text-xs sm:text-sm font-bold text-foreground leading-tight truncate">
                {draftInvoiceCount} pending invoices
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-amber-500 group-hover:translate-x-1 transition-transform shrink-0" />
        </button>
      )}
    </div>
  );
};
