import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * Handles the redirect from the Authorization Server.
 * Exchanged the 'code' for tokens and initializes the guest session.
 */
export function CallbackPage() {
    const [searchParams] = useSearchParams();
    const { completeLogin } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
            setError("Missing authorization code or state from provider.");
            return;
        }

        const handleAuth = async () => {
            try {
                await completeLogin(code, state);
                navigate('/dashboard', { replace: true });
            } catch (err: any) {
                console.error("Auth callback failed", err);
                setError(err.message || "Authentication failed. Please try again.");
            }
        };

        handleAuth();
    }, [searchParams, completeLogin, navigate]);

    if (error) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
                <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
                    <AlertCircle className="h-8 w-8" />
                </div>
                <h1 className="mb-2 text-2xl font-bold">Authentication Error</h1>
                <p className="mb-6 max-w-md text-muted-foreground">{error}</p>
                <button 
                    onClick={() => navigate('/register')}
                    className="rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                    Return to Login
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
                <h2 className="text-xl font-semibold">Finalizing Social Login</h2>
                <p className="text-sm text-muted-foreground">Please wait while we secure your session...</p>
            </div>
        </div>
    );
}
