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
import { Barcode, User, Calendar } from "lucide-react";
import { Book, Student } from "@/lib/db";
import { useBooks } from "@/hooks/useBooks";
import { useStudents } from "@/hooks/useStudents";
import { useAddTransaction } from "@/hooks/useTransactions";
import { useToast } from "@/hooks/use-toast";
import { addDays } from "date-fns";

interface CheckOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CheckOutDialog({ open, onOpenChange }: CheckOutDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [bookSearch, setBookSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [showBookResults, setShowBookResults] = useState(false);
  
  const { data: books = [] } = useBooks();
  const { data: students = [] } = useStudents();
  const addTransaction = useAddTransaction();
  const { toast } = useToast();
  
  // Set default due date to 14 days from now
  const defaultDueDate = useMemo(() => {
    return addDays(new Date(), 14).toISOString().split('T')[0];
  }, []);

  const filteredBooks = useMemo(() => {
    if (!bookSearch) return [];
    const search = bookSearch.toLowerCase();
    return books
      .filter(b => 
        b.barcode.toLowerCase().includes(search) ||
        b.title.toLowerCase().includes(search)
      )
      .filter(b => b.availableQuantity > 0)
      .slice(0, 5);
  }, [books, bookSearch]);

  const handleBookSelect = (book: Book) => {
    if (book.availableQuantity > 0) {
      setSelectedBook(book);
      setBookSearch(book.title);
      setShowBookResults(false);
      setDueDate(defaultDueDate);
      setStep(2);
    } else {
      toast({
        title: "Book Unavailable",
        description: "All copies of this book are currently checked out",
        variant: "destructive",
      });
    }
  };

  const filteredStudents = useMemo(() => {
    if (!studentSearch) return [];
    const search = studentSearch.toLowerCase();
    return students.filter(s => 
      s.name.toLowerCase().includes(search) ||
      s.studentId.toLowerCase().includes(search)
    ).slice(0, 5);
  }, [students, studentSearch]);

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleConfirm = async () => {
    if (selectedBook && selectedStudent && dueDate) {
      try {
        await addTransaction.mutateAsync({
          bookId: selectedBook.id!,
          studentId: selectedStudent.id!,
          action: 'borrow',
          date: new Date(),
          dueDate: new Date(dueDate),
          status: 'active',
        });
        
        toast({
          title: "Book Checked Out",
          description: `${selectedBook.title} checked out to ${selectedStudent.name}`,
        });
        
        handleClose();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to check out book",
          variant: "destructive",
        });
      }
    }
  };

  const handleClose = () => {
    setStep(1);
    setBookSearch("");
    setSelectedBook(null);
    setStudentSearch("");
    setSelectedStudent(null);
    setDueDate("");
    setShowBookResults(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]" data-testid="dialog-checkout">
        <DialogHeader>
          <DialogTitle>Check Out Book</DialogTitle>
          <DialogDescription>
            {step === 1 ? "Scan or enter the book barcode" : "Select student and due date"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bookSearch">Search Book</Label>
                <div className="relative">
                  <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="bookSearch"
                    placeholder="Search by title or barcode..."
                    className="pl-10 text-lg"
                    value={bookSearch}
                    onChange={(e) => {
                      setBookSearch(e.target.value);
                      setShowBookResults(true);
                      setSelectedBook(null);
                    }}
                    onFocus={() => setShowBookResults(true)}
                    autoFocus
                    data-testid="input-book-search"
                  />
                </div>
                {showBookResults && filteredBooks.length > 0 && (
                  <div className="border rounded-md max-h-48 overflow-y-auto">
                    {filteredBooks.map(book => {
                      const isSelected = selectedBook && selectedBook.id === book.id;
                      return (
                        <button
                          key={book.id}
                          onClick={() => handleBookSelect(book)}
                          className={`w-full text-left px-4 py-2 hover:bg-muted/40 transition-colors
                            ${isSelected ? 'bg-muted border-l-4 border-primary shadow-sm' : ''}`}
                          data-testid={`book-option-${book.id}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className={`font-medium ${isSelected ? 'text-primary' : ''}`}>{book.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {book.barcode} • {book.subject || book.category}
                              </p>
                            </div>
                            <span className="text-sm text-green-600 font-medium">
                              {book.availableQuantity} available
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedBook && (
                <Card className="p-4 bg-muted/50">
                  <div className="space-y-2">
                    <h4 className="font-semibold">{selectedBook.title}</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Barcode: {selectedBook.barcode}</p>
                      <p>Category: {selectedBook.category}</p>
                      <p>Subject: {selectedBook.subject}</p>
                      <p>Available: {selectedBook.availableQuantity} of {selectedBook.quantity}</p>
                      <p>Price: KSH {(selectedBook.price || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {step === 2 && selectedBook && (
            <div className="space-y-4">
              <Card className="p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground">Selected Book</p>
                <p className="font-semibold">{selectedBook.title}</p>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="student">Student</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="student"
                    placeholder="Search student by name or ID..."
                    className="pl-10"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    data-testid="input-student-search"
                  />
                </div>
                {filteredStudents.length > 0 && (
                  <div className="border rounded-md max-h-48 overflow-y-auto">
                    {filteredStudents.map(student => {
                      const isSelected = selectedStudent && selectedStudent.id === student.id;
                      return (
                        <button
                          key={student.id}
                          onClick={() => handleStudentSelect(student)}
                          className={`w-full text-left px-4 py-2 hover:bg-muted/40 transition-colors
                            ${isSelected ? 'bg-muted border-l-4 border-primary shadow-sm' : ''}`}
                          data-testid={`student-option-${student.id}`}
                        >
                          <p className={`font-medium ${isSelected ? 'text-primary' : ''}`}>{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.studentId} • {student.class}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedStudent && (
                <Card className="p-4 bg-muted/50">
                  <div className="space-y-1">
                    <p className="font-semibold">{selectedStudent.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudent.studentId} • {selectedStudent.class}
                    </p>
                  </div>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="dueDate"
                    type="date"
                    className="pl-10"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    data-testid="input-due-date"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel">
            Cancel
          </Button>
          {step === 2 && (
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedStudent || !dueDate}
              data-testid="button-confirm-checkout"
            >
              Confirm Check Out
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
