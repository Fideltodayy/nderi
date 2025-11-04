import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Book } from "@/lib/db";
import { Label } from "@/components/ui/label";
import { useUpdateBook } from "@/hooks/useBooks";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface EditBookDialogProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditBookDialog({ book, open, onOpenChange }: EditBookDialogProps) {
  const updateBook = useUpdateBook();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Book>>(book || {});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book?.id) return;

    try {
      await updateBook.mutateAsync({
        id: book.id,
        data: formData
      });
      toast({ title: 'Success', description: 'Book updated successfully' });
      onOpenChange(false);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to update book', 
        variant: 'destructive' 
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue: any = value;

    // Handle numeric fields
    if (name === 'price' || name === 'quantity') {
      processedValue = value ? parseFloat(value) : 0;
    }
    // Handle grades as array
    if (name === 'grades') {
      processedValue = value.split(',').map(g => g.trim());
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Book</DialogTitle>
          <DialogDescription>
            Update book information in the catalog
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                name="barcode"
                defaultValue={book.barcode}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={book.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                defaultValue={book.category}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                defaultValue={book.subject}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grades">Grades (comma-separated)</Label>
              <Input
                id="grades"
                name="grades"
                defaultValue={book.grades?.join(', ')}
                onChange={handleChange}
                placeholder="e.g. 1, 2, 3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (KSH)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                defaultValue={book.price}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                defaultValue={book.quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input
                id="status"
                name="status"
                defaultValue={book.status || 'active'}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={updateBook.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}