import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StudentsTable from "@/components/StudentsTable";
import AddStudentDialog from "@/components/AddStudentDialog";
import StudentCSVImportDialog from "@/components/StudentCSVImportDialog";
import { Search, Plus } from "lucide-react";
import { useStudents, useAddStudent } from "@/hooks/useStudents";
import { useTransactions } from "@/hooks/useTransactions";
import { Student } from "@/lib/db";

import StudentProfileDialog from "@/components/StudentProfileDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, AlertCircle, RotateCcw } from "lucide-react";

export default function Students() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const { data: students = [], isLoading } = useStudents();
  const { data: transactionsData = [] } = useTransactions();
  const addStudent = useAddStudent();

  const { borrowedCounts, overdueCounts, analytics } = useMemo(() => {
    const borrowedCounts: Record<number, number> = {};
    const overdueCounts: Record<number, number> = {};
    const now = new Date();

    transactionsData.forEach(transaction => {
      if (transaction.status === 'active') {
        borrowedCounts[transaction.studentId] = (borrowedCounts[transaction.studentId] || 0) + 1;
        
        // Check if overdue
        if (transaction.dueDate && new Date(transaction.dueDate) < now) {
          overdueCounts[transaction.studentId] = (overdueCounts[transaction.studentId] || 0) + 1;
        }
      }
    });

    const activeTransactions = transactionsData.filter(t => t.status === 'active');
    const overdueTransactions = activeTransactions.filter(t => 
      t.dueDate && new Date(t.dueDate) < now
    );

    const uniqueBorrowers = new Set(
      transactionsData
        .filter(t => t.action === 'borrow')
        .map(t => t.studentId)
    ).size;

    const analytics = {
      activeLoans: activeTransactions.length,
      overdueItems: overdueTransactions.length,
      uniqueBorrowers,
      totalTransactions: transactionsData.length
    };

    return { borrowedCounts, overdueCounts, analytics };
  }, [transactionsData]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.class.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const handleBulkImport = async (data: any[]) => {
    for (const row of data) {
      const name = row["Name"] || row["name"];
      const studentClass = row["Class"] || row["class"];
      const studentId = row["Registration Number"] || row["Student ID"] || row["studentId"];
      if (name && studentClass && studentId) {
        await addStudent.mutateAsync({ name, class: studentClass, studentId });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Students</h2>
          <p className="text-muted-foreground mt-1">Manage registered borrowers</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAddDialog(true)}
            data-testid="button-add-student"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowImportDialog(true)}
            data-testid="button-import-students"
          >
            Import CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Borrowers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueBorrowers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeLoans}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.overdueItems}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="search"
            placeholder="Search by name, ID, or class..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-students-search"
          />
        </div>
        <div className="text-sm text-muted-foreground ml-auto">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      <StudentsTable 
        students={filteredStudents}
        borrowedCounts={borrowedCounts}
        overdueCounts={overdueCounts}
        onEdit={(student) => console.log('Edit student:', student)}
        onView={setSelectedStudent}
      />

      <AddStudentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      <StudentCSVImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleBulkImport}
      />

      <StudentProfileDialog
        student={selectedStudent}
        open={!!selectedStudent}
        onOpenChange={(open) => !open && setSelectedStudent(null)}
      />
    </div>
  );
}
