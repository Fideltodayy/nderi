import { useState } from "react";
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
import { Barcode } from "lucide-react";
import { useBooks } from "@/hooks/useBooks";
import { useTransactions, useUpdateTransaction, useAddTransaction } from "@/hooks/useTransactions";
import { useToast } from "@/hooks/use-toast";

interface ReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReturnDialog({ open, onOpenChange }: ReturnDialogProps) {
  const [barcode, setBarcode] = useState("");
  const [foundTransaction, setFoundTransaction] = useState<any | null>(null);
  
  const { data: books = [] } = useBooks();
  const { data: transactions = [] } = useTransactions();
  const updateTransaction = useUpdateTransaction();
  const addTransaction = useAddTransaction();
  const { toast } = useToast();

  const handleBarcodeSubmit = async () => {
    const book = books.find(b => b.barcode === barcode);
    if (!book) {
      toast({
        title: "Book Not Found",
        description: `No book found with barcode: ${barcode}`,
        variant: "destructive",
      });
      return;
    }
    
    // Find active transaction for this book
    const activeTransaction = transactions.find(t => 
      t.bookId === book.id && t.status === 'active'
    );
    
    if (activeTransaction) {
      setFoundTransaction(activeTransaction);
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
            status: 'returned',
            returnDate: new Date(),
          }
        });
        
        // Create return transaction record (this automatically increments book availability)
        await addTransaction.mutateAsync({
          bookId: foundTransaction.bookId,
          studentId: foundTransaction.studentId,
          action: 'return',
          date: new Date(),
          status: 'returned',
          returnDate: new Date(),
        });
        
        toast({
          title: "Book Returned",
          description: `${foundTransaction.bookTitle} has been returned`,
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
    setBarcode("");
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
            <Label htmlFor="return-barcode">Book Barcode</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="return-barcode"
                  placeholder="Scan or type barcode..."
                  className="pl-10 text-lg"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSubmit()}
                  autoFocus
                  data-testid="input-return-barcode"
                />
              </div>
              <Button onClick={handleBarcodeSubmit} data-testid="button-lookup-transaction">
                Lookup
              </Button>
            </div>
          </div>

          {foundTransaction && (
            <Card className="p-4 bg-muted/50">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Book</p>
                  <p className="font-semibold">{foundTransaction.bookTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Borrowed By</p>
                  <p className="font-medium">{foundTransaction.studentName}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Borrowed</p>
                    <p className="text-sm">{foundTransaction.borrowDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due</p>
                    <p className="text-sm">{foundTransaction.dueDate.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel-return">
            Cancel
          </Button>
          {foundTransaction && (
            <Button onClick={handleConfirm} data-testid="button-confirm-return">
              Confirm Return
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
