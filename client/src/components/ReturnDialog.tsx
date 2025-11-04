import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Barcode, AlertTriangle } from "lucide-react";
import { useBooks } from "@/hooks/useBooks";
import { Book, Student, Transaction } from "@/lib/db";
import { useStudents } from "@/hooks/useStudents";
import LostDamagedDialog from "./LostDamagedDialog";
import {
  useTransactions,
  useUpdateTransaction,
  useAddTransaction,
} from "@/hooks/useTransactions";
import { useToast } from "@/hooks/use-toast";

interface ReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReturnDialog({
  open,
  onOpenChange,
}: ReturnDialogProps) {
  const [bookSearch, setBookSearch] = useState("");
  const [showBookResults, setShowBookResults] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [foundTransaction, setFoundTransaction] = useState<Transaction | null>(null);
  const [showLostDamagedDialog, setShowLostDamagedDialog] = useState(false);
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);

  const { data: books = [] } = useBooks();
  const { data: transactions = [] } = useTransactions();
  const { data: students = [] } = useStudents();
  const updateTransaction = useUpdateTransaction();
  const addTransaction = useAddTransaction();
  const { toast } = useToast();

  const formatDate = (value: any) => {
    if (!value) return "—";
    const d = value instanceof Date ? value : new Date(value);
    return Number.isFinite(d.getTime()) ? d.toLocaleDateString() : "—";
  };

  const filteredBooks = useMemo(() => {
    if (!bookSearch) return [];
    const search = bookSearch.toLowerCase();
    return books
      .filter((b: any) => 
        (b.barcode || '').toLowerCase().includes(search) ||
        (b.title || '').toLowerCase().includes(search)
      )
      .filter((b: any) => (b.quantity || (b as any).totalQuantity || 0) - (b.availableQuantity || 0) > 0) // Only show books that are borrowed
      .slice(0, 5);
  }, [books, bookSearch]);

  const handleBookSelect = (book: any) => {
    setSelectedBook(book);
    setBookSearch(book.title);
    setShowBookResults(false);
    lookupTransaction(book);
  };

  const handleBarcodeSubmit = () => {
    // Try to find a book by exact barcode first, then by title
    const q = (bookSearch || '').trim().toLowerCase();
    if (!q) {
      toast({ title: 'Enter barcode or title', variant: 'destructive' });
      return;
    }

    const found = books.find((b: any) => (b.barcode || '').toLowerCase() === q) ||
      books.find((b: any) => (b.title || '').toLowerCase().includes(q));

    if (found) {
      setSelectedBook(found);
      setBookSearch(found.title);
      setShowBookResults(false);
      lookupTransaction(found);
    } else {
      toast({ title: 'Not found', description: 'No matching borrowed book found', variant: 'destructive' });
    }
  };

  const lookupTransaction = (book: any) => {
    if (!book) {
      toast({
        title: "Book Not Found",
        description: "Please select a book from the search results",
        variant: "destructive",
      });
      return;
    }

    // Find active transaction for this book
    const activeTransaction = transactions.find(
      (t) => t.bookId === book.id && t.status === "active"
    );

    if (activeTransaction) {
      setFoundTransaction(activeTransaction);
      const student = students.find(s => s.id === activeTransaction.studentId);
      if (student) {
        setFoundStudent(student);
      }
    } else {
      toast({
        title: "No Active Loan",
        description: "This book is not currently checked out",
        variant: "destructive",
      });
    }
  };

  const handleConfirm = async () => {
    if (foundTransaction) {
      try {
        // Update existing transaction to returned
        await updateTransaction.mutateAsync({
          id: foundTransaction.id!,
          data: {
            status: "returned",
            returnDate: new Date(),
          },
        });

        // Create return transaction record (this automatically increments book availability)
        await addTransaction.mutateAsync({
          bookId: foundTransaction.bookId,
          studentId: foundTransaction.studentId,
          action: "return",
          date: new Date(),
          status: "returned",
          returnDate: new Date(),
        });

        toast({
          title: "Book Returned",
          description: `${selectedBook?.title || ''} has been returned`,
        });

        handleClose();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process return",
          variant: "destructive",
        });
      }
    }
  };

  const handleClose = () => {
    setBookSearch("");
    setSelectedBook(null);
    setShowBookResults(false);
    setFoundTransaction(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-return">
        <DialogHeader>
          <DialogTitle>Return Book</DialogTitle>
          <DialogDescription>
            Scan or enter the book barcode to process return
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="return-barcode">Book Barcode or Title</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="return-barcode"
                    placeholder="Scan or type barcode or title..."
                    className="pl-10 text-lg"
                    value={bookSearch}
                    onChange={(e) => { setBookSearch(e.target.value); setShowBookResults(true); setSelectedBook(null); }}
                    onKeyDown={(e) => e.key === "Enter" && handleBarcodeSubmit()}
                    onFocus={() => setShowBookResults(true)}
                    autoFocus
                    data-testid="input-return-barcode"
                  />
                </div>
                <Button
                  onClick={handleBarcodeSubmit}
                  data-testid="button-lookup-transaction"
                >
                  Lookup
                </Button>
              </div>

              {showBookResults && filteredBooks.length > 0 && (
                <div className="border rounded-md max-h-48 overflow-y-auto">
                  {filteredBooks.map((book: any) => {
                    const isSelected = selectedBook && selectedBook.id === book.id;
                    return (
                      <button
                        key={book.id}
                        onClick={() => handleBookSelect(book)}
                        className={`w-full text-left px-4 py-2 hover:bg-muted/40 transition-colors
                          ${isSelected ? 'bg-muted border-l-4 border-primary shadow-sm' : ''}`}
                        data-testid={`return-book-option-${book.id}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`font-medium ${isSelected ? 'text-primary' : ''}`}>{book.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {book.barcode} • {book.subject || book.category}
                            </p>
                          </div>
                          <span className="text-sm text-orange-600 font-medium">
                            {(book.quantity || (book as any).totalQuantity || 0) - (book.availableQuantity || 0)} out
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          {foundTransaction && (
            <Card className="p-4 bg-muted/50">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Book</p>
                  <p className="font-semibold">{selectedBook?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Borrowed By</p>
                  <p className="font-medium">{foundStudent?.name}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Borrowed</p>
                    <p className="text-sm">
                      {formatDate(foundTransaction.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due</p>
                    <p className="text-sm">
                      {formatDate(foundTransaction.dueDate)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            data-testid="button-cancel-return"
          >
            Cancel
          </Button>
          {foundTransaction && foundStudent && (
            <>
              <Button
                variant="destructive"
                onClick={() => setShowLostDamagedDialog(true)}
                className="gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Mark as Lost/Damaged
              </Button>
              <Button onClick={handleConfirm} data-testid="button-confirm-return">
                Confirm Return
              </Button>
            </>
          )}
        </div>
      </DialogContent>

      {selectedBook && foundTransaction && foundStudent && (
        <LostDamagedDialog
          book={selectedBook}
          student={foundStudent}
          transaction={foundTransaction}
          open={showLostDamagedDialog}
          onOpenChange={setShowLostDamagedDialog}
        />
      )}
    </Dialog>
  );
}
