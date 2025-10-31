import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";

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
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
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
      <DialogContent className="sm:max-w-[700px]" data-testid="dialog-csv-import">
        <DialogHeader>
          <DialogTitle>Import Books from CSV/Excel</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file with book information
          </DialogDescription>
        </DialogHeader>

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
                accept=".csv,.xlsx"
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
                        <th key={key} className="text-left p-2 font-semibold border-b">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="border-b">
                        {Object.values(row).map((value: any, cellIdx) => (
                          <td key={cellIdx} className="p-2">
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
