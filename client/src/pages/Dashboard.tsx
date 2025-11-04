import { useMemo } from "react";
import StatCard from "@/components/StatCard";
import TopBooksChart from "@/components/TopBooksChart";
import TransactionsTable from "@/components/TransactionsTable";
import { BookOpen, BookCheck, BookX, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBooks } from "@/hooks/useBooks";
import { useTransactions } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import { db, Book, Student } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: books = [], isLoading: booksLoading } = useBooks();
  const { data: transactionsData = [], isLoading: transactionsLoading } = useTransactions();
  const { toast } = useToast();

  const stats = useMemo(() => {
  const totalBooks = books.reduce((sum, book) => sum + (book.quantity || (book as any).totalQuantity || 0), 0);
    const available = books.reduce((sum, book) => sum + (book.availableQuantity || 0), 0);
    const borrowed = totalBooks - available;
    
    // Count overdue transactions
    const now = new Date();
    const overdue = transactionsData.filter(t => 
      t.status === 'active' && t.dueDate && new Date(t.dueDate) < now
    ).length;
    
    return { totalBooks, available, borrowed, overdue };
  }, [books, transactionsData]);

  const topBooks = useMemo(() => {
    const borrowCounts = transactionsData
      .filter(t => t.action === 'borrow')
      .reduce((acc, t) => {
        acc[t.bookTitle] = (acc[t.bookTitle] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    return Object.entries(borrowCounts)
      .map(([title, borrowed]) => ({ title, borrowed }))
      .sort((a, b) => b.borrowed - a.borrowed)
      .slice(0, 8);
  }, [transactionsData]);

  const recentTransactions = useMemo(() => {
    return transactionsData
      .map(t => ({
        ...t,
        date: new Date(t.date),
        dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
        returnDate: t.returnDate ? new Date(t.returnDate) : undefined,
      }))
      .slice(0, 5);
  }, [transactionsData]);

  const handleInitializeSampleData = async () => {
    try {
      // Check if data already exists
      const existingBooks = await db.books.count();
      if (existingBooks > 0) {
        toast({
          title: "Data Already Exists",
          description: "Sample data has already been initialized",
          variant: "destructive",
        });
        return;
      }

  // Initialize sample data from CSV_IMPORT_TEMPLATE
  const sampleBooks: Omit<Book, 'id'>[] = [
        { barcode: '001', title: 'Strange Happenings', category: 'ENGLISH CLASS READERS', subject: 'English', grades: [7], quantity: 15, availableQuantity: 15, price: 850, status: 'active' },
        { barcode: '002', title: 'The last laugh', category: 'ENGLISH CLASS READERS', subject: 'English', grades: [7], quantity: 15, availableQuantity: 15, price: 850, status: 'active' },
        { barcode: '003', title: 'The Good Earth', category: 'ENGLISH CLASS READERS', subject: 'English', grades: [8], quantity: 15, availableQuantity: 15, price: 850, status: 'active' },
        { barcode: '004', title: 'Bridges without rivers', category: 'ENGLISH CLASS READERS', subject: 'English', grades: [8], quantity: 15, availableQuantity: 15, price: 850, status: 'active' },
        { barcode: '005', title: 'The hidden package', category: 'ENGLISH CLASS READERS', subject: 'English', grades: [9], quantity: 15, availableQuantity: 15, price: 850, status: 'active' },
        { barcode: '006', title: 'Understanding oral literature by Austin Bukenya', category: 'ORAL LITERATURE', subject: 'Literature', grades: [8], quantity: 8, availableQuantity: 8, price: 950, status: 'active' },
        { barcode: '007', title: 'Oxford Head start oral literature and skills', category: 'ORAL LITERATURE', subject: 'Literature', grades: [7], quantity: 8, availableQuantity: 8, price: 950, status: 'active' },
        { barcode: '008', title: 'Master English 7', category: 'ENGLISH', subject: 'English', grades: [7], quantity: 8, availableQuantity: 8, price: 750, status: 'active' },
        { barcode: '009', title: 'Master English 8', category: 'ENGLISH', subject: 'English', grades: [8], quantity: 8, availableQuantity: 8, price: 750, status: 'active' },
        { barcode: '010', title: 'Master English 9', category: 'ENGLISH', subject: 'English', grades: [9], quantity: 8, availableQuantity: 8, price: 750, status: 'active' },
        { barcode: '011', title: 'Poetry Simplified: A guide to oral and literacy skills', category: 'POETRY', subject: 'Literature', grades: [7], quantity: 8, availableQuantity: 8, price: 850, status: 'active' },
        { barcode: '012', title: 'A poetry course for KCSE by Paul Robin', category: 'POETRY', subject: 'Literature', grades: [9], quantity: 8, availableQuantity: 8, price: 850, status: 'active' },
        { barcode: '013', title: 'Miradi na Mtihani', category: 'KISWAHILI', subject: 'Kiswahili', grades: [7], quantity: 8, availableQuantity: 8, price: 750, status: 'active' },
        { barcode: '014', title: 'Maana Mapya', category: 'KISWAHILI', subject: 'Kiswahili', grades: [8], quantity: 8, availableQuantity: 8, price: 750, status: 'active' },
      ];

  const sampleStudents: Omit<Student, 'id'>[] = [
        { studentId: 'S001', name: 'John Doe', class: 'Grade 7', contact: '0712345678' },
        { studentId: 'S002', name: 'Jane Smith', class: 'Grade 8', contact: '0723456789' },
        { studentId: 'S003', name: 'Bob Wilson', class: 'Grade 7', contact: '0734567890' },
        { studentId: 'S004', name: 'Alice Brown', class: 'Grade 9', contact: '' },
        { studentId: 'S005', name: 'Charlie Davis', class: 'Grade 8', contact: '0756789012' },
      ];

      await db.books.bulkAdd(sampleBooks);
      await db.students.bulkAdd(sampleStudents);

      toast({
        title: "Sample Data Loaded",
        description: `Added ${sampleBooks.length} books and ${sampleStudents.length} students`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize sample data",
        variant: "destructive",
      });
    }
  };

  if (booksLoading || transactionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  const isEmpty = books.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Library status and insights</p>
        </div>
        {isEmpty && (
          <Button onClick={handleInitializeSampleData} data-testid="button-load-sample-data">
            Load Sample Data
          </Button>
        )}
      </div>

      {isEmpty ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-xl font-semibold">No Data Yet</h3>
              <p className="text-muted-foreground mt-2">
                Get started by loading sample data or importing your catalog
              </p>
            </div>
            <div className="flex gap-2 justify-center mt-4">
              <Button onClick={handleInitializeSampleData} data-testid="button-load-sample-data-empty">
                Load Sample Data
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Books"
              value={stats.totalBooks.toLocaleString()}
              icon={BookOpen}
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
            {topBooks.length > 0 ? (
              <TopBooksChart books={topBooks} />
            ) : (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Most Borrowed Books</h3>
                <p className="text-sm text-muted-foreground">No transaction history yet</p>
              </Card>
            )}
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              {recentTransactions.length > 0 ? (
                <TransactionsTable transactions={recentTransactions as any} />
              ) : (
                <p className="text-sm text-muted-foreground">No transactions yet</p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
