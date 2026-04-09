/**
 * PartialReceiptBadge.tsx
 * ─────────────────────────────────────────────────────────────────
 * Visual indicator for partial reception against a PO.
 */

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PartialReceiptBadge() {
  return (
    <Badge variant="outline" className="h-4 rounded-md font-black text-[7px] uppercase tracking-widest border-rose-500/30 text-rose-500 bg-rose-500/5 px-1.5 flex items-center gap-1 transition-all hover:scale-110">
      <AlertTriangle size={8} className="animate-pulse" /> Partial
    </Badge>
  );
}
