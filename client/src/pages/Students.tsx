import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StudentsTable from "@/components/StudentsTable";
import AddStudentDialog from "@/components/AddStudentDialog";
import { Search, Plus } from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
import { useTransactions } from "@/hooks/useTransactions";

export default function Students() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const { data: students = [], isLoading } = useStudents();
  const { data: transactionsData = [] } = useTransactions();

  const borrowedCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    transactionsData.forEach(transaction => {
      if (transaction.status === 'active') {
        counts[transaction.studentId] = (counts[transaction.studentId] || 0) + 1;
      }
    });
    return counts;
  }, [transactionsData]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.class.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

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
        <Button 
          onClick={() => setShowAddDialog(true)}
          data-testid="button-add-student"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
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
        onEdit={(student) => console.log('Edit student:', student)}
        onView={(student) => console.log('View student:', student)}
      />

      <AddStudentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
}
