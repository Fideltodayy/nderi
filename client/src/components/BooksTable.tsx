import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Trash2 } from "lucide-react";
import { Book } from "@/lib/db";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDeleteBook } from "@/hooks/useBooks";
import { useToast } from "@/hooks/use-toast";
import EditBookDialog from "./EditBookDialog";

interface BooksTableProps {
  books: Book[];
  onEdit?: (book: Book) => void;
  onView?: (book: Book) => void;
}

export default function BooksTable({ books, onEdit, onView }: BooksTableProps) {
  const ADMIN_PIN = '1234'; // Frontend PIN for sensitive operations (replace as needed)
  const deleteBook = useDeleteBook();
  const { toast } = useToast();
  const [showPinModal, setShowPinModal] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [pendingBook, setPendingBook] = useState<Book | null>(null);
  const [pendingOperation, setPendingOperation] = useState<'edit' | 'delete' | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);

  const openPinModal = (book: Book, operation: 'edit' | 'delete') => {
    setPendingBook(book);
    setPendingOperation(operation);
    setPinValue('');
    setPinError(null);
    setShowPinModal(true);
  };

  const handleConfirmOperation = async () => {
    if (pinValue !== ADMIN_PIN) {
      setPinError('Invalid PIN');
      return;
    }

    if (!pendingBook?.id) return;

    try {
      if (pendingOperation === 'delete') {
        await deleteBook.mutateAsync(pendingBook.id);
        toast({ title: 'Book Deleted', description: `${pendingBook.title} has been removed from the catalog` });
      } else if (pendingOperation === 'edit') {
        // Show the edit dialog after PIN verification
        setShowEditDialog(true);
      }
      setShowPinModal(false);
    } catch (err) {
      toast({ 
        title: `${pendingOperation === 'delete' ? 'Delete' : 'Edit'} Failed`, 
        description: `Could not ${pendingOperation} the book`, 
        variant: 'destructive' 
      });
    }
  };
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Barcode</TableHead>
            <TableHead className="font-semibold">Title</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold">Subject</TableHead>
            <TableHead className="font-semibold">Grades</TableHead>
            <TableHead className="font-semibold text-right">Price</TableHead>
            <TableHead className="font-semibold text-right">Quantity</TableHead>
            <TableHead className="font-semibold text-right">Available</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No books found
              </TableCell>
            </TableRow>
          ) : (
            books.map((book) => (
              <TableRow key={book.id} className="hover-elevate" data-testid={`row-book-${book.id}`}>
                <TableCell className="font-mono text-sm" data-testid={`text-barcode-${book.id}`}>{book.barcode}</TableCell>
                <TableCell className="font-medium" data-testid={`text-title-${book.id}`}>{book.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">{book.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{book.subject}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {book.grades && book.grades.length > 0
                    ? book.grades.map((g) => `Grade ${g}`).join(', ')
                    : '—'}
                </TableCell>
                <TableCell className="text-right">KSH {(book.price || 0).toFixed(2)}</TableCell>
                <TableCell className="text-right">{book.quantity || (book as any).totalQuantity || 0}</TableCell>
                <TableCell className="text-right font-medium">{book.availableQuantity || 0}</TableCell>
                <TableCell>
                  {(book.status || 'active') === 'active' ? (
                    (book.availableQuantity || 0) > 0 ? (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                        All Borrowed
                      </Badge>
                    )
                  ) : (
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                      {book.status!.charAt(0).toUpperCase() + book.status!.slice(1)}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        console.log('View book:', book.title);
                        onView?.(book);
                      }}
                      data-testid={`button-view-${book.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openPinModal(book, 'edit')}
                      data-testid={`button-edit-${book.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openPinModal(book, 'delete')}
                      data-testid={`button-delete-${book.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* PIN confirmation modal for protected operations */}
      <Dialog open={showPinModal} onOpenChange={() => setShowPinModal(false)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>
              Confirm {pendingOperation === 'delete' ? 'Deletion' : 'Edit'}
            </DialogTitle>
            <DialogDescription>
              Enter the administrator PIN to {pendingOperation === 'delete' ? 'delete' : 'edit'} the book
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm">Book: <span className="font-semibold">{pendingBook?.title}</span></p>
            <Input
              type="password"
              placeholder="Enter PIN"
              value={pinValue}
              onChange={(e) => { setPinValue(e.target.value); setPinError(null); }}
              data-testid="input-pin"
            />
            {pinError && <p className="text-sm text-red-600">{pinError}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPinModal(false)}>Cancel</Button>
            <Button 
              onClick={handleConfirmOperation} 
              data-testid={`button-confirm-${pendingOperation}`}
              variant={pendingOperation === 'delete' ? 'destructive' : 'default'}
            >
              Confirm {pendingOperation === 'delete' ? 'Delete' : 'Edit'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Book Dialog */}
      <EditBookDialog 
        book={pendingBook}
        open={showEditDialog} 
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            setPendingBook(null);
            setPendingOperation(null);
          }
        }} 
      />
    </div>
  );
}
