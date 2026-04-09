import React from 'react';
import { Construction, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/App';

interface StubPageProps {
    title: string;
}

export const StubPage: React.FC<StubPageProps> = ({ title }) => {
    const navigate = useAppStore((s) => s.navigate);
    const back = useAppStore((s) => s.back);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mb-8 animate-bounce">
                <Construction size={48} />
            </div>
            
            <h1 className="text-4xl font-black tracking-tighter italic uppercase text-primary leading-none mb-2">{title}</h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-60 mb-8 max-w-md">
                This management surface is currently under construction as part of the Phase 5 stabilization.
            </p>

            <div className="flex gap-4">
                <Button 
                    variant="outline" 
                    onClick={() => back()}
                    className="h-12 rounded-2xl border-border border-2 font-black uppercase text-[10px] tracking-widest text-muted-foreground flex items-center gap-2"
                >
                    <ArrowLeft size={16} />
                    Go Back
                </Button>
                <Button 
                    onClick={() => navigate('dashboard')}
                    className="h-12 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2"
                >
                    <LayoutDashboard size={16} />
                    Command Center
                </Button>
            </div>
        </div>
    );
};
