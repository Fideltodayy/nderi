import Dexie, { Table } from 'dexie';

export interface Book {
  id?: number;
  barcode: string;
  title: string;
  category: string;
  quantityPurchased: number;
  quantityDonated: number;
  totalQuantity: number;
  availableQuantity: number;
}

export interface Student {
  id?: number;
  studentId: string;
  name: string;
  class: string;
  contact?: string;
}

export interface Transaction {
  id?: number;
  bookId: number;
  studentId: number;
  action: 'borrow' | 'return';
  date: Date;
  dueDate?: Date;
  returnDate?: Date;
  status: 'active' | 'returned' | 'overdue';
}

export class LibraryDatabase extends Dexie {
  books!: Table<Book, number>;
  students!: Table<Student, number>;
  transactions!: Table<Transaction, number>;

  constructor() {
    super('LibraryDB');
    this.version(1).stores({
      books: '++id, barcode, title, category',
      students: '++id, studentId, name, class',
      transactions: '++id, bookId, studentId, action, date, status'
    });
  }
}

export const db = new LibraryDatabase();
