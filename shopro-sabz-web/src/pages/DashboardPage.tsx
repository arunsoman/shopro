import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Utensils, Clock, History, Gift, Tag, Award, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { MOCK_MENU, type CartItem } from './MenuPage';
import { toast } from 'sonner';

// Mock Offers
const OFFERS = [
    { id: 1, title: '20% Off Family Platter', type: 'Discount', expiry: 'Ends today', gradient: 'from-primary/20 to-primary/5' },
    { id: 2, title: 'Free Firni on Orders $30+', type: 'Bonus', expiry: 'Valid all week', gradient: 'from-accent/20 to-accent/5' }
];

// Mock Past Orders
const PAST_ORDERS = [
    {
        id: 'ORD-A93X21',
        date: 'Oct 24, 2026',
        status: 'Delivered',
        items: [
            { menuItem: MOCK_MENU.find(m => m.name.includes('Kabuli'))!, quantity: 2 },
            { menuItem: MOCK_MENU.find(m => m.name.includes('Bolani'))!, quantity: 1 }
        ]
    },
    {
        id: 'ORD-B82Y44',
        date: 'Oct 15, 2026',
        status: 'Delivered',
        items: [
            { menuItem: MOCK_MENU.find(m => m.name.includes('Firni'))!, quantity: 4 },
            { menuItem: MOCK_MENU.find(m => m.name.includes('Mantu'))!, quantity: 2 }
        ]
    }
];

