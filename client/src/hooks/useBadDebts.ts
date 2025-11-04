import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import type { BadDebt } from '@/lib/db';

export function useBadDebts() {
  return useQuery({
    queryKey: ['badDebts'],
    queryFn: () => db.badDebts.toArray()
  });
}

export function useAddBadDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (badDebt: Omit<BadDebt, 'id'>) => {
      const id = await db.badDebts.add(badDebt);
      return { ...badDebt, id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badDebts'] });
    }
  });
}

export function useUpdateBadDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: number;
      data: Partial<BadDebt>;
    }) => {
      await db.badDebts.update(id, data);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badDebts'] });
    }
  });
}