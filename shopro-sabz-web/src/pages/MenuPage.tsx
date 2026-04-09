import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Search, Clock, Users, ArrowRight, Minus, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Mock Data for Premium Presentation
export const MOCK_CATEGORIES = ['All', 'Starters', 'Mains', 'Desserts', 'Beverages'];
export const MOCK_MENU = [
    { id: '1', name: 'Kabuli Pulao', description: 'Tender lamb with caramelized carrots and raisins over basmati rice.', price: 18.50, category: 'Mains', image: 'https://images.unsplash.com/photo-1589301773012-8bc10333da4f?q=80&w=600&auto=format&fit=crop', tags: ['Signature', 'Halal'] },
    { id: '2', name: 'Mantu Traditional', description: 'Steamed dumplings filled with spiced ground beef and onions, topped with garlic yogurt.', price: 14.00, category: 'Starters', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=600&auto=format&fit=crop', tags: ['Popular'] },
    { id: '3', name: 'Sabz Signature Kofta', description: 'Spiced meatballs simmered in a rich tomato sauce with fragrant herbs.', price: 16.50, category: 'Mains', image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?q=80&w=600&auto=format&fit=crop', tags: ['Spicy'] },
    { id: '4', name: 'Firni Pudding', description: 'Cardamom and rose water infused milk pudding topped with crushed pistachios.', price: 8.00, category: 'Desserts', image: 'https://images.unsplash.com/photo-1551024506-0cb4a1cb1c75?q=80&w=600&auto=format&fit=crop', tags: ['Vegetarian'] },
    { id: '5', name: 'Afghan Green Tea', description: 'Cardamom infused green tea brewed to perfection.', price: 4.50, category: 'Beverages', image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=600&auto=format&fit=crop', tags: [] },
    { id: '6', name: 'Bolani Sabzi', description: 'Crispy flatbread stuffed with spinach and herbs.', price: 10.00, category: 'Starters', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop', tags: ['Vegan'] },
];

export interface CartItem {
    id: string;
    menuItem: typeof MOCK_MENU[0];
    quantity: number;
}

export function MenuPage() {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);

    const filteredMenu = useMemo(() => {
        return MOCK_MENU.filter(item => {
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  item.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery]);

    const addToCart = (item: typeof MOCK_MENU[0]) => {
        setCart(prev => {
            const existing = prev.find(i => i.menuItem.id === item.id);
            if (existing) {
                return prev.map(i => i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { id: Math.random().toString(), menuItem: item, quantity: 1 }];
        });
        toast.success(`Added ${item.name} to cart`);
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => {
            return prev.map(i => {
                if (i.menuItem.id === itemId) {
                    const newQ = i.quantity + delta;
                    return newQ > 0 ? { ...i, quantity: newQ } : i;
                }
                return i;
            }).filter(i => i.quantity > 0);
        });
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckout = () => {
        if (cartCount === 0) return;
        // Navigate with state (normally use context/redux)
        navigate('/checkout', { state: { cart, total: cartTotal } });
    };

    return (
        <div className="min-h-screen bg-[#F5FBFD] dark:bg-[#180B33] pb-32 transition-colors duration-500">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-0 -right-1/4 w-[600px] h-[600px] bg-primary rounded-full blur-[160px]" />
                <div className="absolute top-1/2 -left-1/4 w-[500px] h-[500px] bg-secondary rounded-full blur-[160px]" />
            </div>

            {/* Header Area */}
            <div className="z-10 sticky top-0 bg-[#F5FBFD]/80 dark:bg-[#180B33]/80 backdrop-blur-xl border-b border-border/40 pb-4 pt-6 px-4 md:px-8">
                <div className="max-w-6xl mx-auto space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <span className="font-syne font-bold text-xl text-primary">S</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold font-syne text-foreground tracking-tight">SABZ Dining</h1>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 20-30 min</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Dine-in / Takeout</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" className="hidden md:flex" onClick={() => navigate('/dashboard')}>Dashboard</Button>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search dishes, ingredients..." 
                            className="pl-10 bg-white/50 dark:bg-slate-900/50 border-none h-12 shadow-sm focus-visible:ring-1 focus-visible:ring-primary"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Categories Scrollable */}
                    <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                        {MOCK_CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                                    selectedCategory === cat 
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]' 
                                    : 'bg-white/50 dark:bg-slate-800/50 text-muted-foreground hover:bg-white dark:hover:bg-slate-800'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Menu Grid */}
            <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMenu.map(item => (
                        <Card key={item.id} className="border-none shadow-xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-md overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                            <div className="h-48 overflow-hidden relative">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute top-3 left-3 flex gap-2">
                                    {item.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="bg-white/90 dark:bg-slate-900/90 text-xs font-bold shadow-sm backdrop-blur-md border-none text-primary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold font-syne text-lg tracking-tight group-hover:text-primary transition-colors">{item.name}</h3>
                                    <span className="font-semibold text-primary font-mono">${item.price.toFixed(2)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">{item.description}</p>
                                
                                <div className="flex items-center justify-between mt-auto">
                                    {cart.find(i => i.menuItem.id === item.id) ? (
                                        <div className="flex items-center gap-3 bg-muted/40 rounded-full p-1 border border-border/50">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-slate-800 shadow-sm" onClick={() => updateQuantity(item.id, -1)}>
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="font-semibold w-4 text-center text-sm">{cart.find(i => i.menuItem.id === item.id)?.quantity}</span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 shadow-sm text-primary hover:text-primary" onClick={() => updateQuantity(item.id, 1)}>
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button className="w-full rounded-xl gap-2 font-semibold shadow-sm hover:shadow-md transition-shadow group-hover:bg-primary" onClick={() => addToCart(item)}>
                                            <Plus className="h-4 w-4" /> Add to Order
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {filteredMenu.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground text-lg">No dishes found matching your search.</p>
                        <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2">Clear search</Button>
                    </div>
                )}
            </main>

            {/* Floating Cart Tab */}
            {cartCount > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[calc(100%-2rem)] md:max-w-md animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <Button 
                        size="lg" 
                        onClick={handleCheckout}
                        className="w-full h-16 rounded-2xl shadow-2xl bg-foreground hover:bg-foreground/90 text-background gap-3 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center justify-between w-full px-2">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <ShoppingBag className="h-5 w-5" />
                                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-foreground">
                                        {cartCount}
                                    </span>
                                </div>
                                <span className="font-semibold">View Order</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold font-mono text-lg">${cartTotal.toFixed(2)}</span>
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Button>
                </div>
            )}
        </div>
    );
}
