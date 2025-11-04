import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Student } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, Calendar, Clock, AlertCircle, Wallet } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useBadDebts } from "@/hooks/useBadDebts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface StudentProfileDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StudentProfileDialog({
  student,
  open,
  onOpenChange,
}: StudentProfileDialogProps) {
  const { data: transactionsData = [] } = useTransactions();
  const { data: badDebtsData = [] } = useBadDebts();

  const studentTransactions = useMemo(() => {
    if (!student) return [];
    return transactionsData
      .filter((t) => t.studentId === student.id)
      .map((t) => ({
        ...t,
        date: new Date(t.date),
        dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
        returnDate: t.returnDate ? new Date(t.returnDate) : undefined,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [student, transactionsData]);

  const analytics = useMemo(() => {
    if (!student) return null;

    const activeTransactions = studentTransactions.filter(
      (t) => t.status === "active"
    );
    const overdueTransactions = activeTransactions.filter(
      (t) => t.dueDate && t.dueDate < new Date()
    );
    const returnedTransactions = studentTransactions.filter(
      (t) => t.status === "returned"
    );

    const averageBorrowTime = returnedTransactions.length
      ? Math.round(
          returnedTransactions.reduce((sum, t) => {
            const borrowDays = t.returnDate
              ? Math.round(
                  (t.returnDate.getTime() - t.date.getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : 0;
            return sum + borrowDays;
          }, 0) / returnedTransactions.length
        )
      : 0;

    return {
      totalBorrowed: studentTransactions.filter((t) => t.action === "borrow")
        .length,
      currentlyBorrowed: activeTransactions.length,
      overdue: overdueTransactions.length,
      averageBorrowTime,
      onTimeReturns: returnedTransactions.filter(
        (t) =>
          t.returnDate &&
          t.dueDate &&
          t.returnDate.getTime() <= t.dueDate.getTime()
      ).length,
      lateReturns: returnedTransactions.filter(
        (t) =>
          t.returnDate &&
          t.dueDate &&
          t.returnDate.getTime() > t.dueDate.getTime()
      ).length,
    };
  }, [student, studentTransactions]);

  if (!student || !analytics) return null;

  const formatDate = (date: Date | undefined) => {
    if (!date) return "—";
    return format(date, "MMM d, yyyy");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Student Profile</span>
            <Badge>{student.studentId}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold">{student.name}</h3>
              <p className="text-muted-foreground">
                Class {student.class} • {student.contact || "No contact"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Currently Borrowed
                </CardTitle>
                <Book className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.currentlyBorrowed}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                <Book className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalBorrowed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Borrow Time
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.averageBorrowTime}d
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {analytics.overdue}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="history" className="w-full">
            <TabsList>
              <TabsTrigger value="history">Borrowing History</TabsTrigger>
              <TabsTrigger value="analytics">Return Analytics</TabsTrigger>
              <TabsTrigger value="debts">Bad Debts</TabsTrigger>
            </TabsList>
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Return Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {transaction.bookTitle}
                          </TableCell>
                          <TableCell className="capitalize">
                            {transaction.action}
                          </TableCell>
                          <TableCell>{formatDate(transaction.date)}</TableCell>
                          <TableCell>{formatDate(transaction.dueDate)}</TableCell>
                          <TableCell>
                            {formatDate(transaction.returnDate)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.status === "active"
                                  ? "default"
                                  : transaction.status === "overdue"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {transaction.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-4">Return Performance</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              On-time Returns
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                              {analytics.onTimeReturns}
                            </p>
                          </div>
                          <Calendar className="w-8 h-8 text-green-600/20" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Late Returns
                            </p>
                            <p className="text-2xl font-bold text-red-600">
                              {analytics.lateReturns}
                            </p>
                          </div>
                          <Calendar className="w-8 h-8 text-red-600/20" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="debts" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-4">Bad Debt Records</h4>
                      <div className="space-y-4">
                        {badDebtsData
                          .filter(debt => debt.studentId === student.id)
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map(debt => (
                            <div key={debt.id} className="flex items-start justify-between p-4 border rounded-lg">
                              <div className="space-y-1">
                                <p className="font-medium capitalize">
                                  {debt.type} Book
                                  <Badge variant="outline" className="ml-2">
                                    {debt.status}
                                  </Badge>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(debt.date)}
                                  {debt.paidDate && (
                                    <span className="text-green-600"> • Paid on {formatDate(debt.paidDate)}</span>
                                  )}
                                </p>
                                {debt.notes && (
                                  <p className="text-sm text-muted-foreground mt-2">{debt.notes}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold">KSH {debt.amount.toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        {badDebtsData.filter(debt => debt.studentId === student.id).length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            No bad debt records found
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}