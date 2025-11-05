import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, Taxonomy } from '@/lib/db';

export function useTaxonomy(type?: 'category' | 'subject') {
  return useQuery({
    queryKey: ['taxonomy', type],
    queryFn: async () => {
      let query = db.taxonomy.orderBy('name');
      if (type) {
        query = query.filter(item => item.type === type);
      }
      return await query.toArray();
    }
  });
}

export function useCategories() {
  const { data = [], ...rest } = useTaxonomy('category');
  return { data: data.map(item => item.name).sort(), ...rest };
}

export function useSubjects() {
  const { data = [], ...rest } = useTaxonomy('subject');
  return { data: data.map(item => item.name).sort(), ...rest };
}

export function useAddTaxonomy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<Taxonomy, 'id' | 'createdAt'>) => {
      const id = await db.taxonomy.add({
        ...item,
        createdAt: new Date()
      });
      return id;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['taxonomy', variables.type] });
      queryClient.invalidateQueries({ queryKey: ['taxonomy'] });
    }
  });
}

export function useDeleteTaxonomy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await db.taxonomy.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxonomy'] });
    }
  });
}



