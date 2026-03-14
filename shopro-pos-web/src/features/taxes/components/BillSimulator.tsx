import React, { useState } from 'react';
import type { 
  TaxCalculationRequest, 
  TaxLineItemRequest 
} from '../types';
import { useTaxCalculationPreview } from '../api/taxes';
import { 
  Play, 
  Trash2, 
  Plus, 
  Receipt,
  Utensils,
  ShoppingBag,
  Info
} from 'lucide-react';

interface BillSimulatorProps {
  venueId: string;
}

export const BillSimulator: React.FC<BillSimulatorProps> = ({ venueId }) => {
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  const [serviceCharge, setServiceCharge] = useState<number>(0);
  const [items, setItems] = useState<TaxLineItemRequest[]>([
    { itemId: crypto.randomUUID(), unitPrice: 12.00, quantity: 1, temperature: 'HOT', itemCategory: 'FOOD' }
  ]);

  const { mutate: calculate, data: result, isPending } = useTaxCalculationPreview(venueId);

  const handleAddItem = () => {
    setItems([...items, { itemId: crypto.randomUUID(), unitPrice: 10, quantity: 1, temperature: 'HOT', itemCategory: 'FOOD' }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.itemId !== id));
  };

  const updateItem = (id: string, updates: Partial<TaxLineItemRequest>) => {
    setItems(items.map(i => i.itemId === id ? { ...i, ...updates } : i));
  };

  const runSimulation = () => {
    const request: TaxCalculationRequest = {
      ticketId: crypto.randomUUID(),
      orderType,
      serviceChargeAmount: serviceCharge > 0 ? serviceCharge : undefined,
      items
    };
    calculate(request);
  };

  return (
    <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden mt-6">
      <div className="p-6 border-b border-border bg-primary/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Play className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Interactive Bill Simulator</h2>
        </div>
        <button 
          onClick={runSimulation}
          disabled={isPending || items.length === 0}
          className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isPending ? 'Calculating...' : 'Run Simulation'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Input Panel */}
        <div className="p-6 border-r border-border space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Order Type</label>
              <div className="flex p-1 bg-muted rounded-xl gap-1">
                <button 
                  onClick={() => setOrderType('DINE_IN')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                    orderType === 'DINE_IN' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:bg-background/50'
                  }`}
                >
                  <Utensils className="h-4 w-4" /> Dine-in
                </button>
                <button 
                  onClick={() => setOrderType('TAKEAWAY')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                    orderType === 'TAKEAWAY' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:bg-background/50'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" /> Takeaway
                </button>
              </div>
            </div>
            
            <div className="w-1/3 space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Service Charge</label>
              <input 
                type="number"
                className="w-full rounded-xl border-input bg-background p-2 font-bold"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Line Items</label>
              <button 
                onClick={handleAddItem}
                className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-bold"
              >
                <Plus className="h-3 w-3" /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.itemId} className="p-4 bg-muted/30 rounded-2xl border border-border group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-muted-foreground">ITEM #{idx + 1}</span>
                    <button onClick={() => handleRemoveItem(item.itemId)} className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground">PRICE</p>
                      <input 
                        type="number"
                        className="w-full bg-background border-input rounded-lg text-sm p-1.5 font-bold"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.itemId, { unitPrice: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground">QTY</p>
                      <input 
                        type="number"
                        className="w-full bg-background border-input rounded-lg text-sm p-1.5 font-bold"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.itemId, { quantity: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground">TEMP</p>
                      <select 
                        className="w-full bg-background border-input rounded-lg text-sm p-1.5"
                        value={item.temperature || ''}
                        onChange={(e) => updateItem(item.itemId, { temperature: e.target.value as any || undefined })}
                      >
                        <option value="">N/A</option>
                        <option value="HOT">HOT</option>
                        <option value="COLD">COLD</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground">CAT</p>
                      <select 
                        className="w-full bg-background border-input rounded-lg text-sm p-1.5"
                        value={item.itemCategory || ''}
                        onChange={(e) => updateItem(item.itemId, { itemCategory: e.target.value })}
                      >
                        <option value="FOOD">FOOD</option>
                        <option value="BEVERAGE">BEV</option>
                        <option value="ALCOHOL">ALC</option>
                        <option value="SERVICE">SVC</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Result Panel (The Bill) */}
        <div className="bg-muted/50 p-6 flex flex-col h-full min-h-[500px]">
          <div className="flex-1 flex flex-col bg-card rounded-3xl border border-border shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
            
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <Receipt className="h-16 w-16" />
                <p className="font-medium">Configure items and run simulation<br/>to see the tax breakdown.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center pb-6 border-b border-dashed border-border">
                  <h3 className="text-2xl font-black italic tracking-tighter text-primary">SHOPRO POS</h3>
                  <p className="text-xs text-muted-foreground mt-1">TAX SIMULATION RECEIPT</p>
                </div>

                <div className="space-y-3">
                  {result.items.map((item, id) => (
                    <div key={item.itemId} className="space-y-1">
                      <div className="flex justify-between font-bold text-sm">
                        <span>Line Item #{id + 1}</span>
                        <span>{item.baseAmount.toFixed(2)}</span>
                      </div>
                      {item.breakdowns.map(bt => (
                        <div key={bt.ruleCode} className="flex justify-between text-xs text-muted-foreground ml-4">
                          <span>∟ {bt.ruleName} ({(bt.rate * 100).toFixed(1)}%)</span>
                          <span>{bt.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-dashed border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground italic">Net Subtotal</span>
                    <span className="font-medium">{result.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground italic">Total Tax</span>
                    <span className="font-bold text-amber-600">+{result.totalTax.toFixed(2)}</span>
                  </div>
                  {result.serviceChargeTax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground italic">SC + Tax</span>
                      <span>{(serviceCharge + result.serviceChargeTax).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-4 text-2xl font-black">
                    <span>TOTAL</span>
                    <span className="text-primary">{result.finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 text-center">Summary by Rule</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(result.taxSummary || {}).map(([code, amt]) => (
                      <div key={code} className="flex justify-between text-xs">
                        <span className="truncate opacity-70">{code}:</span>
                        <span className="font-bold">{amt.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase opacity-50">
            <Info className="h-3 w-3" />
            Calculated in real-time using backend TaxEngine
          </div>
        </div>
      </div>
    </div>
  );
};
