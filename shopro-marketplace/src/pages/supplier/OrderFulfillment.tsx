import React, { useState } from "react";
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Upload,
  FileCheck,
  MoreVertical,
  XCircle,
  ArrowRight,
  Search,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type FulfillmentStatus = 'PENDING_ACK' | 'PREPARING' | 'DISPATCHED' | 'DELIVERED' | 'PARTIAL';

interface SubOrder {
  id: string;
  orderNumber: string;
  restaurantName: string;
  items: number;
  totalValue: number;
  createdAt: string;
  status: FulfillmentStatus;
  priority: 'High' | 'Normal';
}

const MOCK_SUB_ORDERS: SubOrder[] = [
  {
    id: "sub_1",
    orderNumber: "PO-9021-A",
    restaurantName: "The Gourmet Kitchen",
    items: 12,
    totalValue: 450.00,
    createdAt: "2024-03-20T10:30:00Z",
    status: 'PENDING_ACK',
    priority: 'High'
  },
  {
    id: "sub_2",
    orderNumber: "PO-9022-B",
    restaurantName: "Urban Bistro",
    items: 5,
    totalValue: 125.50,
    createdAt: "2024-03-20T11:15:00Z",
    status: 'PREPARING',
    priority: 'Normal'
  },
  {
    id: "sub_3",
    orderNumber: "PO-8995-C",
    restaurantName: "Skyline Lounge",
    items: 8,
    totalValue: 210.00,
    createdAt: "2024-03-19T09:00:00Z",
    status: 'DISPATCHED',
    priority: 'Normal'
  }
];

