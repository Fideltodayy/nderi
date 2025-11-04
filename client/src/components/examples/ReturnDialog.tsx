import { useState } from 'react';
import ReturnDialog from '../ReturnDialog';
import { Button } from '@/components/ui/button';

export default function ReturnDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Return Dialog</Button>
      <ReturnDialog 
        open={open} 
        onOpenChange={setOpen}
      />
    </div>
  );
}
