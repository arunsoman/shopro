import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Download,
  Eye,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IconTooltip } from "@/components/shared/IconTooltip";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";

interface Invoice {
  id: string;
  invoiceNumber: string;
  purchaseOrderId: string;
  invoiceDate: string;
  totalAmount: number;
  taxAmount: number;
  status: 'PENDING' | 'PAID' | 'REJECTED';
}

interface FulfilledPO {
  id: string;
  reference: string;
  restaurant: string;
  totalValue: number;
  fulfilledAt: string;
}

export default function SupplierInvoices() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<FulfilledPO | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ['supplier', 'invoices'],
    queryFn: () => api.get('/supplier/finance/invoices')
  });

  const { data: fulfilledPOs = [] } = useQuery<FulfilledPO[]>({
    queryKey: ['supplier', 'fulfilled-pos'],
    queryFn: () => api.get('/supplier/finance/pos/fulfilled')
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: (data: { poId: string, invoiceNumber: string, invoiceDate: string }) => 
      api.post('/supplier/finance/invoices', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', 'fulfilled-pos'] });
      setIsWizardOpen(false);
      setSelectedPO(null);
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 pt-12">
      <div className="max-w-[1280px] mx-auto space-y-12">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-emerald-500" />
              Invoices & <span className="text-emerald-500">Billing</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              Manage your billing, taxes, and compliance documents.
            </p>
          </div>
          
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="h-14 px-8 bg-emerald-600 text-white rounded-2xl font-bold flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus size={20} />
            Generate New Invoice
          </button>
        </header>

        {/* Filters & Actions */}
        <div className="flex items-center justify-between gap-6 overflow-x-auto pb-4">
          <div className="relative min-w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search invoice #, PO reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-3 placeholder:text-slate-400 font-medium focus:border-emerald-500 outline-none transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button className="h-14 px-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 font-bold flex items-center gap-2 hover:border-emerald-500 transition-all shadow-sm">
              <Filter size={18} />
              Filters
            </button>
            <button className="h-14 px-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 font-bold flex items-center gap-2 hover:border-emerald-500 transition-all shadow-sm">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Invoices List */}
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {invoices.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] p-24 text-center space-y-4"
              >
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <FileText size={40} />
                </div>
                <div className="space-y-1">
                  <p className="text-(--text-lg) font-bold text-slate-900 dark:text-white">No invoices generated yet</p>
                  <p className="text-slate-500 text-(--text-sm)">Start by generating an invoice from your fulfilled purchase orders.</p>
                </div>
              </motion.div>
            ) : (
              invoices.map((invoice, idx) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative overflow-hidden p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <FileText size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                        Invoice #{invoice.invoiceNumber}
                      </p>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                        Order {invoice.purchaseOrderId}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        Date: {new Date(invoice.invoiceDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12">
                    <div className="text-right">
                      <p className="text-(--text-2xs) text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Amount</p>
                      <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">
                        ₹{invoice.totalAmount.toLocaleString()}
                      </p>
                    </div>

                    <div className={cn(
                      "h-10 px-4 rounded-full flex items-center gap-2 font-bold text-(--text-xs)",
                      invoice.status === 'PAID' ? "bg-emerald-500/10 text-emerald-500" :
                      invoice.status === 'PENDING' ? "bg-amber-500/10 text-amber-500" :
                      "bg-rose-500/10 text-rose-500"
                    )}>
                      {invoice.status === 'PAID' ? <CheckCircle2 size={14} /> : 
                       invoice.status === 'PENDING' ? <Clock size={14} /> : 
                       <AlertCircle size={14} />}
                      {invoice.status}
                    </div>

                    <div className="flex items-center gap-2">
                       <IconTooltip label="View Details">
                         <button className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">
                           <Eye size={18} />
                         </button>
                       </IconTooltip>
                       <IconTooltip label="Download PDF">
                         <button className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">
                           <Download size={18} />
                         </button>
                       </IconTooltip>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Invoice Wizard Overlay */}
      <AnimatePresence>
        {isWizardOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md p-8 flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Invoice <span className="text-emerald-500">Generator</span></h2>
                  <p className="text-slate-500 font-medium text-sm">Choose a fulfilled order to create an invoice.</p>
                </div>
                <button 
                  onClick={() => setIsWizardOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all"
                >
                  <Plus className="rotate-45 text-slate-400" size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {!selectedPO ? (
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Orders ready for invoicing</p>
                    {fulfilledPOs.length === 0 ? (
                      <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-slate-400 font-bold">No fulfilled POs found.</p>
                      </div>
                    ) : (
                      fulfilledPOs.map(po => (
                        <button 
                          key={po.id}
                          onClick={() => setSelectedPO(po)}
                          className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent hover:border-emerald-500 rounded-2xl text-left transition-all flex items-center justify-between group"
                        >
                          <div>
                            <p className="text-emerald-500 font-bold text-(--text-xs)">{po.reference}</p>
                            <h4 className="text-(--text-lg) font-bold text-slate-900 dark:text-white">{po.restaurant}</h4>
                            <p className="text-slate-500 text-(--text-xs) mt-1 italic">Fulfilled: {new Date(po.fulfilledAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right flex items-center gap-6">
                            <div>
                              <p className="text-slate-400 text-(--text-xs) font-bold uppercase tracking-widest leading-none mb-1">Value</p>
                              <p className="text-(--text-lg) font-black text-slate-900 dark:text-white">₹{po.totalValue.toLocaleString()}</p>
                            </div>
                            <ChevronRight className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-6 bg-emerald-500/10 rounded-2xl border-2 border-emerald-500/20 flex items-center justify-between">
                       <div>
                         <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider">Selected Order</p>
                         <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedPO.reference}</h3>
                       </div>
                       <button 
                         onClick={() => setSelectedPO(null)}
                         className="text-emerald-500 font-bold text-(--text-xs) hover:underline"
                       >
                         Change PO
                       </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-(--text-xs) font-bold text-slate-500 uppercase tracking-widest">Invoice Number</label>
                        <input 
                          type="text" 
                          placeholder="e.g. INV-2024-001"
                          className="w-full h-14 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 font-bold outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-(--text-xs) font-bold text-slate-500 uppercase tracking-widest">Invoice Date</label>
                        <input 
                          type="date" 
                          defaultValue={new Date().toISOString().split('T')[0]}
                          className="w-full h-14 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 font-bold outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 space-y-4">
                       <h4 className="text-(--text-sm) font-bold text-slate-900 dark:text-white flex items-center gap-2">
                         <Calculator size={16} className="text-emerald-500" />
                         Tax Summary
                       </h4>
                       <div className="flex items-center justify-between text-(--text-sm)">
                         <span className="text-slate-500">Taxable Amount</span>
                         <span className="font-bold">₹{selectedPO.totalValue.toLocaleString()}</span>
                       </div>
                       <div className="flex items-center justify-between text-(--text-sm)">
                         <span className="text-slate-500">GST (5%)</span>
                         <span className="font-bold text-emerald-500">+(Custom Logic)</span>
                       </div>
                       <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                         <span className="font-bold text-slate-900 dark:text-white">Estimated Total</span>
                         <span className="text-(--text-xl) font-black text-emerald-500">₹{selectedPO.totalValue.toLocaleString()}</span>
                       </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <button 
                  disabled={!selectedPO || generateInvoiceMutation.isPending}
                  onClick={() => generateInvoiceMutation.mutate({ 
                    poId: selectedPO?.id || "", 
                    invoiceNumber: "INV-" + Math.floor(Math.random() * 10000), 
                    invoiceDate: new Date().toISOString() 
                  })}
                  className="w-full h-14 bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-(--text-lg) flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
                >
                  {generateInvoiceMutation.isPending ? "Generating..." : "Finalize & Generate Invoice"}
                  {!generateInvoiceMutation.isPending && <ArrowRight size={20} />}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Calculator(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 10h.01" />
      <path d="M12 14h.01" />
      <path d="M8 14h.01" />
      <path d="M12 18h.01" />
      <path d="M8 18h.01" />
    </svg>
  );
}
