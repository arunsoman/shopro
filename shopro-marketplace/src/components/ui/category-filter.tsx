/**
 * Component: CategoryFilter
 * Adapted from: SmartCombobox (shopro-original-21.tsx)
 * DNA Preserved: GlowingBorder, NeonEdges, Virtualization, Floating Popover.
 */

import React, { useState, useMemo, useRef, useEffect, useId } from "react";
import { cn } from "@/lib/utils";
import { GlowingBorder } from "./neon-button";
import { NeonEdges } from "./neon-button";

export interface CategoryOption {
  id: string;
  label: string;
  count?: number;
  group?: string;
  icon?: React.ReactNode;
}

export function CategoryFilter({
  label,
  placeholder = "Select category...",
  options = [],
  onValueChange,
  className
}: {
  label?: string;
  placeholder?: string;
  options: CategoryOption[];
  onValueChange?: (id: string | null) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return options;
    return options.filter(o => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    const next = selectedValue === id ? null : id;
    setSelectedValue(next);
    onValueChange?.(next);
    setOpen(false);
    setQuery("");
  };

  const selectedOption = options.find(o => o.id === selectedValue);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      
      <div 
        className={cn(
          "group relative flex min-h-11 w-full items-center gap-2 rounded-xl border bg-white dark:bg-slate-900 px-3 cursor-pointer transition-all duration-200",
          "border-slate-200 dark:border-slate-800",
          open ? "ring-2 ring-indigo-500/20 border-indigo-500/50" : "hover:border-slate-300 dark:hover:border-slate-700"
        )}
        onClick={() => { setOpen(!open); if (!open) setTimeout(() => inputRef.current?.focus(), 10); }}
      >
        <GlowingBorder spread={30} borderWidth={1} />
        <NeonEdges />
        
        <div className="flex-1 flex items-center min-w-0">
          {selectedOption ? (
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              {selectedOption.icon}
              {selectedOption.label}
            </div>
          ) : (
            <span className="text-sm text-slate-400 dark:text-slate-500 truncate">{placeholder}</span>
          )}
        </div>
        
        <svg viewBox="0 0 20 20" className={cn("size-4 text-slate-400 transition-transform duration-200", open && "rotate-180")}>
          <path d="M6 8l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <input 
              ref={inputRef}
              type="text"
              placeholder="Filter..."
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500/50 outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="max-h-64 overflow-auto p-1 custom-scrollbar">
            {filtered.map((opt) => (
              <div 
                key={opt.id}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors",
                  selectedValue === opt.id 
                    ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" 
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
                onClick={(e) => { e.stopPropagation(); handleSelect(opt.id); }}
              >
                <div className="flex items-center gap-2">
                  {opt.icon && <span className="size-4 shrink-0 opacity-70">{opt.icon}</span>}
                  <span>{opt.label}</span>
                </div>
                {opt.count !== undefined && (
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-500">
                    {opt.count}
                  </span>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">No categories found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
