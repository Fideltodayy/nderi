import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BooksTable from "@/components/BooksTable";
import CSVImportDialog from "@/components/CSVImportDialog";
import { Search, Plus, Upload } from "lucide-react";
import { Book } from "@/lib/db";

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);

  // TODO: remove mock functionality - replace with real data from IndexedDB
  const [books] = useState<Book[]>([
    { id: 1, barcode: '001', title: 'Strange Happenings', category: 'ENGLISH CLASS READERS', quantityPurchased: 15, quantityDonated: 0, totalQuantity: 15, availableQuantity: 12 },
    { id: 2, barcode: '002', title: 'The last laugh', category: 'ENGLISH CLASS READERS', quantityPurchased: 15, quantityDonated: 0, totalQuantity: 15, availableQuantity: 15 },
    { id: 3, barcode: '003', title: 'The Good Earth', category: 'ENGLISH CLASS READERS', quantityPurchased: 15, quantityDonated: 0, totalQuantity: 15, availableQuantity: 10 },
    { id: 4, barcode: '004', title: 'Bridges without rivers', category: 'ENGLISH CLASS READERS', quantityPurchased: 15, quantityDonated: 0, totalQuantity: 15, availableQuantity: 15 },
    { id: 5, barcode: '005', title: 'The hidden package', category: 'ENGLISH CLASS READERS', quantityPurchased: 15, quantityDonated: 0, totalQuantity: 15, availableQuantity: 14 },
    { id: 6, barcode: '006', title: 'Understanding oral literature by Austin Bukenya', category: 'ORAL LITERATURE', quantityPurchased: 0, quantityDonated: 8, totalQuantity: 8, availableQuantity: 6 },
    { id: 7, barcode: '007', title: 'Oxford Head start oral literature and skills', category: 'ORAL LITERATURE', quantityPurchased: 8, quantityDonated: 0, totalQuantity: 8, availableQuantity: 8 },
    { id: 8, barcode: '008', title: 'Master English 7', category: 'ENGLISH', quantityPurchased: 8, quantityDonated: 0, totalQuantity: 8, availableQuantity: 5 },
    { id: 9, barcode: '009', title: 'Master English 8', category: 'ENGLISH', quantityPurchased: 8, quantityDonated: 0, totalQuantity: 8, availableQuantity: 7 },
    { id: 10, barcode: '010', title: 'Master English 9', category: 'ENGLISH', quantityPurchased: 8, quantityDonated: 0, totalQuantity: 8, availableQuantity: 8 },
  ]);

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Book Catalog</h2>
          <p className="text-muted-foreground mt-1">Manage your library inventory</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary"
            onClick={() => {
              console.log('Import CSV clicked');
              setShowImportDialog(true);
            }}
            data-testid="button-import-csv"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button 
            onClick={() => console.log('Add New Book clicked')}
            data-testid="button-add-book"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Book
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="search"
            placeholder="Search by title, barcode, or category..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-catalog-search"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredBooks.length} of {books.length} books
        </div>
      </div>

      <BooksTable 
        books={filteredBooks}
        onEdit={(book) => console.log('Edit book:', book)}
        onView={(book) => console.log('View book:', book)}
      />

      <CSVImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={(data) => console.log('Import data:', data)}
      />
    </div>
  );
}
