import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowDown, ArrowUp } from "lucide-react";

interface TransactionWithDetails {
  id: number;
  bookTitle: string;
  studentName: string;
  action: 'borrow' | 'return';
  date: Date;
  dueDate?: Date;
  returnDate?: Date;
  status: 'active' | 'returned' | 'overdue';
}

interface TransactionsTableProps {
  transactions: TransactionWithDetails[];
}

export default function TransactionsTable({ transactions }: TransactionsTableProps) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Student</TableHead>
            <TableHead className="font-semibold">Book</TableHead>
            <TableHead className="font-semibold">Action</TableHead>
            <TableHead className="font-semibold">Due Date</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id} className="hover-elevate" data-testid={`row-transaction-${transaction.id}`}>
                <TableCell className="text-sm" data-testid={`text-date-${transaction.id}`}>
                  {format(transaction.date, 'MMM dd, yyyy HH:mm')}
                </TableCell>
                <TableCell className="font-medium">{transaction.studentName}</TableCell>
                <TableCell>{transaction.bookTitle}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {transaction.action === 'borrow' ? (
                      <>
                        <ArrowUp className="w-4 h-4 text-orange-500" />
                        <span>Borrowed</span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="w-4 h-4 text-green-500" />
                        <span>Returned</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {transaction.dueDate ? format(transaction.dueDate, 'MMM dd, yyyy') : '—'}
                </TableCell>
                <TableCell>
                  {transaction.status === 'active' && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      Active
                    </Badge>
                  )}
                  {transaction.status === 'returned' && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      Returned
                    </Badge>
                  )}
                  {transaction.status === 'overdue' && (
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                      Overdue
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