export default function OrderFulfillment() {
  const [orders, setOrders] = useState<SubOrder[]>(MOCK_SUB_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<SubOrder | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPartialModal, setShowPartialModal] = useState(false);

  const updateStatus = (orderId: string, nextStatus: FulfillmentStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  const handleFileUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      if (selectedOrder) updateStatus(selectedOrder.id, 'DISPATCHED');
    }, 2000);
  };

  const currentStatusIndex = (status: FulfillmentStatus) => {
    switch(status) {
      case 'PENDING_ACK': return 0;
      case 'PREPARING': return 1;
      case 'DISPATCHED': return 2;
      case 'DELIVERED': return 3;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="text-indigo-500" />
            Order Fulfillment
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your outgoing shipments and track delivery status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors h-4 w-4" />
             <input 
               placeholder="Search orders..." 
               className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 w-64 transition-all"
             />
          </div>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <Filter className="h-5 w-5 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-250px)]">
        {/* Order List */}
        <div className="lg:col-span-4 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedOrder(order)}
              className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md h-[120px] flex flex-col justify-between",
                selectedOrder?.id === order.id 
                  ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-500/5 shadow-indigo-500/10" 
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{order.orderNumber}</span>
                    {order.priority === 'High' && (
                       <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] uppercase font-bold rounded">High</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[150px]">{order.restaurantName}</p>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                  order.status === 'PENDING_ACK' ? "bg-amber-100 text-amber-700 bg-opacity-50" :
                  order.status === 'PREPARING' ? "bg-blue-100 text-blue-700 bg-opacity-50" :
                  "bg-green-100 text-green-700 bg-opacity-50"
                )}>
                  {order.status.replace('_', ' ')}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Package size={14} />
                  <span>{order.items} Items</span>
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-300">₹{order.totalValue.toFixed(2)}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fulfillment Workspace */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          {selectedOrder ? (
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedOrder.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col p-8"
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-bold dark:text-white">{selectedOrder.orderNumber}</h2>
                    <p className="text-slate-500 flex items-center gap-2 mt-1">
                      <Clock size={14} /> Received on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <MoreVertical size={20} className="text-slate-400" />
                  </button>
                </div>

                {/* Timeline Visualizer */}
                <div className="relative flex justify-between mb-12 px-4">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2" />
                  <div 
                    className="absolute top-1/2 left-0 h-0.5 bg-indigo-500 -translate-y-1/2 transition-all duration-700" 
                    style={{ width: `${(currentStatusIndex(selectedOrder.status) / 3) * 100}%` }}
                  />
                  
                  {['Acknowledge', 'Prepare', 'Dispatch', 'Deliver'].map((step, idx) => {
                    const isActive = idx <= currentStatusIndex(selectedOrder.status);
                    const isCurrent = idx === currentStatusIndex(selectedOrder.status);
                    
                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                          isActive 
                            ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                        )}>
                          {isActive ? <CheckCircle2 size={18} /> : <span>{idx + 1}</span>}
                        </div>
                        <span className={cn(
                          "text-xs font-bold uppercase tracking-wider",
                          isActive ? "text-indigo-500" : "text-slate-400"
                        )}>{step}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Action Content */}
                <div className="flex-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-8 flex flex-col items-center justify-center text-center">
                  {selectedOrder.status === 'PENDING_ACK' && (
                    <div className="max-w-md space-y-6">
                      <div className="h-16 w-16 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="text-amber-600 dark:text-amber-400 h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold dark:text-white">New Order Available</h3>
                        <p className="text-slate-500 mt-2">Acknowledge this order to begin the preparation process. Once acknowledged, the restaurant will be notified.</p>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => updateStatus(selectedOrder.id, 'PREPARING')}
                          className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                        >
                          Acknowledge Order <ArrowRight size={18} />
                        </button>
                        <button 
                          onClick={() => setShowPartialModal(true)}
                          className="px-6 py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-white dark:hover:bg-slate-900 transition-all flex items-center gap-2"
                        >
                          <XCircle size={18} /> Partial
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedOrder.status === 'PREPARING' && (
                    <div className="max-w-md space-y-6">
                      <div className="h-16 w-16 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                        <Package className="text-blue-600 dark:text-blue-400 h-8 w-8 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold dark:text-white">Prepare for Shipment</h3>
                        <p className="text-slate-500 mt-2">Please upload a proof of delivery or manifest to mark this order as dispatched.</p>
                      </div>
                      <div 
                        onClick={handleFileUpload}
                        className={cn(
                          "w-full border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center gap-3",
                          isUploading 
                            ? "border-indigo-500 bg-indigo-50/10" 
                            : "border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50"
                        )}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-4">
                            <div className="h-2 w-48 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2 }}
                                className="h-full bg-indigo-500"
                              />
                            </div>
                            <span className="text-sm font-medium text-indigo-500">Uploading Manifest...</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="text-slate-400 h-10 w-10" />
                            <div className="space-y-1">
                              <p className="text-sm font-bold dark:text-white">Click to upload or drag & drop</p>
                              <p className="text-xs text-slate-500">Invoice, Waybill or Shipment Manifest (PDF, JPG)</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedOrder.status === 'DISPATCHED' && (
                    <div className="max-w-md space-y-6">
                      <div className="h-16 w-16 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                        <FileCheck className="text-green-600 dark:text-green-400 h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold dark:text-white">Order in Transit</h3>
                        <p className="text-slate-500 mt-2">The order has been dispatched. Track the shipment or communicate with the restaurant if needed.</p>
                      </div>
                      <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 px-8 rounded-xl transition-all hover:opacity-90">
                        View Delivery Details
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-full">
                <Package size={48} className="opacity-20" />
              </div>
              <p className="text-lg font-medium">Select an order to manage fulfillment</p>
            </div>
          )}
        </div>
      </div>

      {/* Partial Fulfillment Modal */}
      <AnimatePresence>
        {showPartialModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPartialModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-[500px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 mx-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold dark:text-white">Partial Fulfillment</h3>
                    <p className="text-slate-500 mt-1">Select items or quantites that cannot be fulfilled.</p>
                  </div>
                  <button onClick={() => setShowPartialModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                    <XCircle size={24} />
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                    <p className="text-sm font-bold dark:text-white mb-3">Reason for Partial Fulfillment</p>
                    <select className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500/20">
                      <option>Stock Shortage</option>
                      <option>Quality Issues</option>
                      <option>Logistics Delay</option>
                    </select>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-500/5 rounded-xl border border-red-100 dark:border-red-500/20">
                    <div className="flex gap-2">
                       <AlertCircle className="text-red-500 h-4 w-4 shrink-0 mt-0.5" />
                       <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                         Reporting a partial fulfillment may impact your supplier rating. Please ensure accurate stock counts for future bids.
                       </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                        if (selectedOrder) updateStatus(selectedOrder.id, 'PREPARING');
                        setShowPartialModal(false);
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/25"
                  >
                    Confirm Partial ACK
                  </button>
                  <button 
                    onClick={() => setShowPartialModal(false)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold py-3 rounded-xl hover:opacity-90"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
