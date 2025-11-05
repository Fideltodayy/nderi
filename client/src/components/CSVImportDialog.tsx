import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Info } from "lucide-react";
import Papa from "papaparse";
import { Card } from "@/components/ui/card";

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport?: (data: any[]) => void;
}

export default function CSVImportDialog({ open, onOpenChange, onImport }: CSVImportDialogProps) {
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
        console.log('CSV Preview:', results.data);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    // Only support CSV files (PapaParse)
    if (droppedFile && droppedFile.name.toLowerCase().endsWith('.csv')) {
      handleFileSelect(droppedFile);
    }
  };

  const handleImport = () => {
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          console.log('Importing CSV data:', results.data);
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" data-testid="dialog-csv-import">
        <DialogHeader>
          <DialogTitle>Import Books from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with book information
          </DialogDescription>
        </DialogHeader>

        <Card className="p-4 bg-muted/50">
          <div className="flex gap-2 items-start">
            <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold">Required CSV Format:</p>
              <p className="text-muted-foreground">Your CSV file should contain the following columns:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><span className="font-mono text-xs bg-background px-1 rounded">Tittle</span> or <span className="font-mono text-xs bg-background px-1 rounded">Title</span> - Book title</li>
                <li><span className="font-mono text-xs bg-background px-1 rounded">Category - type</span> or <span className="font-mono text-xs bg-background px-1 rounded">Category</span> - Category type (e.g., Story Books, Text Books, Novels)</li>
                <li><span className="font-mono text-xs bg-background px-1 rounded">Category - Subject</span> or <span className="font-mono text-xs bg-background px-1 rounded">Subject</span> - Subject (e.g., English, Kiswahili, Mathematics)</li>
                <li><span className="font-mono text-xs bg-background px-1 rounded">Category - Grade</span> or <span className="font-mono text-xs bg-background px-1 rounded">Grade</span> - Grade level(s): "Grade 1", "1,2,3", "Multiple", or "All"</li>
                <li><span className="font-mono text-xs bg-background px-1 rounded">Quantity</span> - Total number of copies</li>
                <li><span className="font-mono text-xs bg-background px-1 rounded">Barcode</span> - Optional barcode (auto-generated if missing)</li>
                <li><span className="font-mono text-xs bg-background px-1 rounded">Price</span> - Optional price per book (defaults to 0)</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                <span className="font-semibold">Note:</span> Supports Google Sheets format with "Category - type", "Category - Subject", "Category - Grade" columns.
                For multiple grades, use comma or semicolon separated values (e.g., "1,2,3" or "Grade 1;Grade 2").
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-4 py-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            data-testid="dropzone-csv"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <p className="font-medium">
                {file ? file.name : 'Drag and drop your file here'}
              </p>
              <p className="text-sm text-muted-foreground">
                or
              </p>
              <Button
                variant="secondary"
                onClick={() => document.getElementById('file-input')?.click()}
                data-testid="button-browse-file"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Browse Files
              </Button>
              <input
                id="file-input"
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
                        <th key={key} className="text-left p-2 font-semibold border-b whitespace-nowrap">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="border-b">
                        {Object.values(row).map((value: any, cellIdx) => (
                          <td key={cellIdx} className="p-2 whitespace-nowrap">
                            {value}
                          </td>
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
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel-import">
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file}
            data-testid="button-confirm-import"
          >
            Import {file && `(${preview.length}+ books)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
