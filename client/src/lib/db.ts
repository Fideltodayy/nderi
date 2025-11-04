import Dexie, { Table } from 'dexie';

export interface Book {
  id?: number;
  barcode: string;
  title: string;
  category: string;
  subject: string;
  grades: number[];
  quantity: number;
  availableQuantity: number;
  price: number;
  status: 'active' | 'lost' | 'damaged';
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
  action: 'borrow' | 'return' | 'lost' | 'damaged';
  date: Date;
  dueDate?: Date;
  returnDate?: Date;
  status: 'active' | 'returned' | 'overdue' | 'lost' | 'damaged';
  notes?: string;
}

export interface BadDebt {
  id?: number;
  transactionId: number;
  bookId: number;
  studentId: number;
  amount: number;
  date: Date;
  status: 'pending' | 'paid' | 'waived';
  type: 'lost' | 'damaged';
  notes?: string;
  paidDate?: Date;
}

export interface AuditLog {
  id?: number;
  timestamp: Date;
  action: 'create' | 'update' | 'delete';
  resourceType: 'book' | 'student' | 'transaction' | 'debt';
  resourceId: number;
  userId: string;
  previousState?: any;
  newState?: any;
  riskLevel?: 'low' | 'medium' | 'high';
  notes?: string;
}

export class LibraryDatabase extends Dexie {
  books!: Table<Book, number>;
  students!: Table<Student, number>;
  transactions!: Table<Transaction, number>;
  badDebts!: Table<BadDebt, number>;
  auditLogs!: Table<AuditLog, number>;

  constructor() {
    super('LibraryDB');
    // Initial schema
    this.version(1).stores({
      books: '++id, barcode, title, category',
      students: '++id, studentId, name, class',
      transactions: '++id, bookId, studentId, action, date, status',
      badDebts: '++id, transactionId, bookId, studentId, status, type',
      auditLogs: '++id, timestamp, action, resourceType, resourceId, userId, riskLevel'
    });

    // v2: add multi-grade support using multiEntry index on grades
    this.version(2)
      .stores({
        books: '++id, barcode, title, category, *grades',
        students: '++id, studentId, name, class',
        transactions: '++id, bookId, studentId, action, date, status'
      });

    // v3: Add subject, price, and status fields, consolidate quantity fields
    this.version(3)
      .stores({
        books: '++id, barcode, title, category, subject, *grades, status',
        students: '++id, studentId, name, class',
        transactions: '++id, bookId, studentId, action, date, status'
      })
      .upgrade(async (tx) => {
        // Migrate existing books
        await tx.table('books').toCollection().modify((book: any) => {
          // Combine quantities
          book.quantity = (book.quantityPurchased || 0) + (book.quantityDonated || 0);
          delete book.quantityPurchased;
          delete book.quantityDonated;
          
          // Add new fields
          book.subject = book.category || '';
          book.price = 0;
          book.status = 'active';
        });
      })
      .upgrade(async (tx) => {
        // Migrate existing books: move single string grade to numeric grades[]
        await tx.table('books').toCollection().modify((b: any) => {
          if (b.grades === undefined) {
            const oldGrade: string | undefined = b.grade;
            if (oldGrade) {
              const num = parseInt(String(oldGrade).replace(/\D+/g, ''), 10);
              b.grades = Number.isFinite(num) ? [num] : [];
            } else {
              b.grades = [];
            }
            delete b.grade;
          }
        });
      });
  }
}

export const db = new LibraryDatabase();
