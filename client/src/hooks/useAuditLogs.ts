import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import type { AuditLog } from '@/lib/db';

export function useAuditLogs(options?: { riskLevel?: 'low' | 'medium' | 'high' }) {
  return useQuery({
    queryKey: ['auditLogs', options],
    queryFn: async () => {
      let query = db.auditLogs.orderBy('timestamp').reverse();
      if (options?.riskLevel) {
        query = query.filter(log => log.riskLevel === options.riskLevel);
      }
      return query.toArray();
    }
  });
}

export function useAddAuditLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (log: Omit<AuditLog, 'id'>) => {
      const id = await db.auditLogs.add({
        ...log,
        timestamp: new Date(),
        userId: 'librarian', // TODO: Replace with actual user ID when auth is added
      });
      return { ...log, id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    }
  });
}

// Helper function to detect suspicious activity
export function detectSuspiciousActivity(
  action: AuditLog['action'],
  resourceType: AuditLog['resourceType'],
  previousState: any,
  newState: any
): { isRisky: boolean; riskLevel: 'low' | 'medium' | 'high'; notes: string } {
  if (resourceType === 'book') {
    // Case 1: Large quantity changes
    if (previousState?.quantity && newState?.quantity) {
      const change = Math.abs(newState.quantity - previousState.quantity);
      const changePercent = (change / previousState.quantity) * 100;
      
      if (changePercent >= 50) {
        return {
          isRisky: true,
          riskLevel: 'high',
          notes: `Large quantity change detected (${changePercent.toFixed(0)}% change)`
        };
      }
    }

    // Case 2: Price changes
    if (previousState?.price && newState?.price) {
      const priceChange = Math.abs(newState.price - previousState.price);
      const priceChangePercent = (priceChange / previousState.price) * 100;
      
      if (priceChangePercent >= 30) {
        return {
          isRisky: true,
          riskLevel: 'high',
          notes: `Significant price change detected (${priceChangePercent.toFixed(0)}% change)`
        };
      }
    }

    // Case 3: Deletion of books with active loans
    if (action === 'delete' && previousState?.availableQuantity !== previousState?.quantity) {
      return {
        isRisky: true,
        riskLevel: 'high',
        notes: 'Attempting to delete book with active loans'
      };
    }
  }

  // Case 4: Transaction manipulation
  if (resourceType === 'transaction') {
    if (action === 'update' && 
        previousState?.status === 'active' && 
        newState?.status === 'returned' &&
        !newState?.returnDate) {
      return {
        isRisky: true,
        riskLevel: 'medium',
        notes: 'Transaction marked as returned without return date'
      };
    }
  }

  // Case 5: Multiple status changes on same book
  if (resourceType === 'book' && action === 'update') {
    if (previousState?.status !== newState?.status) {
      return {
        isRisky: true,
        riskLevel: 'low',
        notes: `Book status changed from ${previousState?.status} to ${newState?.status}`
      };
    }
  }

  // Default: No risk detected
  return {
    isRisky: false,
    riskLevel: 'low',
    notes: ''
  };
}