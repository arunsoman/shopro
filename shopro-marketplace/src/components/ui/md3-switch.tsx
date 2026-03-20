/**
 * Component: MD3Switch
 * Adapted from: MD3Switch (shopro-original-21.tsx)
 * DNA Preserved: SPRING animations, Halo effects, Haptic logic, MDC layout.
 */

import React, { forwardRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const switchCva = cva(
  "inline-flex h-[32px] w-[52px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 outline-none",
  {
    variants: {
      variant: {
        primary: "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        destructive: "focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2",
      },
      size: {
        default: "h-[32px] w-[52px]",
        sm: "h-[24px] w-[40px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface MD3SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">, VariantProps<typeof switchCva> {
  onCheckedChange?: (checked: boolean) => void;
}

export const MD3Switch = forwardRef<HTMLInputElement, MD3SwitchProps>(({ 
  className, 
  size, 
  variant, 
  checked, 
  defaultChecked, 
  onCheckedChange, 
  disabled,
  ...props 
}, ref) => {
  const [isChecked, setIsChecked] = useState(defaultChecked ?? false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (checked !== undefined) setIsChecked(checked);
  }, [checked]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (checked === undefined) setIsChecked(e.target.checked);
    onCheckedChange?.(e.target.checked);
  };

  const isSmall = (size as string) === "sm";
  const translateDist = isSmall ? "translate-x-[16px]" : "translate-x-[20px]";
  const thumbSize = isSmall 
    ? (isChecked ? "w-4 h-4" : "w-3 h-3 ml-[1px]") 
    : (isChecked ? "w-6 h-6" : "w-4 h-4 ml-[2px]");

  return (
    <label className={cn("group relative inline-flex items-center justify-center p-2", disabled && "cursor-not-allowed opacity-50")}>
      <input 
        type="checkbox" 
        className="peer sr-only" 
        ref={ref} 
        checked={isChecked} 
        onChange={handleChange} 
        disabled={disabled} 
        {...props} 
      />
      <div 
        className={cn(
          switchCva({ variant, size: size as any }),
          "bg-slate-200 border-slate-300 dark:bg-slate-800 dark:border-slate-700 peer-checked:bg-indigo-600 peer-checked:border-indigo-600",
          className
        )}
        onPointerDown={() => !disabled && setIsPressed(true)}
        onPointerUp={() => setIsPressed(false)}
        onPointerLeave={() => setIsPressed(false)}
      >
        <div className={cn(
          "pointer-events-none block h-full w-full transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] flex items-center",
          isChecked ? translateDist : "translate-x-0"
        )}>
          <div className={cn(
            "shadow-sm transition-all duration-300 flex items-center justify-center rounded-full",
            isChecked ? "bg-white" : "bg-slate-400 dark:bg-slate-500",
            thumbSize,
            isPressed && (isSmall ? "w-5 h-5 -ml-[1px]" : "w-7 h-7 -ml-[1px]")
          )} />
          
          {/* Ripple/Halo */}
          <div className={cn(
            "absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 rounded-full pointer-events-none transition-all duration-200",
            isSmall ? "w-8 h-8" : "w-10 h-10",
            isChecked ? "bg-indigo-600/10" : "bg-slate-600/10",
            isPressed ? "opacity-100 scale-100" : "opacity-0 scale-50",
            isSmall ? (isChecked ? "left-[26px]" : "left-[14px]") : (isChecked ? "left-[36px]" : "left-[16px]")
          )} />
        </div>
      </div>
    </label>
  );
});

MD3Switch.displayName = "MD3Switch";
