import React, { useState } from 'react';
import { 
    Search, 
    ShieldCheck, 
    User, 
    Clock, 
    ArrowRight, 
    ScanLine,
    Hash
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { OTPVerificationDialog } from '../components/OTPVerificationDialog';

export function StaffOrderVerificationPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;
        setVerifyingOrderId(searchQuery);
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
            <header className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Order Verification</h1>
                </div>
                <p className="text-muted-foreground">Verify customer identity via OTP before releasing takeaway orders or seating guests.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-border/40 bg-surface/50 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Search Active Order</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Enter Order ID or Customer Phone..." 
                                    className="pl-10 h-11"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="h-11">
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center space-y-3">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <ScanLine className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-sm">Scan QR Code</h3>
                            <p className="text-[10px] text-muted-foreground">Use terminal camera to verify instantly</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full text-xs font-bold border-primary/20 hover:bg-primary/10">
                            Launch Scanner
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Pending Verification</h3>
                <div className="grid grid-cols-1 gap-4">
                    <Card className="hover:border-primary/40 transition-colors">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-muted/50 rounded-xl">
                                    <Hash className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">#DASK-9482</span>
                                        <Badge variant="secondary" className="text-[10px] h-4">Takeaway</Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> Zabi Alokozai</span>
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 12 mins ago</span>
                                    </div>
                                </div>
                            </div>
                            <Button 
                                onClick={() => setVerifyingOrderId('9482-example-uuid')}
                                className="bg-primary/10 text-primary hover:bg-primary border border-primary/20 hover:text-white transition-all font-bold gap-2"
                            >
                                Verify Identity
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {verifyingOrderId && (
                <OTPVerificationDialog 
                    orderId={verifyingOrderId} 
                    isOpen={!!verifyingOrderId} 
                    onOpenChange={(open) => !open && setVerifyingOrderId(null)}
                    onVerified={() => {
                        toast.success('Fulfillment Authorized');
                    }}
                />
            )}
        </div>
    );
}
