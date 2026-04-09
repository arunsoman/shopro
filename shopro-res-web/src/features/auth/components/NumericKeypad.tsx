import React from 'react';
import { Delete, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumericKeypadProps {
  onDigit: (digit: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({ onDigit, onClear, disabled }) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'delete'];

  return (
    <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto w-full">
      {digits.map((key) => {
        const isSpecial = key === 'clear' || key === 'delete';
        
        return (
          <button
            key={key}
            onClick={() => {
              if (key === 'clear') onClear();
              else if (key === 'delete') onClear(); // Assuming delete acts as clear for now per user snippet
              else onDigit(key);
            }}
            disabled={disabled}
            className={cn(
              "h-20 rounded-[24px] flex items-center justify-center text-2xl font-black transition-all active:scale-95 disabled:opacity-50",
              isSpecial 
                ? "bg-muted/40 text-muted-foreground hover:bg-muted" 
                : "bg-surface dark:bg-card border border-border/40 text-foreground hover:border-primary/40 hover:bg-primary/5 shadow-sm"
            )}
          >
            {key === 'clear' ? <X size={24} strokeWidth={3} /> : 
             key === 'delete' ? <Delete size={24} strokeWidth={3} /> : 
             key}
          </button>
        );
      })}
    </div>
  );
};
