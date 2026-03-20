import React, { useState, useMemo } from 'react';
import { ShoppingCart, Search, Filter, Plus, Info, Check, Package, Leaf, Flame, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/store/cart-store';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

// --- DNA PRIMITIVES (Required by Shopro UI Kit) ---
const SPRING = { type: "spring" as const, stiffness: 500, damping: 30, mass: 1 };
const GLOW_GRADIENT = `radial-gradient(circle, #dd7bbb 10%, #dd7bbb00 20%), radial-gradient(circle at 40% 40%, #d79f1e 5%, #d79f1e00 15%), radial-gradient(circle at 60% 60%, #5a922c 10%, #5a922c00 20%), radial-gradient(circle at 40% 60%, #4c7894 10%, #4c789400 20%), repeating-conic-gradient(from 236.84deg at 50% 50%, #dd7bbb 0%, #d79f1e calc(25% / 5), #5a922c calc(50% / 5), #4c7894 calc(75% / 5), #dd7bbb calc(100% / 5))`;

function GlowingBorder({ spread = 30, borderWidth = 1 }: { spread?: number; borderWidth?: number }) {
  return (
    <div style={{ "--spread": spread, "--start": "0", "--active": "0", "--glowingeffect-border-width": `${borderWidth}px`, "--repeating-conic-gradient-times": "5", "--gradient": GLOW_GRADIENT } as React.CSSProperties}
      className="pointer-events-none absolute inset-0 rounded-[inherit]">
      <div className={cn("glow rounded-[inherit]", 'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]', "after:[border:var(--glowingeffect-border-width)_solid_transparent]", "after:[background:var(--gradient)] after:[background-attachment:fixed]", "after:opacity-[var(--active)] after:transition-opacity after:duration-300", "after:[mask-clip:padding-box,border-box] after:[mask-composite:intersect]", "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]")} />
    </div>
  );
}

function NeonEdges({ active = false, color = "blue" }: { active?: boolean; color?: "blue" | "violet" | "green" }) {
  const via = color === "violet" ? "via-violet-500" : color === "green" ? "via-green-400" : "via-blue-500";
  return (<>
    <span className={cn("pointer-events-none absolute h-px inset-x-0 top-0 bg-gradient-to-r w-3/4 mx-auto from-transparent to-transparent transition-all duration-500 ease-in-out", via, active ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100")} />
    <span className={cn("pointer-events-none absolute inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent to-transparent transition-opacity duration-500 ease-in-out", via, active ? "opacity-30" : "opacity-0 group-hover:opacity-30 group-focus-within:opacity-30")} />
  </>);
}

// --- MOCK DATA ---
const CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'fresh', label: 'Fresh Produce', icon: <Leaf className="w-4 h-4" /> },
  { id: 'meat', label: 'Meat & Poultry', icon: <Flame className="w-4 h-4" /> },
  { id: 'dry', label: 'Dry Goods', icon: <Package className="w-4 h-4" /> },
  { id: 'beverages', label: 'Beverages', icon: <Zap className="w-4 h-4" /> },
];

const PRODUCTS = [
  { id: 'p1', name: 'Fresh Organic Roma Tomatoes', category: 'fresh', unit: 'kg', stock: 'In Stock', supplier: 'GreenValley Farms', image: '🍅', tags: ['Organic', 'Fresh'] },
  { id: 'p2', name: 'Premium Wagyu Beef Ribeye', category: 'meat', unit: 'kg', stock: 'Low Stock', supplier: 'Prime Cuts Co.', image: '🥩', tags: ['Premium', 'Halal'] },
  { id: 'p3', name: 'Artisan Sourdough Flour', category: 'dry', unit: '5kg bag', stock: 'In Stock', supplier: 'Baker\'s Choice', image: '🌾', tags: ['Artisan'] },
  { id: 'p4', name: 'Espresso Roast Coffee Beans', category: 'dry', unit: 'kg', stock: 'In Stock', supplier: 'RoastMasters', image: '☕', tags: ['Best Seller'] },
  { id: 'p5', name: 'Extra Virgin Olive Oil', category: 'dry', unit: 'L', stock: 'In Stock', supplier: 'Mediterranean Gold', image: '🫒', tags: ['Imported'] },
  { id: 'p6', name: 'Local Honey Crisp Apples', category: 'fresh', unit: 'kg', stock: 'In Stock', supplier: 'GreenValley Farms', image: '🍎', tags: ['Local'] },
];

// --- COMPONENTS ---

const ProductCard = ({ product }: { product: typeof PRODUCTS[0] }) => {
  const { addItem, items } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const inCartCount = items.find(i => i.productId === product.id)?.quantity || 0;

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      productId: product.id,
      productName: product.name,
      unit: product.unit,
      quantity: 1,
      supplierName: product.supplier,
      image: product.image
    });
    setTimeout(() => setIsAdding(false), 800);
  };

  return (
    <motion.div 
      layout
      className={cn(
        "group relative p-5 rounded-2xl overflow-hidden transition-all duration-300",
        "border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm",
        "hover:shadow-2xl hover:-translate-y-1 will-change-transform"
      )}
    >
      <GlowingBorder spread={40} borderWidth={1} />
      
      {/* Dot Pattern Overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:8px_8px] pointer-events-none" />

      <div className="relative flex flex-col h-full">
        {/* Header: Icon/Image + Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-3xl transition-transform duration-300 group-hover:scale-110">
            {product.image}
          </div>
          <div className={cn(
            "text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border",
            product.stock === 'In Stock' 
              ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
              : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
          )}>
            {product.stock}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-slate-900 dark:text-white leading-tight">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Supplied by <span className="text-slate-700 dark:text-slate-300 font-medium">{product.supplier}</span>
          </p>
          
          <div className="flex flex-wrap gap-1.5 pt-1">
            {product.tags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Unit: {product.unit}</span>
          </div>

          <button
            onClick={handleAddToCart}
            className={cn(
              "group/btn relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
              inCartCount > 0 
                ? "bg-violet-600 text-white" 
                : "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
            )}
          >
            <NeonEdges color={inCartCount > 0 ? "violet" : "blue"} />
            <AnimatePresence mode="wait">
              {isAdding ? (
                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={SPRING}>
                  <Check className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={SPRING} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>{inCartCount > 0 ? `${inCartCount} in Cart` : 'Add'}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { getItemCount } = useCart();
  const navigate = useNavigate();

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Product Catalog</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Discover fresh ingredients and supplies for your kitchen.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <GlowingBorder spread={20} />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "group relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 border",
              selectedCategory === cat.id
                ? "bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-500/25"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            )}
          >
            <NeonEdges color={selectedCategory === cat.id ? "violet" : "blue"} />
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl">
            🔍
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No products found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or search query.</p>
          </div>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="text-violet-600 font-medium hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Floating Cart FAB */}
      <AnimatePresence>
        {getItemCount() > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 right-8 z-[100]"
          >
            <button 
              onClick={() => navigate('/restaurant/orders/new')}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-violet-600 text-white shadow-2xl shadow-violet-500/40 hover:scale-105 transition-transform"
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-white text-violet-600 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-violet-600">
                  {getItemCount()}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-wider font-bold opacity-80">View Order List</p>
                <p className="text-lg font-bold">{getItemCount()} Items</p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
