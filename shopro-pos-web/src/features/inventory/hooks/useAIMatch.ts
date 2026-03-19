import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { AIMatchResult } from '../api/types';

export const useAIMatch = () => {
    return useMutation({
        mutationFn: async ({ po, invoice, grn }: { po: File; invoice: File; grn: File }) => {
            const formData = new FormData();
            formData.append('po', po);
            formData.append('invoice', invoice);
            formData.append('grn', grn);

            const { data } = await apiClient.post<AIMatchResult>(
                '/inventory/ai-receiving/match-documents', 
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return data;
        },
    });
};
