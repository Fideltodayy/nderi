import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BooksTable from "@/components/BooksTable";
import CSVImportDialog from "@/components/CSVImportDialog";
import { Search, Plus, Upload } from "lucide-react";
import { Book } from "@/lib/db";

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  // TODO: remove mock functionality - replace with real data from IndexedDB
  const [books] = useState<Book[]>([
    { id: 1, barcode: '001', title: 'Strange Happenings', category: 'ENGLISH CLASS READERS', grade: 'Grade 7', quantityPurchased: 15, quantityDonated: 0, totalQuantity: 15, availableQuantity: 12 },
    { id: 2, barcode: '002', title: 'The last laugh', category: 'ENGLISH CLASS READERS', grade: 'Grade 7', quantityPurchased: 15, quantityDonated: 0, totalQuantity: 15, availableQuantity: 15 },
    { id: 3, barcode: '003', title: 'The Good Earth', category: 'ENGLISH CLASS READERS', grade: 'Grade 8', quantityPurchased: 15, quantityDonated: 0, totalQuantity: 15, availableQuantity: 10 },
    { id: 4, barcode: '004', title: 'Bridges without rivers', category: 'ENGLISH CLASS READERS', grade: 'Grade 8', quantityPurchased: 15, quantityDonated: 0, totalQuantity: 15, availableQuantity: 15 },
    { id: 5, barcode: '005', title: 'The hidden package', category: 'ENGLISH CLASS READERS', grade: 'Grade 9', quantityPurchased: 15, quantityDonated: 0, totalQuantity: 15, availableQuantity: 14 },
    { id: 6, barcode: '006', title: 'Understanding oral literature by Austin Bukenya', category: 'ORAL LITERATURE', grade: 'Grade 8', quantityPurchased: 0, quantityDonated: 8, totalQuantity: 8, availableQuantity: 6 },
    { id: 7, barcode: '007', title: 'Oxford Head start oral literature and skills', category: 'ORAL LITERATURE', grade: 'Grade 7', quantityPurchased: 8, quantityDonated: 0, totalQuantity: 8, availableQuantity: 8 },
    { id: 8, barcode: '008', title: 'Master English 7', category: 'ENGLISH', grade: 'Grade 7', quantityPurchased: 8, quantityDonated: 0, totalQuantity: 8, availableQuantity: 5 },
    { id: 9, barcode: '009', title: 'Master English 8', category: 'ENGLISH', grade: 'Grade 8', quantityPurchased: 8, quantityDonated: 0, totalQuantity: 8, availableQuantity: 7 },
    { id: 10, barcode: '010', title: 'Master English 9', category: 'ENGLISH', grade: 'Grade 9', quantityPurchased: 8, quantityDonated: 0, totalQuantity: 8, availableQuantity: 8 },
    { id: 11, barcode: '011', title: 'Poetry Simplified: A guide to oral and literacy skills', category: 'POETRY', grade: 'Grade 7', quantityPurchased: 8, quantityDonated: 0, totalQuantity: 8, availableQuantity: 6 },
    { id: 12, barcode: '012', title: 'A poetry course for KCSE by Paul Robin', category: 'POETRY', grade: 'Grade 9', quantityPurchased: 8, quantityDonated: 0, totalQuantity: 8, availableQuantity: 8 },
    { id: 13, barcode: '013', title: 'Miradi na Mtihani', category: 'KISWAHILI', grade: 'Grade 7', quantityPurchased: 8, quantityDonated: 0, totalQuantity: 8, availableQuantity: 7 },
    { id: 14, barcode: '014', title: 'Maana Mapya', category: 'KISWAHILI', grade: 'Grade 8', quantityPurchased: 8, quantityDonated: 0, totalQuantity: 8, availableQuantity: 8 },
  ]);

  const grades = ['Grade 7', 'Grade 8', 'Grade 9'];

  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGrade = !selectedGrade || book.grade === selectedGrade;
    
    return matchesSearch && matchesGrade;
  });

  const booksByGrade = grades.map(grade => ({
    grade,
    books: filteredBooks.filter(book => book.grade === grade),
    totalBooks: books.filter(book => book.grade === grade).reduce((sum, book) => sum + book.totalQuantity, 0),
    available: books.filter(book => book.grade === grade).reduce((sum, book) => sum + book.availableQuantity, 0),
  }));

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

      <div className="flex gap-4 items-center flex-wrap">
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

        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">Grade:</span>
          <Badge 
            variant={selectedGrade === null ? 'default' : 'outline'} 
            className="cursor-pointer hover-elevate"
            onClick={() => setSelectedGrade(null)}
            data-testid="filter-all-grades"
          >
            All
          </Badge>
          {grades.map(grade => (
            <Badge 
              key={grade}
              variant={selectedGrade === grade ? 'default' : 'outline'} 
              className="cursor-pointer hover-elevate"
              onClick={() => setSelectedGrade(selectedGrade === grade ? null : grade)}
              data-testid={`filter-${grade.toLowerCase().replace(' ', '-')}`}
            >
              {grade}
            </Badge>
          ))}
        </div>

        <div className="text-sm text-muted-foreground ml-auto">
          Showing {filteredBooks.length} of {books.length} books
        </div>
      </div>

      {selectedGrade === null ? (
        <div className="space-y-8">
          {booksByGrade.map(({ grade, books: gradeBooks, totalBooks, available }) => (
            <div key={grade} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{grade}</h3>
                  <p className="text-sm text-muted-foreground">
                    {totalBooks} total books • {available} available
                  </p>
                </div>
              </div>
              {gradeBooks.length > 0 ? (
                <BooksTable 
                  books={gradeBooks}
                  onEdit={(book) => console.log('Edit book:', book)}
                  onView={(book) => console.log('View book:', book)}
                />
              ) : (
                <div className="border rounded-md p-8 text-center text-muted-foreground">
                  No books found for {grade}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <BooksTable 
          books={filteredBooks}
          onEdit={(book) => console.log('Edit book:', book)}
          onView={(book) => console.log('View book:', book)}
        />
      )}

      <CSVImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={(data) => console.log('Import data:', data)}
      />
    </div>
  );
}
