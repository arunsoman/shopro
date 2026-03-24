"use client";

import React, { useState, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (id: string) => void;
} | null>(null);

export function Tabs({ defaultValue, children, className }: { defaultValue: string; children: React.ReactNode; className?: string }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("space-y-6", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1 border-b border-(--sp-border) pb-px", className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = useContext(TabsContext);
  const isActive = ctx?.activeTab === value;
  
  return (
    <button
      onClick={() => ctx?.setActiveTab(value)}
      className={cn(
        "px-6 py-3 text-[12px] font-bold uppercase tracking-wider transition-all relative",
        isActive ? "text-violet-600" : "text-(--sp-text-3) hover:text-(--sp-text-1)",
        className
      )}
    >
      {children}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 animate-in fade-in zoom-in duration-300" />
      )}
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = useContext(TabsContext);
  if (ctx?.activeTab !== value) return null;
  return <div className={className}>{children}</div>;
}
