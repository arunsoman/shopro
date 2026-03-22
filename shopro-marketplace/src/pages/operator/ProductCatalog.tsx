"use client";

import React from "react";
import { Search, Plus, Package, BookOpen, ExternalLink, Download, Info, Trash2, Edit3, BarChart3, TrendingUp, TrendingDown, RefreshCw, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";
import { SecureOverlay } from "@/components/SecureOverlay";
import { IconTooltip } from "@/components/shared/IconTooltip";

/**
 * OP-17 — Product Catalog Management
 * Purpose: Master index of all SKU variants.
 * DNA: High-density list, category grouping, price indexing.
 */

interface ProductCatalogItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  status: string;
}

export default function ProductCatalog() {
  const { data: products = [], isLoading } = useQuery<ProductCatalogItem[]>({
    queryKey: ["operator-product-catalog"],
    queryFn: async () => {
      const resp = await api.get("operator/catalog/products");
      return resp.data;
    }
  });

  return (
    <SecureOverlay>
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-(--sp-border) mt-4">
        <div className="space-y-1">
          <h1 className="text-[24px] font-medium tracking-tight text-(--sp-text-0)">Product Registry</h1>
          <p className="text-[13px] text-(--sp-text-2) flex items-center gap-2">
             <Package className="w-4 h-4 text-emerald-500" />
             Managing global SKUs and cross-supplier price variants.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative group w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--sp-text-3) group-focus-within:text-emerald-500 transition-all" />
            <input 
              type="text" 
              placeholder="Search SKU..." 
              className="h-9 pl-9 pr-4 bg-(--sp-bg-2) rounded-sm text-[13px] text-(--sp-text-0) placeholder:text-(--sp-text-3) outline-none border border-(--sp-border) focus:border-emerald-500/50 transition-all w-full shadow-sm"
            />
          </div>
          <button className="h-9 px-4 bg-emerald-500 text-white rounded-sm text-[13px] font-medium flex items-center gap-2 hover:opacity-90 active:scale-[0.97] transition-all shadow-sm">
            <Plus size={16} /> New SKU
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active SKUs", value: products.length.toString(), icon: Package, color: "emerald" },
          { label: "Categories", value: "18", icon: BookOpen, color: "blue" },
          { label: "Price Volatility", value: "Medium", icon: BarChart3, color: "amber" },
          { label: "Sourcing Gaps", value: "4 Nodes", icon: Info, color: "rose" },
        ].map((stat) => (
          <div key={stat.label} className="bg-(--sp-bg-2) border border-(--sp-border) p-4 rounded-md flex items-center gap-4 shadow-sm hover:border-emerald-500/20 hover:bg-(--sp-bg-3) transition-all">
            <div className={cn("w-10 h-10 rounded-sm flex items-center justify-center border transition-all", 
              stat.color === "emerald" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
              stat.color === "blue" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
              stat.color === "amber" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
              "bg-rose-500/10 text-rose-500 border-rose-500/20"
            )}>
              <stat.icon size={20} />
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] text-(--sp-text-3) font-semibold uppercase tracking-[0.06em] mb-0.5">{stat.label}</p>
              <p className="text-[20px] font-medium text-(--sp-text-0) leading-none tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-(--sp-bg-2) border border-(--sp-border) rounded-md shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b border-(--sp-border) flex flex-col md:flex-row md:items-center justify-between gap-4 bg-(--sp-bg-1)/30">
           <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
              <button className="text-[13px] font-medium text-emerald-500 border-b-2 border-emerald-500 pb-1">All Products</button>
              <button className="text-[13px] font-medium text-(--sp-text-3) hover:text-(--sp-text-0) pb-1 transition-all">By Demand</button>
              <button className="text-[13px] font-medium text-(--sp-text-3) hover:text-(--sp-text-0) pb-1 transition-all">Untracked</button>
           </div>
           <div className="flex items-center gap-2">
              <button className="h-8 px-4 bg-(--sp-bg-3) text-(--sp-text-1) rounded-sm text-[12px] font-medium hover:text-(--sp-text-0) transition-all border border-(--sp-border) shadow-sm uppercase tracking-[0.04em]">
                Bulk Edit
              </button>
              <button className="w-8 h-8 rounded-sm bg-(--sp-bg-2) border border-(--sp-border) flex items-center justify-center text-(--sp-text-3) hover:text-emerald-500 transition-all shadow-sm">
                <Download size={16} />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-(--sp-bg-1)/30 border-b border-(--sp-border)">
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-(--sp-text-3)">Product Details</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-(--sp-text-3)">Category</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-(--sp-text-3)">Hub Signals</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-(--sp-text-3)">Market Delta</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-(--sp-text-3)">Status</th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--sp-border)">
               {isLoading ? (
                   Array(5).fill(0).map((_, i) => (
                       <tr key={i} className="animate-pulse">
                           <td colSpan={6} className="px-6 py-4 h-16 bg-(--sp-bg-1)/20" />
                       </tr>
                   ))
               ) : products.map((prod) => (
                <tr key={prod.id} className="group hover:bg-(--sp-bg-3) transition-all">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-sm bg-(--sp-bg-3) text-emerald-500 flex items-center justify-center border border-(--sp-border) shadow-sm">
                        <Package size={16} />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[13px] font-medium text-(--sp-text-0)">{prod.name}</p>
                        <p className="text-[10px] text-(--sp-text-3) font-[family-name:var(--font-geist-mono)] uppercase">{prod.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-[11px] text-(--sp-text-1) px-2 py-0.5 bg-(--sp-bg-3) rounded-[4px] border border-(--sp-border) uppercase font-medium">
                      {prod.category}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                       <span className="text-[15px] font-medium text-(--sp-text-0)">12</span>
                       <span className="text-[10px] text-(--sp-text-3) font-bold uppercase tracking-[0.06em]">Vendors</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                       <span className="text-[15px] font-medium text-(--sp-text-0)">₹{prod.price}</span>
                       <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 uppercase">Stable</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className={cn(
                      "px-2 py-0.5 rounded-[4px] text-[10px] font-bold transition-all border shadow-sm inline-block uppercase tracking-[0.06em]",
                      prod.status === 'Active' || prod.status === 'ACTIVE' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-(--sp-bg-3) text-(--sp-text-3) border-(--sp-border)'
                    )}>
                      {prod.status}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="w-8 h-8 rounded-sm bg-(--sp-bg-3) text-(--sp-text-3) hover:text-emerald-500 transition-all border border-(--sp-border) shadow-sm">
                        <Edit3 size={14} />
                      </button>
                      <button className="w-8 h-8 rounded-sm bg-(--sp-bg-3) text-(--sp-text-3) hover:text-(--sp-red) transition-all border border-(--sp-border) shadow-sm">
                        <Trash2 size={14} />
                      </button>
                      <div className="w-px h-5 bg-(--sp-border) mx-1" />
                      <button className="w-8 h-8 rounded-sm bg-emerald-500 text-white shadow-sm flex items-center justify-center hover:opacity-90 transition-all">
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </SecureOverlay>
  );
}
