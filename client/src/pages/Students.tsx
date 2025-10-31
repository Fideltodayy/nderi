import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StudentsTable from "@/components/StudentsTable";
import { Search, Plus } from "lucide-react";
import { Student } from "@/lib/db";

export default function Students() {
  const [searchQuery, setSearchQuery] = useState("");

  // TODO: remove mock functionality - replace with real data from IndexedDB
  const [students] = useState<Student[]>([
    { id: 1, studentId: 'S001', name: 'John Doe', class: 'Grade 7', contact: '0712345678' },
    { id: 2, studentId: 'S002', name: 'Jane Smith', class: 'Grade 8', contact: '0723456789' },
    { id: 3, studentId: 'S003', name: 'Bob Wilson', class: 'Grade 7', contact: '0734567890' },
    { id: 4, studentId: 'S004', name: 'Alice Brown', class: 'Grade 9', contact: '' },
    { id: 5, studentId: 'S005', name: 'Charlie Davis', class: 'Grade 8', contact: '0756789012' },
    { id: 6, studentId: 'S006', name: 'Diana Evans', class: 'Grade 7', contact: '0767890123' },
    { id: 7, studentId: 'S007', name: 'Frank Garcia', class: 'Grade 9', contact: '0778901234' },
    { id: 8, studentId: 'S008', name: 'Grace Harris', class: 'Grade 8', contact: '' },
    { id: 9, studentId: 'S009', name: 'Henry Jackson', class: 'Grade 7', contact: '0790123456' },
    { id: 10, studentId: 'S010', name: 'Ivy King', class: 'Grade 9', contact: '0701234567' },
  ]);

  const borrowedCounts = { 1: 2, 2: 1, 5: 1, 7: 3 };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Students</h2>
          <p className="text-muted-foreground mt-1">Manage student borrowers</p>
        </div>
        <Button 
          onClick={() => console.log('Add New Student clicked')}
          data-testid="button-add-student"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      <div className="flex gap-4 items-center">
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
        <div className="text-sm text-muted-foreground">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      <StudentsTable 
        students={filteredStudents}
        borrowedCounts={borrowedCounts}
        onEdit={(student) => console.log('Edit student:', student)}
        onView={(student) => console.log('View student:', student)}
      />
    </div>
  );
}
