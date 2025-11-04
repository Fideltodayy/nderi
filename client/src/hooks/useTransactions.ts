import { useQuery, useMutation } from '@tanstack/react-query';
import { db, Transaction } from '@/lib/db';
import { queryClient } from '@/lib/queryClient';

export function useTransactions() {
  return useQuery({
    queryKey: ['/transactions'],
    queryFn: async () => {
      const transactions = await db.transactions.orderBy('date').reverse().toArray();
      const books = await db.books.toArray();
      const students = await db.students.toArray();

      return transactions.map(transaction => {
        const book = books.find(b => b.id === transaction.bookId);
        const student = students.find(s => s.id === transaction.studentId);
        
        return {
          ...transaction,
          bookTitle: book?.title || 'Unknown Book',
          studentName: student?.name || 'Unknown Student',
        };
      });
    }
  });
}

export function useAddTransaction() {
  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id'>) => {
      const id = await db.transactions.add(transaction);
      
      // Update book availability
      if (transaction.action === 'borrow') {
        const book = await db.books.get(transaction.bookId);
        if (book) {
          // Defensive check: prevent going below zero
          const newAvailability = Math.max(0, book.availableQuantity - 1);
          await db.books.update(transaction.bookId, {
            availableQuantity: newAvailability
          });
        }
      } else if (transaction.action === 'return') {
        const book = await db.books.get(transaction.bookId);
        if (book) {
          // Ensure we don't exceed total quantity (support legacy totalQuantity or new quantity field)
          const total = book.quantity || (book as any).totalQuantity || 0;
          const newAvailability = Math.min(total, (book.availableQuantity || 0) + 1);
          await db.books.update(transaction.bookId, {
            availableQuantity: newAvailability
          });
        }
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/books'] });
    }
  });
}

export function useUpdateTransaction() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Transaction> }) => {
      return await db.transactions.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/transactions'] });
    }
  });
}
