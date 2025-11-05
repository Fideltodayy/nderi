import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BooksTable from "@/components/BooksTable";
import CSVImportDialog from "@/components/CSVImportDialog";
import AddBookDialog from "@/components/AddBookDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Upload, X } from "lucide-react";
import { useBooks, useBulkAddBooks } from "@/hooks/useBooks";
import { useSubjects, useCategories } from "@/hooks/useTaxonomy";
import { useToast } from "@/hooks/use-toast";

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const { data: books = [], isLoading } = useBooks();
  const { data: subjects = [] } = useSubjects();
  const { data: categories = [] } = useCategories();
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
      
      const gradeFilter = selectedGrade === "all" 
        ? true 
        : (book.grades || []).includes(parseInt(selectedGrade, 10));
      
      const subjectFilter = selectedSubject === "all" 
        ? true 
        : book.subject.toLowerCase() === selectedSubject.toLowerCase();
      
      const categoryFilter = selectedCategory === "all"
        ? true
        : book.category.toLowerCase() === selectedCategory.toLowerCase();
      
      return matchesSearch && gradeFilter && subjectFilter && categoryFilter;
    });
  }, [books, searchQuery, selectedGrade, selectedSubject, selectedCategory]);


  const handleImport = async (data: any[]) => {
    try {
      const nextBarcode = books.length > 0 
        ? Math.max(...books.map(b => parseInt(b.barcode) || 0)) + 1
        : 1;

      const newBooks = data.map((row, index) => {
        const quantity = parseInt(row['Quantity'] || row['Quantities Purchased'] || '0');
        const price = parseFloat(row['Price'] || '0');

        // Support Google Sheets column names: "Category - type", "Category - Subject", "Category - Grade"
        // Also support simpler names: "Category", "Subject", "Grade"
        const category = row['Category - type'] || row['Category'] || '';
        const subject = row['Category - Subject'] || row['Subject'] || row['Category'] || '';
        const gradeCell = String(row['Category - Grade'] || row['Grade'] || '').trim();
        
        // Parse grades: support "Grade X", "X", "X;Y;Z", "Multiple", "All", or comma/semicolon separated
        let grades: number[] = [];
        if (gradeCell.toLowerCase() === 'multiple' || gradeCell.toLowerCase() === 'all') {
          // If "Multiple" or "All", assign all grades 1-12
          grades = Array.from({ length: 12 }, (_, i) => i + 1);
        } else if (gradeCell) {
          grades = gradeCell
            .split(/[;,]/)
            .map((s: string) => {
              // Extract number from "Grade X" or just "X"
              const num = parseInt(s.replace(/\D+/g, ''), 10);
              return num;
            })
            .filter((n: number) => Number.isFinite(n) && n >= 1 && n <= 12);
          
          // Remove duplicates and sort
          grades = Array.from(new Set(grades)).sort((a, b) => a - b);
        }

        return {
          barcode: row['Barcode'] || String(nextBarcode + index).padStart(3, '0'),
          title: row['Tittle'] || row['Title'] || '',
          category,
          subject,
          grades,
          quantity,
          availableQuantity: quantity,
          price,
          status: 'active' as const,
        };
      }).filter(book => book.title); // Filter out empty rows

      // Add unique categories and subjects to taxonomy
      const { db } = await import('@/lib/db');
      const categories = new Set<string>();
      const subjects = new Set<string>();
      
      newBooks.forEach(book => {
        if (book.category) categories.add(book.category);
        if (book.subject) subjects.add(book.subject);
      });

      // Check existing taxonomy
      const existingTaxonomy = await db.taxonomy.toArray();
      const existingCategories = new Set(existingTaxonomy.filter(t => t.type === 'category').map(t => t.name));
      const existingSubjects = new Set(existingTaxonomy.filter(t => t.type === 'subject').map(t => t.name));

      // Add new categories
      for (const cat of categories) {
        if (!existingCategories.has(cat)) {
          await db.taxonomy.add({
            type: 'category',
            name: cat,
            createdAt: new Date()
          });
        }
      }

      // Add new subjects
      for (const subj of subjects) {
        if (!existingSubjects.has(subj)) {
          await db.taxonomy.add({
            type: 'subject',
            name: subj,
            createdAt: new Date()
          });
        }
      }

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

      <div className="space-y-4">
        {/* Search Bar - Full Width */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="search"
            placeholder="Search by book title, barcode, category, or subject..."
            className="pl-10 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-catalog-search"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              data-testid="button-clear-search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <label htmlFor="category-filter" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Category:
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category-filter" className="w-[180px]" data-testid="select-category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="subject-filter" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Subject:
            </label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger id="subject-filter" className="w-[180px]" data-testid="select-subject-filter">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subj) => (
                  <SelectItem key={subj} value={subj}>
                    {subj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="grade-filter" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Grade:
            </label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger id="grade-filter" className="w-[140px]" data-testid="select-grade-filter">
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {grades.map((g) => (
                  <SelectItem key={g} value={String(g)}>
                    Grade {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(selectedCategory !== "all" || selectedGrade !== "all" || selectedSubject !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCategory("all");
                setSelectedGrade("all");
                setSelectedSubject("all");
              }}
              className="text-xs"
              data-testid="button-clear-filters"
            >
              <X className="w-3 h-3 mr-1" />
              Clear Filters
            </Button>
          )}

          <div className="text-sm text-muted-foreground ml-auto">
            Showing {filteredBooks.length} of {books.length} books
          </div>
        </div>
      </div>

      {filteredBooks.length > 0 ? (
        <BooksTable 
          books={filteredBooks}
          onEdit={(book) => console.log('Edit book:', book)}
          onView={(book) => console.log('View book:', book)}
        />
      ) : (
        <div className="border rounded-md p-12 text-center">
          <p className="text-muted-foreground mb-2">No books found</p>
          <p className="text-sm text-muted-foreground">
            {searchQuery || selectedCategory !== "all" || selectedGrade !== "all" || selectedSubject !== "all"
              ? "Try adjusting your search or filters"
              : "Start by adding a book or importing from CSV"}
          </p>
        </div>
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
