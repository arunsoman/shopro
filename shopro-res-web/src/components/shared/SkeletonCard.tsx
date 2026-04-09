import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';

interface SkeletonCardProps {
    lines?: number;
    className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ lines = 2, className }) => {
    return (
        <Card className={cn("p-4 space-y-4", className)}>
            <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
            {lines > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/50">
                    {Array.from({ length: lines }).map((_, i) => (
                        <Skeleton key={i} className="h-3 w-full" />
                    ))}
                </div>
            )}
        </Card>
    );
};

// Helper to avoid 'cn' not found error in this file if not imported correctly
import { cn } from '@/lib/utils';
