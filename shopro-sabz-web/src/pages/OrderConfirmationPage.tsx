import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, RefreshCcw, ArrowLeft, Download, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';

interface OTPStatus {
    orderId: string;
    isGenerated: boolean;
    isVerified: boolean;
    isExpired: boolean;
    expiryAt: string;
    resendCount: number;
    attemptCount: number;
    qrData: string;
}

export function OrderConfirmationPage() {
    const { id } = useParams<{ id: string }>();
    const [status, setStatus] = useState<OTPStatus | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        try {
            const { data } = await apiClient.get<OTPStatus>(`/api/v1/orders/${id}/otp/status`);
            setStatus(data);
        } catch (error) {
            console.error('Failed to fetch OTP status', error);
            toast.error('Could not refresh order verification status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); // Polling for verification status
        return () => clearInterval(interval);
    }, [id]);

    const handleResend = async () => {
        try {
            await apiClient.post(`/api/v1/orders/${id}/otp/resend`);
            toast.success('New OTP has been generated');
            fetchStatus();
        } catch (error) {
            toast.error('Failed to resend OTP');
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!status) return <div>Order not found</div>;

    return (
        <div className="min-h-screen bg-[#F5FBFD] dark:bg-[#180B33] p-4 md:p-8 font-sans transition-colors duration-500">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-[120px]" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent rounded-full blur-[120px]" />
            </div>

            <div className="max-w-2xl mx-auto relative z-10">
                <header className="mb-8 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">Back to Menu</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <span className="text-xl font-bold font-syne tracking-tight">SABZ</span>
                    </div>
                </header>

                <main className="space-y-6">
                    {/* Success Hero */}
                    <div className="text-center space-y-3 mb-8">
                        <div className="inline-flex items-center justify-center p-3 bg-success/10 rounded-full mb-2">
                            <CheckCircle2 className="h-10 w-10 text-success" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold font-syne text-foreground tracking-tight">Order Confirmed!</h1>
                        <p className="text-muted-foreground">Your order is being prepared. Present the OTP below to collect your items.</p>
                    </div>

                    {/* OTP Security Card */}
                    <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden glass-panel">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-cyan-400 to-accent" />
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Verification Token</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 flex flex-col items-center pb-10">
                            
                            {/* Visual QR - Premium Look */}
                            <div className="relative p-6 bg-white rounded-3xl shadow-inner group">
                                <QRCodeSVG 
                                    value={status.qrData || 'pending'} 
                                    size={200}
                                    level="H"
                                    includeMargin
                                />
                                <div className="absolute inset-0 bg-primary/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>

                            {/* OTP Display */}
                            <div className="space-y-4 w-full">
                                <div className="flex justify-center gap-3">
                                    {(status.qrData?.split(':')[0]?.substring(0, 6) || '******').split('').map((char: string, i: number) => (
                                        <div key={i} className="w-12 h-16 flex items-center justify-center text-2xl font-bold rounded-xl bg-muted/50 border-2 border-border shadow-sm text-primary">
                                            {char}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-center text-xs text-muted-foreground">
                                    Expires in <span className="text-accent font-semibold">12:45</span> minutes
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-3 w-full">
                                <Button variant="ghost" size="sm" onClick={handleResend} disabled={status.resendCount >= 3} className="gap-2 text-xs h-9">
                                    <RefreshCcw className="h-3 w-3" />
                                    Resend OTP ({3 - status.resendCount} left)
                                </Button>
                                <Button variant="ghost" size="sm" className="gap-2 text-xs h-9">
                                    <Download className="h-3 w-3" />
                                    Save as PDF
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Details Brief */}
                    <Card className="border-border/40 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold font-syne">Order Details</h3>
                                <Badge variant="outline" className="text-xs uppercase tracking-tighter">#{id?.substring(0, 8)}</Badge>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className="font-medium text-primary">Preparing</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Pickup Location</span>
                                    <span className="font-medium">Sabz - Counter A</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <footer className="text-center text-[10px] text-muted-foreground/60 py-4 decoration-current underline underline-offset-4">
                        Terms of Service & Security Policy
                    </footer>
                </main>
            </div>
        </div>
    );
}
