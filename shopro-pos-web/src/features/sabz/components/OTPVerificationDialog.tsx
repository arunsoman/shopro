import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';

interface OTPVerificationDialogProps {
    orderId: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onVerified: () => void;
}

export function OTPVerificationDialog({ orderId, isOpen, onOpenChange, onVerified }: OTPVerificationDialogProps) {
    const { session } = useAuth();
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState<'success' | 'error' | null>(null);

    const handleVerify = async () => {
        if (!otp || otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setVerifying(true);
        setResult(null);

        try {
            const { data: isValid } = await apiClient.post<boolean>(`/api/v1/orders/${orderId}/otp/verify`, {
                otp,
                staffId: session?.id || 'SYSTEM',
                terminalId: 'WEB_POS'
            });

            if (isValid) {
                setResult('success');
                toast.success('OTP Verified Successfully');
                setTimeout(() => {
                    onVerified();
                    onOpenChange(false);
                    setResult(null);
                    setOtp('');
                }, 1500);
            } else {
                setResult('error');
                toast.error('Invalid OTP. Please try again.');
            }
        } catch (error) {
            setResult('error');
            toast.error('Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                <DialogHeader className="space-y-3">
                    <div className="flex justify-center">
                        <div className={`p-3 rounded-2xl ${result === 'success' ? 'bg-success/10' : result === 'error' ? 'bg-error/10' : 'bg-primary/10'}`}>
                            {result === 'success' ? (
                                <CheckCircle2 className="h-8 w-8 text-success animate-in zoom-in duration-300" />
                            ) : result === 'error' ? (
                                <XCircle className="h-8 w-8 text-error animate-shake" />
                            ) : (
                                <ShieldCheck className="h-8 w-8 text-primary" />
                            )}
                        </div>
                    </div>
                    <DialogTitle className="text-center text-xl font-bold font-syne">Verify Order Identity</DialogTitle>
                    <DialogDescription className="text-center">
                        Ask the customer for their 6-digit Order OTP to confirm fulfilment.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-4">
                    <div className="grid grid-cols-6 gap-2 max-w-[280px] mx-auto">
                        <Input 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            className="col-span-6 text-center text-3xl font-bold tracking-[0.5em] h-16 bg-muted/30 border-2 focus-visible:ring-primary"
                            placeholder="******"
                            disabled={verifying}
                        />
                    </div>
                    <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                        Order Ref: {orderId.substring(0, 8)}
                    </p>
                </div>

                <DialogFooter className="sm:justify-center flex-col gap-2">
                    <Button 
                        onClick={handleVerify} 
                        className="w-full h-12 text-base font-semibold"
                        disabled={verifying || otp.length !== 6}
                    >
                        {verifying ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : 'Confirm & Release Order'}
                    </Button>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={verifying} className="w-full h-11">
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
