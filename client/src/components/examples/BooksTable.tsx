import BooksTable from '../BooksTable';
import { Book } from '@/lib/db';

export default function BooksTableExample() {
  const mockBooks: Book[] = [
    { id: 1, barcode: '001', title: 'Strange Happenings', category: 'ENGLISH CLASS READERS', subject: 'English', grades: [7], quantity: 15, availableQuantity: 12, price: 850, status: 'active' },
    { id: 2, barcode: '002', title: 'The last laugh', category: 'ENGLISH CLASS READERS', subject: 'English', grades: [7], quantity: 15, availableQuantity: 15, price: 850, status: 'active' },
    { id: 3, barcode: '003', title: 'Understanding oral literature by Austin Bukenya', category: 'ORAL LITERATURE', subject: 'Literature', grades: [8], quantity: 8, availableQuantity: 0, price: 950, status: 'active' },
  ];

  return (
    <div className="p-4">
      <BooksTable 
        books={mockBooks}
        onEdit={(book) => console.log('Edit:', book)}
        onView={(book) => console.log('View:', book)}
      />
    </div>
  );
}
