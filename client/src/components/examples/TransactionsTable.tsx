import TransactionsTable from '../TransactionsTable';

export default function TransactionsTableExample() {
  const mockTransactions = [
    {
      id: 1,
      bookTitle: 'Strange Happenings',
      studentName: 'John Doe',
      action: 'borrow' as const,
      date: new Date('2025-10-25'),
      dueDate: new Date('2025-11-08'),
      status: 'active' as const,
    },
    {
      id: 2,
      bookTitle: 'The last laugh',
      studentName: 'Jane Smith',
      action: 'return' as const,
      date: new Date('2025-10-28'),
      returnDate: new Date('2025-10-28'),
      status: 'returned' as const,
    },
    {
      id: 3,
      bookTitle: 'Master English 7',
      studentName: 'Bob Wilson',
      action: 'borrow' as const,
      date: new Date('2025-10-15'),
      dueDate: new Date('2025-10-29'),
      status: 'overdue' as const,
    },
  ];

  return (
    <div className="p-4">
      <TransactionsTable transactions={mockTransactions} />
    </div>
  );
}
