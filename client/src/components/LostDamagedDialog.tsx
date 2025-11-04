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
import { Textarea } from "@/components/ui/textarea";
import { Book, Student, Transaction } from "@/lib/db";
import { useBooks } from "@/hooks/useBooks";
import { useAddBadDebt } from "@/hooks/useBadDebts";
import { useUpdateTransaction } from "@/hooks/useTransactions";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";

interface LostDamagedDialogProps {
  book: Book;
  student: Student;
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LostDamagedDialog({
  book,
  student,
  transaction,
  open,
  onOpenChange,
}: LostDamagedDialogProps) {
  const [type, setType] = useState<'lost' | 'damaged'>('lost');
  const [amount, setAmount] = useState(book.price.toString());
  const [notes, setNotes] = useState('');

  const updateTransaction = useUpdateTransaction();
  const addBadDebt = useAddBadDebt();
  const { toast } = useToast();

  const handleConfirm = async () => {
    try {
      // Update the transaction status
      await updateTransaction.mutateAsync({
        id: transaction.id!,
        data: {
          status: type,
          action: type,
          notes,
        },
      });

      // Create a bad debt record
      await addBadDebt.mutateAsync({
        transactionId: transaction.id!,
        bookId: book.id!,
        studentId: student.id!,
        amount: parseFloat(amount),
        date: new Date(),
        status: 'pending',
        type,
        notes,
      });

      toast({
        title: "Book Marked as " + type,
        description: `${book.title} has been marked as ${type}. A debt record has been created.`,
      });

      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the request",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setType('lost');
    setAmount(book.price.toString());
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mark Book as Lost or Damaged</DialogTitle>
          <DialogDescription>
            Record book loss or damage and create a debt record
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card className="p-4 bg-muted/50">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Book</p>
                <p className="font-semibold">{book.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student</p>
                <p className="font-medium">{student.name}</p>
                <p className="text-sm text-muted-foreground">{student.studentId} • {student.class}</p>
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <Label>Type</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as 'lost' | 'damaged')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lost" id="lost" />
                <Label htmlFor="lost">Lost</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="damaged" id="damaged" />
                <Label htmlFor="damaged">Damaged</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Charge</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">KSH</span>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                className="pl-12"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">Book original price: KSH {book.price.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any relevant details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!amount || parseFloat(amount) <= 0}>
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}