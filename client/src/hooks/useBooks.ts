import { useQuery, useMutation } from '@tanstack/react-query';
import { db, Book } from '@/lib/db';
import { queryClient } from '@/lib/queryClient';
import { useAddAuditLog, detectSuspiciousActivity } from './useAuditLogs';

export function useBooks() {
  return useQuery({
    queryKey: ['/books'],
    queryFn: async () => {
      return await db.books.toArray();
    }
  });
}

export function useAddBook() {
  const addAuditLog = useAddAuditLog();

  return useMutation({
    mutationFn: async (book: Omit<Book, 'id'>) => {
      // Add the book
      const id = await db.books.add(book);
      
      // Detect suspicious patterns in book addition
      const { isRisky, riskLevel, notes } = detectSuspiciousActivity(
        'create',
        'book',
        null,
        book
      );

      // Log suspicious additions
      if (isRisky) {
        await addAuditLog.mutateAsync({
          action: 'create',
          resourceType: 'book',
          resourceId: id,
          timestamp: new Date(),
          userId: 'admin', // TODO: Get actual user ID from auth context
          previousState: null,
          newState: { ...book, id },
          riskLevel,
          notes
        });
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/books'] });
    }
  });
}

export function useUpdateBook() {
  const addAuditLog = useAddAuditLog();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Book> }) => {
      // Get the previous state before updating
      const previousState = await db.books.get(id);
      
      // Perform the update
      await db.books.update(id, data);
      
      // Get the new state after update
      const newState = await db.books.get(id);
      
      // Detect suspicious activity
      const { isRisky, riskLevel, notes } = detectSuspiciousActivity(
        'update',
        'book',
        previousState,
        newState
      );

      // Log if suspicious activity is detected
      if (isRisky) {
        await addAuditLog.mutateAsync({
          action: 'update',
          resourceType: 'book',
          resourceId: id,
          timestamp: new Date(),
          userId: 'admin', // TODO: Get actual user ID from auth context
          previousState,
          newState,
          riskLevel,
          notes
        });
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/books'] });
    }
  });
}

export function useBulkAddBooks() {
  const addAuditLog = useAddAuditLog();

  return useMutation({
    mutationFn: async (books: Omit<Book, 'id'>[]) => {
      // Bulk add the books
      const ids = await db.books.bulkAdd(books);
      
      // Detect suspicious patterns in bulk additions
      const { isRisky, riskLevel, notes } = detectSuspiciousActivity(
        'create',
        'book',
        null,
        books
      );

      // Log suspicious bulk additions
      if (isRisky) {
        await addAuditLog.mutateAsync({
          action: 'create',
          resourceType: 'book',
          resourceId: -1, // Using -1 for bulk operations
          timestamp: new Date(),
          userId: 'admin', // TODO: Get actual user ID from auth context
          previousState: null,
          newState: books,
          riskLevel,
          notes
        });
      }

      return ids;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/books'] });
    }
  });
}

export function useDeleteBook() {
  const addAuditLog = useAddAuditLog();

  return useMutation({
    mutationFn: async (id: number) => {
      // Get the book state before deletion
      const bookToDelete = await db.books.get(id);
      
      // Delete the book
      await db.books.delete(id);
      
      // Check for suspicious patterns in book deletion
      const { isRisky, riskLevel, notes } = detectSuspiciousActivity(
        'delete',
        'book',
        bookToDelete,
        null
      );

      // Log suspicious deletions
      if (isRisky) {
        await addAuditLog.mutateAsync({
          action: 'delete',
          resourceType: 'book',
          resourceId: id,
          timestamp: new Date(),
          userId: 'admin', // TODO: Get actual user ID from auth context
          previousState: bookToDelete,
          newState: null,
          riskLevel,
          notes
        });
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/books'] });
    }
  });
}
