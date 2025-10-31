import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddBook, useBooks } from "@/hooks/useBooks";
import { useToast } from "@/hooks/use-toast";

interface AddBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddBookDialog({ open, onOpenChange }: AddBookDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [grade, setGrade] = useState("");
  const [purchased, setPurchased] = useState("");
  const [donated, setDonated] = useState("");

  const { data: books = [] } = useBooks();
  const addBook = useAddBook();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const quantityPurchased = parseInt(purchased) || 0;
    const quantityDonated = parseInt(donated) || 0;
    const total = quantityPurchased + quantityDonated;

    const nextBarcode = books.length > 0 
      ? Math.max(...books.map(b => parseInt(b.barcode) || 0)) + 1
      : 1;

    try {
      await addBook.mutateAsync({
        barcode: String(nextBarcode).padStart(3, '0'),
        title,
        category,
        grade,
        quantityPurchased,
        quantityDonated,
        totalQuantity: total,
        availableQuantity: total,
      });

      toast({
        title: "Book Added",
        description: `${title} has been added to the catalog`,
      });

      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add book",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setTitle("");
    setCategory("");
    setGrade("");
    setPurchased("");
    setDonated("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent data-testid="dialog-add-book">
        <DialogHeader>
          <DialogTitle>Add New Book</DialogTitle>
          <DialogDescription>
            Add a new book to your library catalog
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter book title"
                required
                data-testid="input-book-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., ENGLISH CLASS READERS"
                required
                data-testid="input-book-category"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select value={grade} onValueChange={setGrade} required>
                <SelectTrigger data-testid="select-book-grade">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grade 7">Grade 7</SelectItem>
                  <SelectItem value="Grade 8">Grade 8</SelectItem>
                  <SelectItem value="Grade 9">Grade 9</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchased">Quantities Purchased</Label>
                <Input
                  id="purchased"
                  type="number"
                  min="0"
                  value={purchased}
                  onChange={(e) => setPurchased(e.target.value)}
                  placeholder="0"
                  required
                  data-testid="input-book-purchased"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="donated">Donated</Label>
                <Input
                  id="donated"
                  type="number"
                  min="0"
                  value={donated}
                  onChange={(e) => setDonated(e.target.value)}
                  placeholder="0"
                  required
                  data-testid="input-book-donated"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancel-add-book">
              Cancel
            </Button>
            <Button type="submit" disabled={addBook.isPending} data-testid="button-submit-add-book">
              {addBook.isPending ? "Adding..." : "Add Book"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
