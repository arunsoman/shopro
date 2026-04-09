import { useState } from 'react';
import api from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';

export function useStaffAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const { setSession } = useAuth();

    const login = async (payload: { restaurantId: number; staffId: string; pin: string }) => {
        setIsLoading(true);
        try {
            const { data } = await api.post('/auth/staff/login', payload);
            setSession({
                id: data.staff.staffId,
                fullName: data.staff.name,
                role: data.staff.role,
                type: 'STAFF',
                restaurantId: data.restaurantId,
                restaurantName: data.restaurantName,
                token: data.accessToken
            });
            return data;
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Invalid PIN');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { login, isLoading };
}
