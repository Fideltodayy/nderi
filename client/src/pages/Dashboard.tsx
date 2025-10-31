import { useState } from "react";
import StatCard from "@/components/StatCard";
import TopBooksChart from "@/components/TopBooksChart";
import TransactionsTable from "@/components/TransactionsTable";
import { BookOpen, BookCheck, BookX, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  // TODO: remove mock functionality - replace with real data from IndexedDB
  const [stats] = useState({
    totalBooks: 1247,
    available: 892,
    borrowed: 355,
    overdue: 23
  });

  const topBooks = [
    { title: 'Strange Happenings', borrowed: 23 },
    { title: 'Master English 7', borrowed: 18 },
    { title: 'The last laugh', borrowed: 15 },
    { title: 'Poetry Simplified', borrowed: 12 },
    { title: 'Oxford Dictionaries', borrowed: 10 },
    { title: 'Miradi na Matematik...', borrowed: 8 },
    { title: 'Master English 8', borrowed: 7 },
    { title: 'Oxford Start Eng 7', borrowed: 6 },
  ];

  const recentTransactions = [
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
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Library status and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Books"
          value={stats.totalBooks.toLocaleString()}
          icon={BookOpen}
          trend="+12 this month"
          iconColor="text-primary"
        />
        <StatCard
          title="Available"
          value={stats.available.toLocaleString()}
          icon={BookCheck}
          iconColor="text-green-600"
        />
        <StatCard
          title="Borrowed"
          value={stats.borrowed.toLocaleString()}
          icon={BookX}
          iconColor="text-orange-600"
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          icon={AlertCircle}
          iconColor="text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopBooksChart books={topBooks} />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <TransactionsTable transactions={recentTransactions} />
        </Card>
      </div>
    </div>
  );
}
