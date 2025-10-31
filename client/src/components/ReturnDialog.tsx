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

interface ReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (transactionId: number) => void;
}

export default function ReturnDialog({ open, onOpenChange, onConfirm }: ReturnDialogProps) {
  const [barcode, setBarcode] = useState("");
  const [foundTransaction, setFoundTransaction] = useState<any | null>(null);

  const handleBarcodeSubmit = () => {
    // Mock transaction lookup
    const mockTransaction = {
      id: 1,
      bookTitle: "Strange Happenings",
      studentName: "John Doe",
      borrowDate: new Date('2025-10-25'),
      dueDate: new Date('2025-11-08')
    };
    setFoundTransaction(mockTransaction);
    console.log('Transaction found:', mockTransaction);
  };

  const handleConfirm = () => {
    if (foundTransaction) {
      console.log('Return confirmed:', foundTransaction);
      onConfirm?.(foundTransaction.id);
      handleClose();
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
