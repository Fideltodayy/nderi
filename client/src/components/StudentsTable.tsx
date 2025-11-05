import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Eye, Trash2 } from "lucide-react";
import { Student } from "@/lib/db";
import { useDeleteStudent } from "@/hooks/useStudents";
import { useToast } from "@/hooks/use-toast";

interface StudentsTableProps {
  students: Student[];
  borrowedCounts?: Record<number, number>;
  overdueCounts?: Record<number, number>;
  onEdit?: (student: Student) => void;
  onView?: (student: Student) => void;
  onDelete?: (student: Student) => void;
}

export default function StudentsTable({
  students,
  borrowedCounts = {},
  overdueCounts = {},
  onEdit,
  onView,
  onDelete,
}: StudentsTableProps) {
  const ADMIN_PIN = "1234"; // Frontend PIN for sensitive operations
  const deleteStudent = useDeleteStudent();
  const { toast } = useToast();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [pendingStudent, setPendingStudent] = useState<Student | null>(null);
  const [pendingOperation, setPendingOperation] = useState<
    "edit" | "delete" | null
  >(null);
  const [pinError, setPinError] = useState<string | null>(null);

  const openPinModal = (student: Student, operation: "edit" | "delete") => {
    setPendingStudent(student);
    setPendingOperation(operation);
    setPinValue("");
    setPinError(null);
    setShowPinModal(true);
  };

  const handleConfirmOperation = async () => {
    if (pinValue !== ADMIN_PIN) {
      setPinError("Invalid PIN");
      return;
    }

    if (!pendingStudent?.id) return;

    try {
      if (pendingOperation === "delete") {
        await deleteStudent.mutateAsync(pendingStudent.id);
        toast({
          title: "Student Deleted",
          description: `${pendingStudent.name} has been removed from the system`,
        });
        onDelete?.(pendingStudent);
      } else if (pendingOperation === "edit") {
        onEdit?.(pendingStudent);
      }
      setShowPinModal(false);
    } catch (err) {
      toast({
        title: `${pendingOperation === "delete" ? "Delete" : "Edit"} Failed`,
        description: `Could not ${pendingOperation} the student`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Student ID</TableHead>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Class</TableHead>
            <TableHead className="font-semibold">Contact</TableHead>
            <TableHead className="font-semibold text-right">
              Books Borrowed
            </TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground py-8"
              >
                No students found
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => {
              const borrowedCount = borrowedCounts[student.id!] || 0;
              const overdueCount = overdueCounts[student.id!] || 0;
              return (
                <TableRow
                  key={student.id}
                  className="hover-elevate"
                  data-testid={`row-student-${student.id}`}
                >
                  <TableCell
                    className="font-mono text-sm"
                    data-testid={`text-studentid-${student.id}`}
                  >
                    {student.studentId}
                  </TableCell>
                  <TableCell
                    className="font-medium"
                    data-testid={`text-name-${student.id}`}
                  >
                    {student.name}
                  </TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.contact || "—"}
                  </TableCell>
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
                      <Badge variant="outline" className="text-xs">
                        {borrowedCount}
                      </Badge>
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
                          onView?.(student);
                        }}
                        data-testid={`button-view-${student.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openPinModal(student, "edit")}
                        data-testid={`button-edit-${student.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openPinModal(student, "delete")}
                        data-testid={`button-delete-${student.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* PIN confirmation modal for protected operations */}
      <Dialog open={showPinModal} onOpenChange={() => setShowPinModal(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Confirm {pendingOperation === "delete" ? "Deletion" : "Edit"}
            </DialogTitle>
            <DialogDescription>
              {pendingOperation === "delete"
                ? `Are you sure you want to delete ${pendingStudent?.name}? This action cannot be undone.`
                : `Enter PIN to edit ${pendingStudent?.name}'s information.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pin">Enter Admin PIN</Label>
              <Input
                id="pin"
                type="password"
                value={pinValue}
                onChange={(e) => {
                  setPinValue(e.target.value);
                  setPinError(null);
                }}
                placeholder="Enter PIN"
                onKeyDown={(e) => e.key === "Enter" && handleConfirmOperation()}
                autoFocus
              />
              {pinError && (
                <p className="text-sm text-destructive">{pinError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPinModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmOperation}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
