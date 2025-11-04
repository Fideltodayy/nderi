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
import { Student } from "@/lib/db";

interface StudentsTableProps {
  students: Student[];
  borrowedCounts?: Record<number, number>;
  overdueCounts?: Record<number, number>;
  onEdit?: (student: Student) => void;
  onView?: (student: Student) => void;
}

export default function StudentsTable({ 
  students, 
  borrowedCounts = {}, 
  overdueCounts = {},
  onEdit, 
  onView 
}: StudentsTableProps) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Student ID</TableHead>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Class</TableHead>
            <TableHead className="font-semibold">Contact</TableHead>
            <TableHead className="font-semibold text-right">Books Borrowed</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No students found
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => {
              const borrowedCount = borrowedCounts[student.id!] || 0;
              const overdueCount = overdueCounts[student.id!] || 0;
              return (
                <TableRow key={student.id} className="hover-elevate" data-testid={`row-student-${student.id}`}>
                  <TableCell className="font-mono text-sm" data-testid={`text-studentid-${student.id}`}>{student.studentId}</TableCell>
                  <TableCell className="font-medium" data-testid={`text-name-${student.id}`}>{student.name}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell className="text-muted-foreground">{student.contact || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Badge variant="outline">{borrowedCount}</Badge>
                      {overdueCount > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {overdueCount} overdue
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {borrowedCount > 0 ? (
                      <Badge variant="outline" className="text-xs">{borrowedCount}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          console.log('View student:', student.name);
                          onView?.(student);
                        }}
                        data-testid={`button-view-${student.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          console.log('Edit student:', student.name);
                          onEdit?.(student);
                        }}
                        data-testid={`button-edit-${student.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
