import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, AlertTriangle, AlertCircle, RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type StockFilterType = 'all' | 'critical' | 'reorder' | 'safety';

interface StockFilterBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    currentFilter: StockFilterType;
    onFilterChange: (filter: StockFilterType) => void;
    counts?: {
        critical: number;
        reorder: number;
        safety: number;
    };
}

export const StockFilterBar: React.FC<StockFilterBarProps> = ({
    search,
    onSearchChange,
    currentFilter,
    onFilterChange,
    counts
}) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <Input
                    placeholder="Search ingredients..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 bg-surface/50"
                />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                <Button
                    variant={currentFilter === 'all' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => onFilterChange('all')}
                    className="rounded-full"
                >
                    All
                </Button>
                
                <Button
                    variant={currentFilter === 'critical' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => onFilterChange('critical')}
                    className={`rounded-full gap-2 ${currentFilter === 'critical' ? 'text-error' : 'text-muted-foreground hover:text-error'}`}
                >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Critical
                    {counts && counts.critical > 0 && (
                        <Badge variant="destructive" className="h-4 px-1.5 min-w-[18px] flex items-center justify-center font-bold">
                            {counts.critical}
                        </Badge>
                    )}
                </Button>

                <Button
                    variant={currentFilter === 'reorder' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => onFilterChange('reorder')}
                    className={`rounded-full gap-2 ${currentFilter === 'reorder' ? 'text-warning' : 'text-muted-foreground hover:text-warning'}`}
                >
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Reorder
                    {counts && counts.reorder > 0 && (
                        <Badge variant="warning" className="h-4 px-1.5 min-w-[18px] flex items-center justify-center font-bold text-background">
                            {counts.reorder}
                        </Badge>
                    )}
                </Button>

                <Button
                    variant={currentFilter === 'safety' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => onFilterChange('safety')}
                    className={`rounded-full gap-2 ${currentFilter === 'safety' ? 'text-warning' : 'text-muted-foreground hover:text-warning'}`}
                >
                    <AlertCircle className="h-3.5 w-3.5" />
                    Safety
                    {counts && counts.safety > 0 && (
                        <Badge variant="warning" className="h-4 px-1.5 min-w-[18px] flex items-center justify-center font-bold text-background">
                            {counts.safety}
                        </Badge>
                    )}
                </Button>
            </div>
        </div>
    );
};
