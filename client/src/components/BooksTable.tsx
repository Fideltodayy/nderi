import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye } from "lucide-react";
import { Book } from "@/lib/db";

interface BooksTableProps {
  books: Book[];
  onEdit?: (book: Book) => void;
  onView?: (book: Book) => void;
}

export default function BooksTable({ books, onEdit, onView }: BooksTableProps) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Barcode</TableHead>
            <TableHead className="font-semibold">Title</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold">Grade</TableHead>
            <TableHead className="font-semibold text-right">Total Qty</TableHead>
            <TableHead className="font-semibold text-right">Available</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No books found
              </TableCell>
            </TableRow>
          ) : (
            books.map((book) => (
              <TableRow key={book.id} className="hover-elevate" data-testid={`row-book-${book.id}`}>
                <TableCell className="font-mono text-sm" data-testid={`text-barcode-${book.id}`}>{book.barcode}</TableCell>
                <TableCell className="font-medium" data-testid={`text-title-${book.id}`}>{book.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">{book.category}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{book.grade || '—'}</TableCell>
                <TableCell className="text-right">{book.totalQuantity}</TableCell>
                <TableCell className="text-right font-medium">{book.availableQuantity}</TableCell>
                <TableCell>
                  {book.availableQuantity > 0 ? (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                      All Borrowed
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        console.log('View book:', book.title);
                        onView?.(book);
                      }}
                      data-testid={`button-view-${book.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        console.log('Edit book:', book.title);
                        onEdit?.(book);
                      }}
                      data-testid={`button-edit-${book.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
