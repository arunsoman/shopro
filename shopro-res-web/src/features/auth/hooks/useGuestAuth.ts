import { useState } from 'react';
import api from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';

export function useGuestAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setSession } = useAuth();

    const login = async (payload: { email: string; password?: string }) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/auth/guest/login', payload);
            setSession({
                id: data.guest.guestId,
                fullName: data.guest.displayName,
                type: 'GUEST',
                token: data.accessToken,
                role: 'GUEST'
            });
            return data;
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Login failed';
            setError(msg);
            toast.error(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (payload: { email: string; password?: string; displayName: string }) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/auth/guest/register', payload);
            setSession({
                id: data.guest.guestId,
                fullName: data.guest.displayName,
                type: 'GUEST',
                token: data.accessToken,
                role: 'GUEST'
            });
            return data;
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Registration failed';
            setError(msg);
            toast.error(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithOAuth = async (provider: string, code: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.post(`/auth/guest/oauth/${provider}/callback`, { code });
            setSession({
                id: data.guest.guestId,
                fullName: data.guest.displayName,
                type: 'GUEST',
                token: data.accessToken,
                role: 'GUEST'
            });
            return data;
        } catch (err: any) {
            const msg = err.response?.data?.message || 'OAuth failure';
            setError(msg);
            toast.error(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { login, register, loginWithOAuth, isLoading, error };
}
