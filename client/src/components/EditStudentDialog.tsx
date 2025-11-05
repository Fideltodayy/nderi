import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateStudent } from "@/hooks/useStudents";
import { useToast } from "@/hooks/use-toast";
import { Student } from "@/lib/db";

interface EditStudentDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditStudentDialog({ student, open, onOpenChange }: EditStudentDialogProps) {
  const [name, setName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [studentId, setStudentId] = useState("");
  const [contact, setContact] = useState("");

  const updateStudent = useUpdateStudent();
  const { toast } = useToast();

  useEffect(() => {
    if (student) {
      setName(student.name || "");
      setStudentClass(student.class || "");
      setStudentId(student.studentId || "");
      setContact(student.contact || "");
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student?.id) return;

    try {
      await updateStudent.mutateAsync({
        id: student.id,
        data: {
          name,
          class: studentClass,
          studentId,
          contact: contact || undefined,
        },
      });

      toast({
        title: "Student Updated",
        description: `${name}'s information has been updated`,
      });

      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    if (student) {
      setName(student.name || "");
      setStudentClass(student.class || "");
      setStudentId(student.studentId || "");
      setContact(student.contact || "");
    }
    onOpenChange(false);
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent data-testid="dialog-edit-student">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Update student information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-student-id">Registration Number</Label>
              <Input
                id="edit-student-id"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter registration number"
                required
                data-testid="input-edit-student-id"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter student's full name"
                required
                data-testid="input-edit-student-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-class">Class/Grade</Label>
              <Input
                id="edit-class"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                placeholder="Enter class (e.g., Grade 7, 8A)"
                required
                data-testid="input-edit-student-class"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-contact">Contact (Optional)</Label>
              <Input
                id="edit-contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Phone number or email"
                data-testid="input-edit-student-contact"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancel-edit-student">
              Cancel
            </Button>
            <Button type="submit" disabled={updateStudent.isPending} data-testid="button-submit-edit-student">
              {updateStudent.isPending ? "Updating..." : "Update Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}



