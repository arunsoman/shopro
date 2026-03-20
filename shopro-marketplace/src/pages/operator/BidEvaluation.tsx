import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlowingBorder } from "@/components/ui/neon-button";
import { ArrowLeft, Gavel, Award, TrendingDown, Star, Clock, ChevronRight, CheckCircle2, AlertCircle, Info, Settings, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";

/**
 * OP-08 — Bid Evaluation & Award
 * Purpose: Matrix-view of competing quotes.
 * DNA: Side-by-side comparison cards, winner badge, ranking highlights.
 */

const INITIAL_QUOTES = [
  { 
    id: "Q-101", 
    supplier: "Golden Harvest", 
    price: 18200, 
    rating: 4.8, 
    delivery: "Tomorrow, 2PM", 
    isWinner: true, 
    rank: 1,
    pros: ["Lowest Price", "High Reliability"],
    cons: [],
    status: "PENDING"
  },
  { 
    id: "Q-102", 
    supplier: "Fresh Express", 
    price: 19500, 
    rating: 4.2, 
    delivery: "Today, Evening", 
    isWinner: false, 
    rank: 2,
    pros: ["Fastest Delivery"],
    cons: ["Higher Price"],
    status: "PENDING"
  },
  { 
    id: "Q-103", 
    supplier: "Imperial Grains", 
    price: 21000, 
    rating: 4.9, 
    delivery: "Mar 22", 
    isWinner: false, 
    rank: 3,
    pros: ["Premium Grade"],
    cons: ["Highest Price", "Slower Fulfillment"],
    status: "PENDING"
  },
];

export default function BidEvaluation() {
  const navigate = useNavigate();
  const { bidId } = useParams();
  const [quotes, setQuotes] = useState(INITIAL_QUOTES);
  const [awardingId, setAwardingId] = useState<string | null>(null);
  const [isCounterOfferOpen, setIsCounterOfferOpen] = useState(false);
  const [sortMode, setSortMode] = useState<"price" | "rating" | "delivery">("price");

  const sortedQuotes = [...quotes].sort((a, b) => {
    if (sortMode === "price") return a.price - b.price;
    if (sortMode === "rating") return b.rating - a.rating;
    return 0; // Delivery sorting would need date parsing
  });

  const awardBid = (id: string) => {
    setQuotes(quotes.map(q => ({
      ...q,
      status: q.id === id ? "AWARDED" : "REJECTED"
    })));
    setAwardingId(id);
    setTimeout(() => navigate(`/operator/po/sub-pos/${bidId}`), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div className="space-y-4">
          <button 
            onClick={() => navigate("/operator/po/inbox")}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-violet-500 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">Bid Evaluation: {bidId}</h1>
              <div className="px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-[10px] font-bold text-violet-600 uppercase tracking-widest">3 Quotes Received</div>
            </div>
            <p className="text-slate-500 font-medium">Bidding loop for <span className="text-slate-900 dark:text-white font-bold">Mama’s Italian Bistro</span> fulfillment.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center gap-2 text-xs font-bold">
            <Clock size={16} />
            BID CLOSES IN: 04h 12m
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Lowest Quote", value: "₹18,200", icon: TrendingDown, color: "green" },
          { label: "Quote Spread", value: "₹2,800", icon: Gavel, color: "violet" },
          { label: "Preferred Supplier", value: "Golden Harvest", icon: Award, color: "blue" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl ring-1 ring-slate-100 dark:ring-slate-800 flex items-center gap-4">
            <div className={cn("p-3 rounded-2xl", 
              stat.color === "green" ? "bg-green-500/10 text-green-500" :
              stat.color === "violet" ? "bg-violet-500/10 text-violet-500" :
              "bg-blue-500/10 text-blue-500"
            )}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Evaluation Workspace Controls DNA */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-800">
         <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sort By:</span>
            {(["price", "rating", "delivery"] as const).map((mode) => (
              <button 
                key={mode}
                onClick={() => setSortMode(mode)}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  sortMode === mode ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {mode}
              </button>
            ))}
         </div>
         
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
              <CheckCircle2 size={14} /> Auto-award Enabled
            </div>
            <button className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-violet-500 transition-all">
              <Settings size={18} />
            </button>
         </div>
      </div>

      {/* Quote Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {sortedQuotes.map((quote, i) => (
          <motion.div
            key={quote.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "group relative",
              quote.status === "REJECTED" && "opacity-40 grayscale pointer-events-none"
            )}
          >
            {quote.isWinner && quote.status === "PENDING" && <GlowingBorder spread={50} />}
            <div className={cn(
              "relative z-10 bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 ring-1 transition-all h-full flex flex-col",
              quote.isWinner && quote.status === "PENDING" ? "ring-violet-500 shadow-2xl shadow-violet-500/10" : 
              quote.status === "AWARDED" ? "ring-green-500 bg-green-50/50 dark:bg-green-900/10" :
              "ring-slate-200 dark:ring-slate-800 shadow-sm"
            )}>
               <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center font-black text-xs">
                    {quote.status === "AWARDED" ? <CheckCircle2 className="text-green-500" /> : `#${quote.rank}`}
                  </div>
                  {quote.status === "AWARDED" ? (
                    <div className="bg-green-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                      Awarded
                    </div>
                  ) : quote.isWinner && (
                    <div className="bg-violet-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">
                      Best Value
                    </div>
                  )}
               </div>

               <div className="space-y-6 flex-1">
                 <div>
                   <h3 className="text-xl font-bold">{quote.supplier}</h3>
                   <div className="flex items-center gap-2 mt-1">
                     <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                       <Star size={12} fill="currentColor" /> {quote.rating}
                     </span>
                     <span className="text-slate-300">•</span>
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Verified Supplier</span>
                   </div>
                 </div>

                 <div className="space-y-1">
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Quote Price</p>
                   <p className="text-3xl font-black text-violet-500 font-mono">₹{quote.price.toLocaleString()}</p>
                 </div>

                 <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>Delivery Date</span>
                      <span className="text-slate-900 dark:text-white font-bold">{quote.delivery}</span>
                    </div>
                    <div className="space-y-2">
                       {quote.pros.map(pro => (
                         <div key={pro} className="flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase tracking-tighter">
                           <CheckCircle2 size={12} /> {pro}
                         </div>
                       ))}
                       {quote.cons.map(con => (
                         <div key={con} className="flex items-center gap-2 text-[10px] font-bold text-rose-500 uppercase tracking-tighter">
                           <AlertCircle size={12} /> {con}
                         </div>
                       ))}
                    </div>
                 </div>
               </div>

               <button 
                  onClick={() => awardBid(quote.id)}
                  disabled={quote.status !== "PENDING"}
                  className={cn(
                    "mt-8 w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                    quote.status === "AWARDED" ? "bg-green-600 text-white" :
                    quote.isWinner 
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30 hover:scale-105 active:scale-95" 
                      : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900"
                  )}
               >
                 {quote.status === "AWARDED" ? "FULFILLMENT SYNCED" : (quote.isWinner ? "AWARD BID" : "SELECT QUOTE")}
               </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comparison Drawer Shadow */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] flex items-center justify-between gap-6 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
           <Info size={20} className="text-violet-500" />
           <p className="text-sm text-slate-500">Need specific adjustments? You can send a counter-offer to any supplier before final award.</p>
        </div>
        <button 
          onClick={() => setIsCounterOfferOpen(true)}
          className="text-sm font-bold text-violet-500 hover:underline flex items-center gap-1"
        >
          Open Counter-Offer Wizard <ChevronRight size={16} />
        </button>
      </div>

      {/* Counter Offer Modal */}
      <AnimatePresence>
        {isCounterOfferOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCounterOfferOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden ring-1 ring-white/10"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold">Counter-Offer Wizard</h3>
                <p className="text-sm text-slate-500 tracking-tight mt-1">Negotiate terms with <span className="text-violet-500 font-bold">Golden Harvest</span></p>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500 uppercase">Target Price Reduction</span>
                    <input type="text" defaultValue="5%" className="w-16 bg-transparent text-right font-black text-violet-500 focus:outline-none" />
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500 uppercase">Early Delivery (HRS)</span>
                    <input type="text" defaultValue="-2h" className="w-16 bg-transparent text-right font-black text-violet-500 focus:outline-none" />
                  </div>
                </div>
                <button 
                  onClick={() => setIsCounterOfferOpen(false)}
                  className="w-full h-12 bg-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-violet-500/20"
                >
                  SEND COUNTER OFFER
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
