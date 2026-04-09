import React, { useState, useEffect } from 'react';
import { useStaffAuth } from '../hooks/useStaffAuth';
import { NumericKeypad } from './NumericKeypad';
import { useRestaurantStore } from '@/store/useRestaurantStore';
import api from '@/lib/api/client';
import { Loader2, ArrowLeft, ShieldCheck, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface StaffPinLoginProps {
  restaurantId?: number;
}

interface StaffListItem {
    staffId: string;
    name: string;
    role: string;
}

export const StaffPinLogin: React.FC<StaffPinLoginProps> = ({ restaurantId: propRestaurantId }) => {
  const { restaurantId: storeRestaurantId } = useRestaurantStore();
  const activeRestaurantId = propRestaurantId || storeRestaurantId;
  
  const [staffList, setStaffList] = useState<StaffListItem[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffListItem | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isFetchingStaff, setIsFetchingStaff] = useState(false);
  
  const { login, isLoading } = useStaffAuth();

  useEffect(() => {
    async function fetchStaff() {
        setIsFetchingStaff(true);
        try {
            const { data } = await api.get(`/auth/staff?restaurantId=${activeRestaurantId}`);
            setStaffList(data);
        } catch (err) {
            toast.error('Could not load staff list');
        } finally {
            setIsFetchingStaff(false);
        }
    }
    fetchStaff();
  }, [activeRestaurantId]);

  const handlePinComplete = async (completedPin: string) => {
    if (!selectedStaff) return;
    setError('');
    
    try {
      await login({
        restaurantId: activeRestaurantId,
        staffId: selectedStaff.staffId,
        pin: completedPin
      });
    } catch (err) {
      setError('Invalid PIN. Access Denied.');
      setPin('');
    }
  };

  if (isFetchingStaff) return (
    <div className="py-20 flex flex-col items-center gap-4 animate-in fade-in duration-700">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 italic">Synchronising Station Data…</p>
    </div>
  );

  if (!selectedStaff) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-lg mx-auto">
        <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Select Profile</h2>
            <div className="flex items-center justify-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
               <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Operational Station Active</p>
            </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {staffList.map(staff => (
            <button
              key={staff.staffId}
              onClick={() => setSelectedStaff(staff)}
              className="flex flex-col items-center gap-4 p-5 rounded-2xl bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 hover:border-primary/40 hover:bg-white dark:hover:bg-white/5 hover:shadow-xl hover:shadow-primary/5 transition-all active:scale-95 group"
            >
              <div className="h-14 w-14 rounded-xl bg-slate-200/50 dark:bg-white/5 flex items-center justify-center text-xl font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {staff.name[0]}
              </div>
              <div className="text-center space-y-0.5">
                <div className="font-bold text-[13px] text-foreground tracking-tight leading-none group-hover:text-primary transition-colors">{staff.name}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">{staff.role}</div>
              </div>
            </button>
          ))}
          {staffList.length === 0 && (
             <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-muted-foreground/20 mx-auto">
                    <User size={24} />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/20 italic">No operational staff mapped to node</p>
             </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-xs mx-auto">
      <div className="flex items-center justify-between">
          <button 
            onClick={() => { setSelectedStaff(null); setPin(''); setError(''); }} 
            className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all border border-slate-200 dark:border-white/10 active:scale-95 shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="text-right">
              <div className="text-sm font-bold text-foreground tracking-tight leading-none">{selectedStaff.name}</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary/60 italic mt-1">{selectedStaff.role}</div>
          </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-center gap-4">
            {Array(4).fill(null).map((_, i) => (
                <div key={i} className={cn(
                    "h-3.5 w-3.5 rounded-full border-2 transition-all duration-300 shadow-sm",
                    i < pin.length ? "bg-primary border-primary scale-110 shadow-primary/20" : "bg-transparent border-slate-200 dark:border-white/10"
                )} />
            ))}
        </div>
        
        {error && <div className="text-rose-500 text-[10px] font-bold uppercase tracking-widest text-center animate-pulse">{error}</div>}
      </div>
      
      <div className="px-4">
        <NumericKeypad
          onDigit={(d) => {
            if (pin.length < 4) {
              const newPin = pin + d;
              setPin(newPin);
              if (newPin.length === 4) {
                handlePinComplete(newPin);
              }
            }
          }}
          onClear={() => setPin('')}
          disabled={isLoading}
        />
      </div>

      <div className="text-center pt-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/20 italic flex items-center justify-center gap-2">
            <ShieldCheck size={12} className="opacity-40" /> Station Vault Locked
          </p>
      </div>
    </div>
  );
};
