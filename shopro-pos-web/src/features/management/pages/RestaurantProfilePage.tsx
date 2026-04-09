import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useManagementProfile, useSaveManagementProfile } from '../hooks/useManagementProfile';
import { Loader2, Save, Store, Calendar, Percent } from 'lucide-react';
import { toast } from 'sonner';

export const RestaurantProfilePage: React.FC = () => {
  const { data: profile, isLoading } = useManagementProfile();
  const saveMutation = useSaveManagementProfile();
  
  const [formData, setFormData] = useState({
    restaurantName: '',
    weekStartDate: '',
    taxesBenefitsRate: 0.22,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        restaurantName: profile.restaurantName || '',
        weekStartDate: profile.weekStartDate || '',
        taxesBenefitsRate: profile.taxesBenefitsRate || 0.22,
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData as any, {
      onSuccess: () => {
        toast.success('Restaurant profile saved successfully');
      },
      onError: () => {
        toast.error('Failed to save restaurant profile');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <Card className="bg-surface border-border overflow-hidden">
        <div className="h-2 bg-primary/20" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Management Identity</CardTitle>
              <CardDescription>Global variables for back-office reporting and calculations.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Restaurant Name
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                  placeholder="e.g. Shopro Bistro & Grill"
                  className="bg-background/50 border-white/10"
                />
              </div>
              <p className="text-xs text-muted-2">This name appears on all financial reports and guest grids.</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Week Start Day</label>
                <div className="flex items-center gap-2 relative">
                  <Input
                    type="date"
                    value={formData.weekStartDate}
                    onChange={(e) => setFormData({ ...formData, weekStartDate: e.target.value })}
                    className="bg-background/50 border-white/10"
                  />
                  <Calendar className="absolute right-3 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                </div>
                <p className="text-xs text-muted-2">Monday is standard for restaurant cycles.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Taxes & Benefits Rate</label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.taxesBenefitsRate}
                    onChange={(e) => setFormData({ ...formData, taxesBenefitsRate: parseFloat(e.target.value) })}
                    className="bg-background/50 border-white/10 pr-9"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                    <Percent className="h-3 w-3" />
                  </div>
                </div>
                <p className="text-xs text-muted-2">Default is 22% (0.22) for payroll calculations.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <Button 
                type="submit" 
                disabled={saveMutation.isPending}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-info-dim border-info/20 shadow-none">
        <CardContent className="pt-6 flex gap-3 text-info text-sm leading-relaxed">
          <div className="mt-0.5"><Loader2 className="h-4 w-4 animate-spin" /></div>
          <div>
            <strong>Configuration Context:</strong> These variables drive the Prime Cost calculations. Changing the week start date will shift all rolling trend reports to match the new period boundary.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantProfilePage;
