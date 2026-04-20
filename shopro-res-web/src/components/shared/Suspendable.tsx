import React from 'react';
import { cn } from '@/lib/utils';

interface SuspendableProps {
  isLoading: boolean;
  skeleton?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Suspendable — drops a skeleton in place of children while isLoading is true.
 * Use this for arbitrary page sections that don't have their own shared component.
 *
 * For components that already accept a `loading` prop (KpiCard, NavCard, DataList, etc.)
 * prefer passing the prop directly — the component owns its own skeleton shape.
 */
export function Suspendable({ isLoading, skeleton, children, className }: SuspendableProps) {
  return (
    <div className={cn(className)}>
      {isLoading ? skeleton : children}
    </div>
  );
}
