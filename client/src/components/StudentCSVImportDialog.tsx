import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";
import { Card } from "@/components/ui/card";

interface StudentCSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport?: (data: any[]) => void;
}

export default function StudentCSVImportDialog({ open, onOpenChange, onImport }: StudentCSVImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    Papa.parse(selectedFile, {
      header: true,
      preview: 5,
      complete: (results) => {
        setPreview(results.data);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      handleFileSelect(droppedFile);
    }
  };

  const handleImport = () => {
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          onImport?.(results.data);
          handleClose();
        }
      });
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Students from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with student information. Required columns: <b>Name</b>, <b>Class</b>, <b>Registration Number</b>.
          </DialogDescription>
        </DialogHeader>

        <Card className="p-4 bg-muted/50 mb-4">
          <div className="text-sm">
            <p className="font-semibold">Required CSV Format:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><span className="font-mono text-xs bg-background px-1 rounded">Name</span> - Student name</li>
              <li><span className="font-mono text-xs bg-background px-1 rounded">Class</span> - Student class</li>
              <li><span className="font-mono text-xs bg-background px-1 rounded">Registration Number</span> - Unique student registration number</li>
            </ul>
            <p className="mt-2">Example row: "Jane Doe, 7A, 12345"</p>
          </div>
        </Card>

        <div className="space-y-4 py-2">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="space-y-2">
              <p className="font-medium">
                {file ? file.name : 'Drag and drop your CSV file here'}
              </p>
              <p className="text-sm text-muted-foreground">or</p>
              <Button
                variant="secondary"
                onClick={() => document.getElementById('student-file-input')?.click()}
              >
                Browse Files
              </Button>
              <input
                id="student-file-input"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
            </div>
          </div>

          {preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Preview (first 5 rows)</p>
              <div className="border rounded-md overflow-auto max-h-64">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {Object.keys(preview[0]).map((key) => (
                        <th key={key} className="text-left p-2 font-semibold border-b whitespace-nowrap">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="border-b">
                        {Object.values(row).map((value: any, cellIdx) => (
                          <td key={cellIdx} className="p-2 whitespace-nowrap">{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleImport} disabled={!file}>Import</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
