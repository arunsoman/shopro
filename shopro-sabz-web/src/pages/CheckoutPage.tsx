import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Clock, MapPin, CreditCard, ChevronRight, Lock, CheckCircle2, Store, ShoppingBag, Utensils, Smartphone, Banknote } from 'lucide-react';
import type { CartItem } from './MenuPage';
import { toast } from 'sonner';

// Mock Floorplan Data
const MOCK_TABLES = [
    { id: 'T1', capacity: 2, status: 'available', x: 10, y: 10 },
    { id: 'T2', capacity: 2, status: 'reserved', x: 40, y: 10 },
    { id: 'T3', capacity: 4, status: 'available', x: 70, y: 10 },
    { id: 'T4', capacity: 4, status: 'available', x: 10, y: 50 },
    { id: 'T5', capacity: 6, status: 'available', x: 40, y: 50 },
    { id: 'T6', capacity: 2, status: 'reserved', x: 70, y: 50 },
    { id: 'VIP1', capacity: 8, status: 'available', x: 40, y: 85 },
];

function InteractiveFloorPlan({ selectedTable, onSelectTable }: { selectedTable: string | null, onSelectTable: (id: string) => void }) {
    return (
        <div className="relative w-full aspect-video bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-border/50 overflow-hidden shadow-inner mt-4 p-4">
            <div className="absolute top-2 left-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Entrance</div>
            <div className="absolute bottom-2 right-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Kitchen</div>
            
            <div className="relative w-full h-full">
                {MOCK_TABLES.map(table => {
                    const isSelected = selectedTable === table.id;
                    const isReserved = table.status === 'reserved';
                    return (
                        <button
                            key={table.id}
                            disabled={isReserved}
                            onClick={() => onSelectTable(table.id)}
                            className={`absolute flex flex-col items-center justify-center rounded-lg shadow-sm transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2
                                ${table.capacity > 4 ? 'w-24 h-16' : 'w-16 h-16'}
                                ${isSelected ? 'bg-primary ring-4 ring-primary/30 text-primary-foreground scale-110 z-10' : 
                                  isReserved ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed opacity-60' : 
                                  'bg-white dark:bg-slate-900 border-2 border-border text-foreground hover:border-primary hover:text-primary'}`}
                            style={{ left: `${table.x}%`, top: `${table.y}%` }}
                        >
                            <span className="font-bold text-sm tracking-tight">{table.id}</span>
                            <span className="text-[10px] flex items-center gap-1 opacity-80 mt-0.5"><Utensils className="h-2.5 w-2.5" />{table.capacity}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
}

export function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { cart, total } = (location.state as { cart?: CartItem[]; total?: number }) || {};

    const [step, setStep] = useState<1 | 2>(1); // 1 = Details, 2 = Payment
    const [orderType, setOrderType] = useState<'TAKEAWAY' | 'DINE_IN'>('TAKEAWAY');
    const [arrivalTime, setArrivalTime] = useState<string>('ASAP');
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [guestCount, setGuestCount] = useState<number>(2);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'HESABPAY' | 'MHAWALA' | 'MIPAY' | 'COD'>('CARD');

    useEffect(() => {
        if (!cart || cart.length === 0) {
            navigate('/menu');
        }
    }, [cart, navigate]);

    if (!cart) return null;

    const handleContinueToPayment = () => {
        if (orderType === 'DINE_IN' && !selectedTable) {
            toast.error("Please select a table from the floorplan.");
            return;
        }
        setStep(2);
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        // Simulate network/payment delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast.success('Payment successful!');
        
        // Mock generating an order ID
        const mockOrderId = "O" + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        // Route directly to the OTP tracking screen successfully
        navigate(`/order/${mockOrderId}/confirmation`, { replace: true });
    };

    const tax = total ? total * 0.08 : 0;
    const finalTotal = total ? total + tax : 0;

    return (
        <div className="min-h-screen bg-[#F5FBFD] dark:bg-[#180B33] p-4 md:p-8 font-sans transition-colors duration-500">
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] bg-primary rounded-full blur-[140px]" />
                <div className="absolute bottom-0 -left-1/4 w-[600px] h-[600px] bg-accent rounded-full blur-[180px]" />
            </div>

            <div className="max-w-4xl mx-auto pb-24 relative z-10">
                <header className="mb-8 flex items-center justify-between">
                    <Button variant="ghost" onClick={() => step === 2 ? setStep(1) : navigate(-1)} className="gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" /> {step === 2 ? 'Back to Details' : 'Back to Menu'}
                    </Button>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                            <span className="font-bold font-syne text-lg tracking-tight">Checkout</span>
                        </div>
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">
                            Step {step} of 2
                        </span>
                    </div>
                </header>

                <div className="grid md:grid-cols-5 gap-8">
                    {/* Left Column - Forms */}
                    <div className="md:col-span-3 space-y-6">
                        
                        {step === 1 && (
                            <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden glass-panel animate-in slide-in-from-left-4 fade-in duration-300">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-syne">Fulfillment Details</CardTitle>
                                    <CardDescription>Are you dining with us or taking it away?</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Toggle Order Type */}
                                    <div className="grid grid-cols-2 gap-4 p-1 bg-muted/40 rounded-2xl shadow-inner mb-6">
                                        <button 
                                            className={`flex flex-col items-center gap-2 py-4 rounded-xl transition-all ${orderType === 'TAKEAWAY' ? 'bg-white dark:bg-slate-800 shadow-md scale-[1.02] text-primary' : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                                            onClick={() => setOrderType('TAKEAWAY')}
                                        >
                                            <Store className="h-6 w-6" />
                                            <span className="font-semibold text-sm">Takeaway / Pickup</span>
                                        </button>
                                        <button 
                                            className={`flex flex-col items-center gap-2 py-4 rounded-xl transition-all ${orderType === 'DINE_IN' ? 'bg-white dark:bg-slate-800 shadow-md scale-[1.02] text-primary' : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                                            onClick={() => setOrderType('DINE_IN')}
                                        >
                                            <MapPin className="h-6 w-6" />
                                            <span className="font-semibold text-sm">Dine-in (Book Table)</span>
                                        </button>
                                    </div>

                                    {/* Conditional Workflow Fields */}
                                    {orderType === 'TAKEAWAY' ? (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <Label className="flex items-center gap-2 text-primary">
                                                <Clock className="h-4 w-4" /> Expected Arrival Time
                                            </Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { label: 'ASAP (20-30m)', value: 'ASAP' },
                                                    { label: 'In 45 mins', value: '+45M' },
                                                    { label: 'In 1.5 hours', value: '+90M' },
                                                    { label: 'Later Today', value: 'LATER' }
                                                ].map(opt => (
                                                    <button 
                                                        key={opt.value}
                                                        onClick={() => setArrivalTime(opt.value)}
                                                        className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${
                                                            arrivalTime === opt.value 
                                                            ? 'border-primary bg-primary/5 text-primary shadow-sm scale-[1.02]' 
                                                            : 'border-border/60 hover:border-primary/50 text-muted-foreground bg-white/30 dark:bg-slate-800/30'
                                                        }`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <div className="space-y-3">
                                                <Label>Number of Guests</Label>
                                                <div className="flex gap-3">
                                                    {[1,2,3,4,5,6].map(num => (
                                                        <button 
                                                            key={num} 
                                                            onClick={() => setGuestCount(num)}
                                                            className={`h-12 w-12 rounded-xl border flex items-center justify-center font-bold transition-all
                                                                ${guestCount === num ? 'border-primary bg-primary text-primary-foreground shadow-md scale-105' : 'border-border bg-white/50 dark:bg-slate-800/50 hover:border-primary/50 text-muted-foreground'}`}
                                                        >
                                                            {num}{num === 6 ? '+' : ''}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2 pt-2 border-t border-border/40">
                                                <Label className="flex items-center gap-2">
                                                    Interactive Floorplan <span className="text-xs font-normal text-muted-foreground">(Select a table)</span>
                                                </Label>
                                                <InteractiveFloorPlan selectedTable={selectedTable} onSelectTable={setSelectedTable} />
                                            </div>
                                        </div>
                                    )}

                                </CardContent>
                                <CardFooter className="pt-2">
                                     <Button 
                                        onClick={handleContinueToPayment} 
                                        className="w-full h-12 rounded-xl text-base gap-2 group"
                                     >
                                         Continue to Payment
                                         <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                     </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {step === 2 && (
                            <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden glass-panel animate-in slide-in-from-right-4 fade-in duration-300">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-syne">Payment Gateway</CardTitle>
                                    <CardDescription>Secure, encrypted transaction</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    
                                    {/* Payment Method Selector */}
                                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                                        <button onClick={() => setPaymentMethod('CARD')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'CARD' ? 'border-primary bg-primary/5 text-primary shadow-sm scale-[1.02]' : 'border-border/60 hover:border-primary/50 text-muted-foreground bg-white/30 dark:bg-slate-800/30'}`}>
                                            <CreditCard className="h-5 w-5" />
                                            <span className="text-xs font-bold font-syne uppercase tracking-wider">Bank Card</span>
                                        </button>
                                        <button onClick={() => setPaymentMethod('HESABPAY')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'HESABPAY' ? 'border-[#0092c8] bg-[#0092c8]/5 text-[#0092c8] shadow-sm scale-[1.02]' : 'border-border/60 hover:border-[#0092c8]/50 text-muted-foreground bg-white/30 dark:bg-slate-800/30'}`}>
                                            <Smartphone className="h-5 w-5" />
                                            <span className="text-xs font-bold font-syne uppercase tracking-wider">HesabPay</span>
                                        </button>
                                        <button onClick={() => setPaymentMethod('MHAWALA')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'MHAWALA' ? 'border-[#7CB342] bg-[#7CB342]/5 text-[#7CB342] shadow-sm scale-[1.02]' : 'border-border/60 hover:border-[#7CB342]/50 text-muted-foreground bg-white/30 dark:bg-slate-800/30'}`}>
                                            <Smartphone className="h-5 w-5" />
                                            <span className="text-xs font-bold font-syne uppercase tracking-wider">mHawala</span>
                                        </button>
                                        <button onClick={() => setPaymentMethod('MIPAY')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'MIPAY' ? 'border-[#F44336] bg-[#F44336]/5 text-[#F44336] shadow-sm scale-[1.02]' : 'border-border/60 hover:border-[#F44336]/50 text-muted-foreground bg-white/30 dark:bg-slate-800/30'}`}>
                                            <Smartphone className="h-5 w-5" />
                                            <span className="text-xs font-bold font-syne uppercase tracking-wider">MiPay</span>
                                        </button>
                                        <button onClick={() => setPaymentMethod('COD')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'COD' ? 'border-success bg-success/5 text-success shadow-sm scale-[1.02]' : 'border-border/60 hover:border-success/50 text-muted-foreground bg-white/30 dark:bg-slate-800/30'}`}>
                                            <Banknote className="h-5 w-5" />
                                            <span className="text-xs font-bold font-syne uppercase tracking-wider">Cash</span>
                                        </button>
                                    </div>

                                    {paymentMethod === 'CARD' && (
                                        <div className="p-4 border border-border/60 rounded-2xl bg-white/50 dark:bg-slate-800/50 space-y-4 shadow-sm animate-in fade-in">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-14 bg-slate-100 dark:bg-slate-700 rounded-md flex items-center justify-center border border-border">
                                                        <CreditCard className="h-6 w-6 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">Credit / Debit Card</p>
                                                        <p className="text-xs text-muted-foreground">Processed directly by SabzPay</p>
                                                    </div>
                                                </div>
                                                <Lock className="h-5 w-5 text-success/80" />
                                            </div>
                                            
                                            <div className="space-y-3 pt-3 border-t border-border/40">
                                                <Label className="text-xs">Card Number</Label>
                                                <Input placeholder="0000 0000 0000 0000" className="h-11 font-mono tracking-widest text-sm" />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">Expiry</Label>
                                                        <Input placeholder="MM / YY" className="h-11 font-mono" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">Secure Code (CVC)</Label>
                                                        <Input placeholder="***" className="h-11 font-mono" type="password" maxLength={4} />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5 pt-1">
                                                    <Label className="text-xs">Name on Card</Label>
                                                    <Input placeholder="JOHN DOE" className="h-11 font-mono uppercase" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {(paymentMethod === 'HESABPAY' || paymentMethod === 'MHAWALA' || paymentMethod === 'MIPAY') && (
                                        <div className="p-6 border border-border/60 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-center space-y-4 shadow-sm animate-in fade-in mt-2 flex flex-col items-center">
                                            <div className={`h-16 w-16 ${paymentMethod === 'HESABPAY' ? 'bg-[#0092c8]/10' : paymentMethod === 'MIPAY' ? 'bg-[#F44336]/10' : 'bg-[#7CB342]/10'} rounded-2xl flex items-center justify-center shadow-inner`}>
                                                <Smartphone className={`h-8 w-8 ${paymentMethod === 'HESABPAY' ? 'text-[#0092c8]' : paymentMethod === 'MIPAY' ? 'text-[#F44336]' : 'text-[#7CB342]'}`} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg font-syne">
                                                    {paymentMethod === 'HESABPAY' ? 'Pay with HesabPay' : paymentMethod === 'MIPAY' ? 'Pay with MiPay' : 'Pay with mHawala'}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                                                    Save your order to securely generate an OTP. Then you will be redirected to the {paymentMethod === 'HESABPAY' ? 'HesabPay app' : paymentMethod === 'MIPAY' ? 'MiPay portal' : 'mHawala portal'} to authorize instantly.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'COD' && (
                                        <div className="p-6 border border-border/60 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-center space-y-4 shadow-sm animate-in fade-in mt-2 flex flex-col items-center">
                                            <div className="h-16 w-16 bg-success/10 rounded-2xl flex items-center justify-center shadow-inner">
                                                <Banknote className="h-8 w-8 text-success" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg font-syne">Pay at Counter</p>
                                                <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                                                    Generate your OTP token now. You will pay the cashier using Cash or POS Terminal upon arrival.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                </CardContent>
                                <CardFooter>
                                     <Button 
                                        size="lg" 
                                        onClick={handlePayment} 
                                        disabled={isProcessing}
                                        className="w-full h-14 rounded-xl font-bold text-lg bg-primary hover:bg-primary-hover text-primary-foreground shadow-[0_0_30px_rgba(0,201,167,0.3)] transition-all group overflow-hidden"
                                    >
                                        {isProcessing ? (
                                            <div className="flex items-center gap-3">
                                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing Securely...
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                                <Lock className="h-4 w-4" /> Pay ${finalTotal?.toFixed(2)}
                                            </div>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Summary */}
                    <div className="md:col-span-2">
                        <Card className="border-none shadow-2xl bg-foreground text-background overflow-hidden sticky top-6 z-20">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full pointer-events-none" />
                            <CardHeader className="pb-4 border-b border-background/10">
                                <CardTitle className="text-lg font-syne flex items-center justify-between">
                                    <span className="flex items-center gap-2"><ShoppingBag className="h-5 w-5" /> Order Summary</span>
                                    <span className="text-primary font-bold text-xs bg-primary/10 px-2 py-1 rounded border border-primary/20">{orderType}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                {/* Configuration Overview */}
                                <div className="p-3 bg-background/5 rounded-xl border border-background/10 space-y-2">
                                    {orderType === 'TAKEAWAY' ? (
                                        <div className="flex items-center gap-3 text-sm text-background/80">
                                            <Clock className="h-4 w-4 text-primary" />
                                            <span>Pickup Timing: <strong className="text-white">{arrivalTime}</strong></span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-sm text-background/80">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <span>Reserved Table: <strong className="text-white tracking-widest">{selectedTable || 'Pending...'}</strong></span>
                                        </div>
                                    )}
                                </div>

                                {/* Item List */}
                                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex justify-between items-start gap-4">
                                            <div>
                                                <p className="font-semibold text-sm leading-tight text-white mb-1">
                                                    {item.quantity}x {item.menuItem.name}
                                                </p>
                                                <p className="text-xs text-background/50">{item.menuItem.category}</p>
                                            </div>
                                            <span className="font-mono text-sm text-primary font-bold whitespace-nowrap">
                                                ${(item.menuItem.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals calculation */}
                                <div className="space-y-3 pt-4 border-t border-background/20 font-mono text-sm">
                                    <div className="flex justify-between text-background/70">
                                        <span>Subtotal</span>
                                        <span>${total?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-background/70">
                                        <span>Tax (8%)</span>
                                        <span>${tax?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold pt-4 border-t border-background/20 font-sans tracking-tight">
                                        <span>Total</span>
                                        <span className="text-primary">${finalTotal?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
