import { useState } from "react";
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
import { useAddStudent, useStudents } from "@/hooks/useStudents";
import { useToast } from "@/hooks/use-toast";

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddStudentDialog({ open, onOpenChange }: AddStudentDialogProps) {
  const [name, setName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [contact, setContact] = useState("");

  const { data: students = [] } = useStudents();
  const addStudent = useAddStudent();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextId = students.length > 0 
      ? Math.max(...students.map(s => parseInt(s.studentId.replace('S', '')) || 0)) + 1
      : 1;

    try {
      await addStudent.mutateAsync({
        studentId: `S${String(nextId).padStart(3, '0')}`,
        name,
        class: studentClass,
        contact,
      });

      toast({
        title: "Student Added",
        description: `${name} has been registered`,
      });

      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setName("");
    setStudentClass("");
    setContact("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent data-testid="dialog-add-student">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Register a new student borrower
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter student's full name"
                required
                data-testid="input-student-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Class/Grade</Label>
              <Select value={studentClass} onValueChange={setStudentClass} required>
                <SelectTrigger data-testid="select-student-class">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grade 7">Grade 7</SelectItem>
                  <SelectItem value="Grade 8">Grade 8</SelectItem>
                  <SelectItem value="Grade 9">Grade 9</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact (Optional)</Label>
              <Input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Phone number or email"
                data-testid="input-student-contact"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancel-add-student">
              Cancel
            </Button>
            <Button type="submit" disabled={addStudent.isPending} data-testid="button-submit-add-student">
              {addStudent.isPending ? "Adding..." : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
