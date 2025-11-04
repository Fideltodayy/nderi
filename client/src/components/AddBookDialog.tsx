import { useMemo, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";

interface AddBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddBookDialog({ open, onOpenChange }: AddBookDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedGrades, setSelectedGrades] = useState<number[]>([]);
  const [barcode, setBarcode] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("0");

  const { data: books = [] } = useBooks();
  const addBook = useAddBook();
  const { toast } = useToast();

  const nextAutoBarcode = useMemo(() => {
    const nums = books
      .map((b) => parseInt(b.barcode, 10))
      .filter((n) => Number.isFinite(n));
    const max = nums.length ? Math.max(...nums) : 0;
    return String(max + 1).padStart(3, '0');
  }, [books]);

  // Initialize default barcode when dialog opens
  useMemo(() => {
    if (!barcode) setBarcode(nextAutoBarcode);
  }, [nextAutoBarcode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalQuantity = parseInt(quantity) || 0;
    const bookPrice = parseFloat(price) || 0;

    if (selectedGrades.length === 0) {
      toast({ title: "Select grade(s)", description: "Choose at least one grade (1–12)", variant: "destructive" });
      return;
    }

    if (!subject) {
      toast({ title: "Enter subject", description: "Subject field is required", variant: "destructive" });
      return;
    }

    const finalBarcode = barcode?.trim() || nextAutoBarcode;

    try {
      await addBook.mutateAsync({
        barcode: finalBarcode,
        title,
        category,
        subject,
        grades: selectedGrades.slice().sort((a,b)=>a-b),
        quantity: totalQuantity,
        availableQuantity: totalQuantity,
        price: bookPrice,
        status: 'active',
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
    setSubject("");
    setSelectedGrades([]);
    setBarcode("");
    setQuantity("");
    setPrice("0");
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
              <Label>Grades</Label>
              <div className="grid grid-cols-4 gap-2" data-testid="checkboxes-grades">
                {Array.from({ length: 12 }, (_ , i) => i + 1).map((g) => (
                  <label key={g} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={selectedGrades.includes(g)}
                      onCheckedChange={(checked) => {
                        setSelectedGrades((prev) =>
                          checked ? [...prev, g] : prev.filter((x) => x !== g)
                        );
                      }}
                    />
                    <span>Grade {g}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder={nextAutoBarcode}
                data-testid="input-book-barcode"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., English, Mathematics, Kiswahili"
                required
                data-testid="input-book-subject"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  required
                  data-testid="input-book-quantity"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (KSH)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  data-testid="input-book-price"
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
