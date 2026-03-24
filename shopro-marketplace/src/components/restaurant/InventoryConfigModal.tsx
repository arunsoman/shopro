"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { ShoproInput } from '@/components/ui/shopro-input';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { motion } from 'framer-motion';
import { Settings, Info, Bell, Truck, Package } from 'lucide-react';

const configSchema = z.object({
  leadTime: z.number().int().min(0, "Lead time must be at least 0 days"),
  alertLevel: z.number().min(0, "Alert threshold must be at least 0"),
  reorderCount: z.number().min(0, "Reorder amount must be at least 0"),
});

type ConfigFormData = z.infer<typeof configSchema>;

interface InventoryConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ConfigFormData) => void;
  isLoading?: boolean;
  initialData?: {
    foodName: string;
    leadTime: number;
    alertLevel: number;
    reorderCount: number;
    unit: string;
  };
}

export function InventoryConfigModal({ 
  isOpen, 
  onClose, 
  onSave, 
  isLoading,
  initialData 
}: InventoryConfigModalProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      leadTime: initialData?.leadTime || 3,
      alertLevel: initialData?.alertLevel || 10,
      reorderCount: initialData?.reorderCount || 50,
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-2 border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-3xl overflow-hidden">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
              <Settings size={24} className="animate-spin-slow" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight uppercase italic text-slate-900 dark:text-white">
                Inventory Config
              </DialogTitle>
              <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Setup replenishment rules for {initialData?.foodName || 'Item'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSave)} className="space-y-8 py-6">
          <div className="grid gap-6">
            {/* Lead Time */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Truck size={14} className="text-brand-primary" /> Lead Time (Days)
              </label>
              <ShoproInput 
                type="number"
                {...register('leadTime', { valueAsNumber: true })}
                className="h-14 bg-white/50 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-brand-primary transition-all font-bold"
                placeholder="e.g. 3"
              />
              {errors.leadTime && (
                <p className="text-[10px] font-bold text-rose-500 uppercase italic">{errors.leadTime.message}</p>
              )}
            </div>

            {/* Alert Level */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Bell size={14} className="text-brand-primary" /> Alert Threshold ({initialData?.unit || 'units'})
              </label>
              <ShoproInput 
                type="number"
                step="0.1"
                {...register('alertLevel', { valueAsNumber: true })}
                className="h-14 bg-white/50 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-brand-primary transition-all font-bold"
                placeholder="e.g. 10.0"
              />
              {errors.alertLevel && (
                <p className="text-[10px] font-bold text-rose-500 uppercase italic">{errors.alertLevel.message}</p>
              )}
            </div>

            {/* Reorder Count */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Package size={14} className="text-brand-primary" /> Reorder Amount ({initialData?.unit || 'units'})
              </label>
              <ShoproInput 
                type="number"
                step="0.1"
                {...register('reorderCount', { valueAsNumber: true })}
                className="h-14 bg-white/50 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-brand-primary transition-all font-bold"
                placeholder="e.g. 50.0"
              />
              {errors.reorderCount && (
                <p className="text-[10px] font-bold text-rose-500 uppercase italic">{errors.reorderCount.message}</p>
              )}
            </div>
          </div>

          <div className="bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/10 flex gap-4">
             <Info className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
             <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-wider">
               These settings determine when items appear in your reorder queue and help calculate optimal purchase quantities during replenishment.
             </p>
          </div>

          <DialogFooter className="pt-4">
            <LiquidButton 
              type="submit" 
              className="w-full h-16 text-sm font-black uppercase tracking-widest italic"
              disabled={isLoading}
            >
              {isLoading ? "Saving Config..." : "Update Configuration"}
            </LiquidButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
