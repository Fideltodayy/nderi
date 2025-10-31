import { useState } from 'react';
import CSVImportDialog from '../CSVImportDialog';
import { Button } from '@/components/ui/button';

export default function CSVImportDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open CSV Import Dialog</Button>
      <CSVImportDialog 
        open={open} 
        onOpenChange={setOpen}
        onImport={(data) => {
          console.log('Imported data:', data);
        }}
      />
    </div>
  );
}
