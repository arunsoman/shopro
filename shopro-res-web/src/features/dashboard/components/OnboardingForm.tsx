import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Loader2, Store, UserPlus, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

const onboardingSchema = z.object({
  name: z.string().min(2, 'Restaurant name is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  adminUsername: z.string().min(3, 'Username must be at least 3 characters'),
  adminFullName: z.string().min(2, 'Full name is required'),
  adminEmail: z.string().email('Invalid email address'),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

interface OnboardingFormProps {
  onSuccess: () => void;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ onSuccess }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      timezone: 'UTC',
      adminUsername: '',
      adminFullName: '',
      adminEmail: '',
    },
  });

  const onSubmit = async (values: OnboardingValues) => {
    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post('/onboarding/restaurant', values);
      setResult(data);
      setStep(3);
      toast.success('Restaurant initialized successfuly');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Onboarding failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 3 && result) {
    return (
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden p-0 font-sans">
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-500/20">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-1.5">
            <DialogTitle className="text-xl font-bold tracking-tight">Onboarding Complete</DialogTitle>
            <DialogDescription className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 italic">
              {result.restaurantName} is now synchronized
            </DialogDescription>
          </div>
          
          <div className="w-full bg-slate-50 dark:bg-black/20 p-6 rounded-xl border border-slate-100 dark:border-white/5 space-y-4 text-left shadow-inner">
            <div className="space-y-1">
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">Admin Identifier</div>
              <div className="font-mono font-bold text-sm text-foreground tracking-tight">{result.adminUsername}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">System Bootstrap Pass</div>
              <div className="font-mono font-bold text-sm text-primary tracking-tight">{result.defaultPassword}</div>
            </div>
            <div className="pt-2">
                <p className="text-[9px] font-bold text-muted-foreground/20 italic tracking-widest uppercase">
                  * Dynamic rotation required upon first login
                </p>
            </div>
          </div>

          <Button 
            onClick={onSuccess}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-11 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            Launch Command Center
          </Button>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden p-0 font-sans">
      <div className="absolute top-0 left-0 w-1 bg-primary h-full z-20" />
      
      <DialogHeader className="p-8 border-b border-slate-50 dark:border-white/5 bg-slate-50/30 dark:bg-black/10">
        <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-primary shadow-sm border border-slate-200/50 dark:border-white/5">
                {step === 1 ? <Store size={22} /> : <UserPlus size={22} />}
            </div>
            <div className="text-left space-y-1">
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {step === 1 ? 'Entity Definition' : 'Primary Controller'}
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic flex items-center gap-2 leading-none">
                  Step {step} of 2 <span className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-700" /> Operational Blueprint V4
                </DialogDescription>
            </div>
        </div>
      </DialogHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">Legal Entity Name</Label>
              <Input 
                placeholder="e.g. Blue Ocean Bistro" 
                {...form.register('name')} 
                className="bg-slate-50/50 dark:bg-black/20 border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/20" 
              />
              {form.formState.errors.name && (
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-1 ml-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">Operational Timezone</Label>
              <Controller
                control={form.control}
                name="timezone"
                render={({ field }: { field: any }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-slate-50/50 dark:bg-black/20 border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 font-bold text-sm shadow-none focus:ring-4 focus:ring-primary/5 transition-all">
                      <SelectValue placeholder="Select a timezone" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-2xl">
                      <SelectItem value="UTC" className="text-[11px] font-bold uppercase tracking-widest">UTC (Standard)</SelectItem>
                      <SelectItem value="America/New_York" className="text-[11px] font-bold uppercase tracking-widest">Eastern Time (US)</SelectItem>
                      <SelectItem value="Europe/London" className="text-[11px] font-bold uppercase tracking-widest">London (UK)</SelectItem>
                      <SelectItem value="Asia/Dubai" className="text-[11px] font-bold uppercase tracking-widest">Dubai (UAE)</SelectItem>
                      <SelectItem value="Asia/Singapore" className="text-[11px] font-bold uppercase tracking-widest">Singapore (SGT)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">Full Legal Name</Label>
              <Input 
                placeholder="e.g. Jane Doe" 
                {...form.register('adminFullName')} 
                className="bg-slate-50/50 dark:bg-black/20 border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/20" 
              />
              {form.formState.errors.adminFullName && (
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-1 ml-1">{form.formState.errors.adminFullName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">ID Tag (UID)</Label>
                <Input 
                  placeholder="j.doe" 
                  {...form.register('adminUsername')} 
                  className="bg-slate-50/50 dark:bg-black/20 border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/20" 
                />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">Reporting Mail</Label>
                <Input 
                  placeholder="jane@domain.com" 
                  {...form.register('adminEmail')} 
                  className="bg-slate-50/50 dark:bg-black/20 border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/20" 
                />
              </div>
            </div>
            {(form.formState.errors.adminUsername || form.formState.errors.adminEmail) && (
              <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-1 ml-1">
                {form.formState.errors.adminUsername?.message || form.formState.errors.adminEmail?.message}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="pt-6 flex flex-row gap-4 items-center">
          {step === 2 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1 rounded-xl h-11 border-slate-200 dark:border-white/10 font-bold uppercase tracking-widest text-[10px] bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95 transition-all"
            >
              <ArrowLeft size={12} className="mr-2" /> Previous
            </Button>
          )}
          {step === 1 ? (
            <Button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl h-11 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-slate-900/10 dark:shadow-white/5 active:scale-95 transition-all group"
            >
              Next Protocol <ChevronRight size={12} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl h-11 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Execute Synchronization'}
            </Button>
          )}
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
