import { useState } from 'react';
import CheckOutDialog from '../CheckOutDialog';
import { Button } from '@/components/ui/button';

export default function CheckOutDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Check Out Dialog</Button>
      <CheckOutDialog 
        open={open} 
        onOpenChange={setOpen}
        onConfirm={(bookId, studentId, dueDate) => {
          console.log('Checkout:', { bookId, studentId, dueDate });
        }}
      />
    </div>
  );
}
