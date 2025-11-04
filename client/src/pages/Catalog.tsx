import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BooksTable from "@/components/BooksTable";
import CSVImportDialog from "@/components/CSVImportDialog";
import AddBookDialog from "@/components/AddBookDialog";
import { Search, Plus, Upload } from "lucide-react";
import { useBooks, useBulkAddBooks } from "@/hooks/useBooks";
import { useToast } from "@/hooks/use-toast";

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  
  const { data: books = [], isLoading } = useBooks();
  const bulkAddBooks = useBulkAddBooks();
  const { toast } = useToast();

  const grades = Array.from({ length: 12 }, (_ , i) => i + 1);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        book.title.toLowerCase().includes(searchLower) ||
        book.barcode.toLowerCase().includes(searchLower) ||
        book.category.toLowerCase().includes(searchLower) ||
        book.subject.toLowerCase().includes(searchLower);
      
      const matchesGrade = selectedGrade === null || (book.grades || []).includes(selectedGrade);
      
      return matchesSearch && matchesGrade;
    });
  }, [books, searchQuery, selectedGrade]);

  const booksByGrade = useMemo(() => {
    return grades.map((g) => ({
      grade: g,
      books: filteredBooks.filter((book) => (book.grades || []).includes(g)),
      totalBooks: books
        .filter((book) => (book.grades || []).includes(g))
        .reduce((sum, book) => sum + (book.quantity || (book as any).totalQuantity || 0), 0),
      available: books
        .filter((book) => (book.grades || []).includes(g))
        .reduce((sum, book) => sum + (book.availableQuantity || 0), 0),
    }));
  }, [books, filteredBooks, grades]);

  const handleImport = async (data: any[]) => {
    try {
      const nextBarcode = books.length > 0 
        ? Math.max(...books.map(b => parseInt(b.barcode) || 0)) + 1
        : 1;

      const newBooks = data.map((row, index) => {
        const quantity = parseInt(row['Quantity'] || '0');
        const price = parseFloat(row['Price'] || '0');

        // Parse grades: support "Grade X", "X", or "X;Y;Z"
        const gradeCell = String(row['Grade'] || '').trim();
        const grades: number[] = gradeCell
          .split(/[;,]/)
          .map((s: string) => parseInt(s.replace(/\D+/g, ''), 10))
          .filter((n: number) => Number.isFinite(n) && n >= 1 && n <= 12);

        return {
          barcode: String(nextBarcode + index).padStart(3, '0'),
          title: row['Title'] || '',
          category: row['Category'] || '',
          subject: row['Subject'] || row['Category'] || '',
          grades,
          quantity,
          availableQuantity: quantity,
          price,
          status: 'active' as const,
        };
      });

      await bulkAddBooks.mutateAsync(newBooks);
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${newBooks.length} books`,
      });
      
      setShowImportDialog(false);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "There was an error importing the books",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading catalog...</p>
      </div>
    );
  }

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
            onClick={() => setShowImportDialog(true)}
            data-testid="button-import-csv"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button 
            onClick={() => setShowAddDialog(true)}
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
          {grades.map((g) => (
            <Badge 
              key={g}
              variant={selectedGrade === g ? 'default' : 'outline'} 
              className="cursor-pointer hover-elevate"
              onClick={() => setSelectedGrade(selectedGrade === g ? null : g)}
              data-testid={`filter-grade-${g}`}
            >
              {`Grade ${g}`}
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
                  <h3 className="text-xl font-semibold">{`Grade ${grade}`}</h3>
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
        onImport={handleImport}
      />

      <AddBookDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
}