export function DashboardPage() {
    const { session, logout } = useAuth();
    const navigate = useNavigate();

    const initials = session?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'G';

    const handleReorder = (order: typeof PAST_ORDERS[0]) => {
        const cart: CartItem[] = order.items.map(i => ({
            id: Math.random().toString(),
            menuItem: i.menuItem,
            quantity: i.quantity
        }));
        
        const total = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
        
        toast.success(`Preparing to reorder ${order.id}...`);
        navigate('/checkout', { state: { cart, total } });
    };

    return (
        <div className="min-h-screen bg-[#F5FBFD] dark:bg-[#180B33] pb-24 transition-colors duration-500 font-sans relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-0 -right-1/4 w-[600px] h-[600px] bg-primary rounded-full blur-[160px]" />
                <div className="absolute top-1/2 -left-1/4 w-[500px] h-[500px] bg-secondary rounded-full blur-[160px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 pt-8">
                
                {/* Header Profile Area */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/40">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-gradient-to-tr from-primary to-accent rounded-full p-1 shadow-md">
                            <div className="h-full w-full bg-background rounded-full flex items-center justify-center font-bold text-xl text-primary font-syne">
                                {initials}
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold font-syne text-foreground tracking-tight">
                                Welcome, {session?.fullName || 'Guest'}
                            </h1>
                            <div className="flex flex-col gap-0.5 mt-1">
                                {session?.email && (
                                    <p className="text-xs text-muted-foreground font-medium opacity-80">{session.email}</p>
                                )}
                                {session?.phoneNumber && (
                                    <p className="text-xs text-muted-foreground font-medium opacity-80">{session.phoneNumber}</p>
                                )}
                                <p className="text-xs text-primary font-bold flex items-center gap-1.5 mt-1">
                                    <Award className="h-3.5 w-3.5" /> High-Value Guest
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" onClick={logout} className="text-muted-foreground hover:text-destructive flex items-center gap-2">
                        Logout
                    </Button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 shadow-sm rounded-2xl overflow-hidden glass-panel border border-border/50 animate-in slide-in-from-bottom-4">
                            <button onClick={() => navigate('/menu')} className="p-6 flex items-center justify-between bg-white/70 dark:bg-slate-900/40 hover:bg-primary/5 transition-colors group border-r border-border/50">
                                <div className="text-left">
                                    <h3 className="font-bold font-syne text-lg">New Order</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Browse the full menu</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <Plus className="h-5 w-5 text-primary group-hover:text-white" />
                                </div>
                            </button>
                            <button className="p-6 flex items-center justify-between bg-white/70 dark:bg-slate-900/40 hover:bg-accent/5 transition-colors group">
                                <div className="text-left">
                                    <h3 className="font-bold font-syne text-lg">Book Table</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Reserve for dine-in</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                                    <Utensils className="h-5 w-5 text-accent group-hover:text-white" />
                                </div>
                            </button>
                        </div>

                        {/* Recent Orders section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold font-syne flex items-center gap-2">
                                <History className="h-5 w-5 text-primary" /> Previous Orders
                            </h2>
                            <div className="space-y-4">
                                {PAST_ORDERS.map((order, idx) => (
                                    <Card key={order.id} className="border-border/50 shadow-md bg-white/80 dark:bg-slate-900/60 backdrop-blur-md overflow-hidden animate-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <div>
                                                <CardTitle className="text-base font-bold font-mono text-primary">{order.id}</CardTitle>
                                                <CardDescription className="flex items-center gap-1 mt-1">
                                                    <Clock className="h-3 w-3" /> {order.date} <span className="mx-1">•</span>
                                                    <Badge variant="outline" className="text-success border-success/30 bg-success/5">{order.status}</Badge>
                                                </CardDescription>
                                            </div>
                                            <div className="font-bold text-lg font-mono tracking-tight">
                                                ${order.items.reduce((s, i) => s + (i.menuItem.price * i.quantity), 0).toFixed(2)}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-sm text-muted-foreground leading-tight max-w-[70%]">
                                                    {order.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                                                </p>
                                                <Button size="sm" onClick={() => handleReorder(order)} className="rounded-full shadow-primary/20 hover:shadow-primary/40 text-xs px-4">
                                                    Reorder <ArrowRight className="h-3 w-3 ml-2" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Siderbar Column */}
                    <div className="space-y-8">
                        
                        {/* Loyalty Card */}
                        <div className="rounded-2xl bg-foreground text-background overflow-hidden relative shadow-2xl animate-in fade-in zoom-in-95">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/30 rounded-full pointer-events-none blur-xl" />
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/30 rounded-full pointer-events-none blur-xl" />
                            
                            <div className="p-6 relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-background/70 tracking-widest uppercase font-bold">Loyalty Balance</span>
                                        <span className="text-4xl font-syne tracking-tight mt-1 flex items-baseline gap-1">
                                            450 <span className="text-sm text-primary font-bold uppercase tracking-widest ml-1">Pts</span>
                                        </span>
                                    </div>
                                    <Gift className="h-10 w-10 text-primary opacity-80" />
                                </div>
                                
                                <div className="space-y-4 border-t border-background/20 pt-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-background/80">Next reward: Free Beverage</span>
                                        <span className="font-mono text-primary font-bold">500 Pts</span>
                                    </div>
                                    <div className="h-2 w-full bg-background/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full w-[90%]" />
                                    </div>
                                    <Button className="w-full bg-primary hover:bg-primary-hover text-background shadow-[0_0_20px_rgba(0,201,167,0.3)] border-none">
                                        Redeem Rewards
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Offers of the Day */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold font-syne flex items-center gap-2">
                                <Tag className="h-4 w-4 text-accent" /> Exclusive Offers
                            </h2>
                            <div className="grid gap-3">
                                {OFFERS.map(offer => (
                                    <div key={offer.id} className={`p-4 rounded-xl border border-border/50 bg-gradient-to-br ${offer.gradient} flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-shadow`}>
                                        <div>
                                            <Badge className="bg-white/50 text-foreground shadow-none border-foreground/10 mb-2 hover:bg-white/70">{offer.type}</Badge>
                                            <h4 className="font-bold text-sm">{offer.title}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">{offer.expiry}</p>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-white/50 flex items-center justify-center text-foreground shrink-0">
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
