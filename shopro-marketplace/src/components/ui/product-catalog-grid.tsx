/**
 * Component: ProductCatalogGrid
 * Adapted from: BentoGrid (shopro-original-21.tsx)
 * DNA Preserved: Bento Card structure, Hover Lift, Dot pattern, Gradient borders.
 */

import { cn } from "@/lib/utils";
import { GlowingBorder } from "./neon-button";
import { NeonEdges } from "./neon-button";

export interface ProductItem {
  id: string;
  name: string;
  price: string | number;
  supplier: string;
  image?: string;
  tags?: string[];
  isNew?: boolean;
}

export function ProductCatalogGrid({ products }: { products: ProductItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <div key={product.id} className={cn(
          "group relative p-3 rounded-2xl overflow-hidden transition-all duration-300 will-change-transform",
          "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900",
          "hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.02)]",
          "hover:-translate-y-1"
        )}>
          <GlowingBorder spread={50} borderWidth={1} />
          <NeonEdges />
          
          <div className="absolute inset-0 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[length:6px_6px] opacity-0 group-hover:opacity-100" />
          
          <div className="relative space-y-3">
            {/* Image Placeholder or Actual Image */}
            <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                  <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              {product.isNew && (
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded shadow-lg">NEW</span>
              )}
            </div>
            
            <div className="space-y-1 px-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                  {product.name}
                </h3>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {typeof product.price === 'number' ? `$${product.price}` : product.price}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{product.supplier}</p>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {product.tags?.slice(0, 2).map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <button className="w-full py-2 mt-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
