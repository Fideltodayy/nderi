import BooksTable from '../BooksTable';

export default function BooksTableExample() {
  const mockBooks = [
    { id: 1, barcode: '001', title: 'Strange Happenings', category: 'ENGLISH CLASS READERS', quantityPurchased: 15, quantityDonated: 0, totalQuantity: 15, availableQuantity: 12 },
    { id: 2, barcode: '002', title: 'The last laugh', category: 'ENGLISH CLASS READERS', quantityPurchased: 15, quantityDonated: 0, totalQuantity: 15, availableQuantity: 15 },
    { id: 3, barcode: '003', title: 'Understanding oral literature by Austin Bukenya', category: 'ORAL LITERATURE', quantityPurchased: 0, quantityDonated: 8, totalQuantity: 8, availableQuantity: 0 },
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
