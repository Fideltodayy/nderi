import { useQuery, useMutation } from '@tanstack/react-query';
import { db, Book } from '@/lib/db';
import { queryClient } from '@/lib/queryClient';

export function useBooks() {
  return useQuery({
    queryKey: ['/books'],
    queryFn: async () => {
      return await db.books.toArray();
    }
  });
}

export function useAddBook() {
  return useMutation({
    mutationFn: async (book: Omit<Book, 'id'>) => {
      return await db.books.add(book);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/books'] });
    }
  });
}

export function useUpdateBook() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Book> }) => {
      return await db.books.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/books'] });
    }
  });
}

export function useBulkAddBooks() {
  return useMutation({
    mutationFn: async (books: Omit<Book, 'id'>[]) => {
      return await db.books.bulkAdd(books);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/books'] });
    }
  });
}
