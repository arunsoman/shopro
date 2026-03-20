"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Plus, Package, BookOpen, ExternalLink, Download, Info, Trash2, Edit3, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * OP-17 — Product Catalog Management
 * Purpose: Master index of all SKU variants.
 * DNA: High-density list, category grouping, price indexing.
 */

const PRODUCTS = [
  { id: "SKU-901", name: "Premium Avocado", category: "Produce", suppliers: 12, avgPrice: 180, trend: "+4%", status: "ACTIVE" },
  { id: "SKU-905", name: "Organic Kale", category: "Produce", suppliers: 8, avgPrice: 65, trend: "-2%", status: "ACTIVE" },
  { id: "SKU-882", name: "Almond Milk (Unsweetened)", category: "Dairy", suppliers: 5, avgPrice: 210, trend: "Stable", status: "ACTIVE" },
  { id: "SKU-774", name: "Cage-Free Eggs (Dozen)", category: "Dairy", suppliers: 15, avgPrice: 120, trend: "+12%", status: "REVIEW_NEEDED" },
  { id: "SKU-661", name: "Whole Wheat Flour (5kg)", category: "Grains", suppliers: 4, avgPrice: 450, trend: "Stable", status: "ACTIVE" },
];

export default function ProductCatalog() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Product Master Registry</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Managing {PRODUCTS.length} global SKUs and cross-supplier price variants.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search Global SKU..." 
              className="h-10 pl-9 pr-4 bg-white dark:bg-slate-900 rounded-xl text-xs ring-1 ring-slate-200 dark:ring-slate-800 outline-none focus:ring-2 focus:ring-violet-500 transition-all w-64 shadow-sm"
            />
          </div>
          <button className="h-10 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
            <Plus size={14} /> NEW SKU
          </button>
        </div>
      </div>

      {/* Analytics DNA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Active SKUs", value: "482", icon: Package, color: "blue" },
          { label: "Categories", value: "18", icon: BookOpen, color: "violet" },
          { label: "Price Volatility", value: "Medium", icon: BarChart3, color: "amber" },
          { label: "Sourcing Gaps", value: "4", icon: Info, color: "rose" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl ring-1 ring-slate-100 dark:ring-slate-800 flex items-center gap-4">
            <div className={cn("p-3 rounded-2xl", 
              stat.color === "blue" ? "bg-blue-500/10 text-blue-500" :
              stat.color === "violet" ? "bg-violet-500/10 text-violet-500" :
              stat.color === "amber" ? "bg-amber-500/10 text-amber-500" :
              "bg-rose-500/10 text-rose-500"
            )}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Master List Table */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <div className="flex items-center gap-6">
             <button className="text-sm font-bold text-violet-500 border-b-2 border-violet-500 pb-1">All Products</button>
             <button className="text-sm font-bold text-slate-400 hover:text-slate-600 pb-1 transition-colors">By Demand</button>
             <button className="text-sm font-bold text-slate-400 hover:text-slate-600 pb-1 transition-colors">Untracked</button>
           </div>
           <div className="flex items-center gap-2">
             <button className="h-8 px-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors">
               BULK EDIT PRICING
             </button>
             <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
               <Download size={18} />
             </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                <th className="p-6">Product Details</th>
                <th className="p-6">Category</th>
                <th className="p-6">Active Suppliers</th>
                <th className="p-6">Avg Market Price</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {PRODUCTS.map((prod) => (
                <tr key={prod.id} className="group hover:bg-white dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-violet-500 transition-colors">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{prod.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {prod.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{prod.category}</span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-black text-slate-900 dark:text-white">{prod.suppliers}</span>
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Vendors</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                       <span className="text-sm font-black text-slate-900 dark:text-white">₹{prod.avgPrice}</span>
                       <span className={cn(
                         "text-[9px] font-black px-1.5 py-0.5 rounded",
                         prod.trend.includes("+") ? "bg-rose-100 text-rose-600" : prod.trend === "Stable" ? "bg-slate-100 text-slate-500" : "bg-green-100 text-green-600"
                       )}>{prod.trend}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <StatusBadge status={prod.status as any} />
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-violet-500 transition-all">
                        <Edit3 size={16} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all">
                        <Trash2 size={16} />
                      </button>
                      <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-2" />
                      <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 transition-all">
                        <ExternalLink size={16} />
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
  );
}
