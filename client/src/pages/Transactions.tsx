import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TransactionsTable from "@/components/TransactionsTable";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // TODO: remove mock functionality - replace with real data from IndexedDB
  const transactions = [
    {
      id: 1,
      bookTitle: 'Strange Happenings',
      studentName: 'John Doe',
      action: 'borrow' as const,
      date: new Date('2025-10-30T10:30:00'),
      dueDate: new Date('2025-11-13'),
      status: 'active' as const,
    },
    {
      id: 2,
      bookTitle: 'The last laugh',
      studentName: 'Jane Smith',
      action: 'return' as const,
      date: new Date('2025-10-30T09:15:00'),
      returnDate: new Date('2025-10-30'),
      status: 'returned' as const,
    },
    {
      id: 3,
      bookTitle: 'Master English 7',
      studentName: 'Bob Wilson',
      action: 'borrow' as const,
      date: new Date('2025-10-29T14:20:00'),
      dueDate: new Date('2025-11-12'),
      status: 'active' as const,
    },
    {
      id: 4,
      bookTitle: 'Poetry Simplified',
      studentName: 'Alice Brown',
      action: 'return' as const,
      date: new Date('2025-10-29T11:45:00'),
      returnDate: new Date('2025-10-29'),
      status: 'returned' as const,
    },
    {
      id: 5,
      bookTitle: 'Oxford Dictionaries',
      studentName: 'Charlie Davis',
      action: 'borrow' as const,
      date: new Date('2025-10-28T16:00:00'),
      dueDate: new Date('2025-11-11'),
      status: 'active' as const,
    },
    {
      id: 6,
      bookTitle: 'The Good Earth',
      studentName: 'Frank Garcia',
      action: 'borrow' as const,
      date: new Date('2025-10-15T10:00:00'),
      dueDate: new Date('2025-10-29'),
      status: 'overdue' as const,
    },
    {
      id: 7,
      bookTitle: 'Bridges without rivers',
      studentName: 'Diana Evans',
      action: 'return' as const,
      date: new Date('2025-10-27T15:30:00'),
      returnDate: new Date('2025-10-27'),
      status: 'returned' as const,
    },
    {
      id: 8,
      bookTitle: 'Master English 8',
      studentName: 'Grace Harris',
      action: 'borrow' as const,
      date: new Date('2025-10-26T11:00:00'),
      dueDate: new Date('2025-11-09'),
      status: 'active' as const,
    },
    {
      id: 9,
      bookTitle: 'Understanding oral literature by Austin Bukenya',
      studentName: 'Henry Jackson',
      action: 'return' as const,
      date: new Date('2025-10-25T14:15:00'),
      returnDate: new Date('2025-10-25'),
      status: 'returned' as const,
    },
    {
      id: 10,
      bookTitle: 'Oxford Head start oral literature',
      studentName: 'Ivy King',
      action: 'borrow' as const,
      date: new Date('2025-10-20T09:30:00'),
      dueDate: new Date('2025-11-03'),
      status: 'active' as const,
    },
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || transaction.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Transaction History</h2>
        <p className="text-muted-foreground mt-1">View all borrowing and return activities</p>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="search"
            placeholder="Search by book or student..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-transactions-search"
          />
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <Badge 
            variant={statusFilter === 'active' ? 'default' : 'outline'} 
            className="cursor-pointer hover-elevate"
            onClick={() => setStatusFilter(statusFilter === 'active' ? null : 'active')}
            data-testid="filter-active"
          >
            Active
          </Badge>
          <Badge 
            variant={statusFilter === 'returned' ? 'default' : 'outline'} 
            className="cursor-pointer hover-elevate"
            onClick={() => setStatusFilter(statusFilter === 'returned' ? null : 'returned')}
            data-testid="filter-returned"
          >
            Returned
          </Badge>
          <Badge 
            variant={statusFilter === 'overdue' ? 'default' : 'outline'} 
            className="cursor-pointer hover-elevate"
            onClick={() => setStatusFilter(statusFilter === 'overdue' ? null : 'overdue')}
            data-testid="filter-overdue"
          >
            Overdue
          </Badge>
          {statusFilter && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setStatusFilter(null)}
              data-testid="button-clear-filter"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground ml-auto">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </div>
      </div>

      <TransactionsTable transactions={filteredTransactions} />
    </div>
  );
}
