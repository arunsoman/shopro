import { useState } from 'react';
import api from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';

export function useShoProAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const { setSession } = useAuth();

    const login = async (payload: { username: string; password?: string; mfaCode?: string }) => {
        setIsLoading(true);
        try {
            const { data } = await api.post('/auth/shopro/login', payload);
            if (!data.requiresMfa) {
                setSession({
                    id: data.shopro.shoproId,
                    fullName: data.shopro.fullName,
                    role: 'ADMIN',
                    type: 'ADMIN',
                    restaurantId: data.shopro.restaurantId || data.restaurantId,
                    restaurantName: data.shopro.restaurantName || data.restaurantName,
                    token: data.accessToken
                });
            }
            return data;
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const verifyMfa = async (payload: { mfaToken: string; mfaCode: string }) => {
        setIsLoading(true);
        try {
            const { data } = await api.post('/auth/shopro/mfa/verify', payload);
            setSession({
                id: data.shopro.shoproId,
                fullName: data.shopro.fullName,
                role: 'ADMIN',
                type: 'ADMIN',
                restaurantId: data.shopro.restaurantId || data.restaurantId,
                restaurantName: data.shopro.restaurantName || data.restaurantName,
                token: data.accessToken
            });
            return data;
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'MFA verification failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { login, verifyMfa, isLoading };
}
