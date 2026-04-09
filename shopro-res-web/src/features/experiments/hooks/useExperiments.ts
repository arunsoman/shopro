import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { experimentApi } from '../services/experimentApi';

export const useExperiments = (restaurantId: number) => {
  const queryClient = useQueryClient();

  const { data: experiments = [], isLoading, error } = useQuery({
    queryKey: ['experiments', restaurantId],
    queryFn: () => experimentApi.list(restaurantId)
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => experimentApi.create(restaurantId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['experiments', restaurantId] })
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => experimentApi.start(restaurantId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['experiments', restaurantId] })
  });

  const rollbackMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      experimentApi.rollback(restaurantId, id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['experiments', restaurantId] })
  });

  return {
    experiments,
    isLoading,
    error,
    createExperiment: createMutation.mutateAsync,
    startExperiment: startMutation.mutateAsync,
    rollbackExperiment: rollbackMutation.mutateAsync
  };
};
