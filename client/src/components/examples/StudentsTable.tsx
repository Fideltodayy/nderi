import StudentsTable from '../StudentsTable';

export default function StudentsTableExample() {
  const mockStudents = [
    { id: 1, studentId: 'S001', name: 'John Doe', class: 'Grade 7', contact: '0712345678' },
    { id: 2, studentId: 'S002', name: 'Jane Smith', class: 'Grade 8', contact: '0723456789' },
    { id: 3, studentId: 'S003', name: 'Bob Wilson', class: 'Grade 7', contact: '' },
  ];

  const borrowedCounts = { 1: 2, 2: 1 };

  return (
    <div className="p-4">
      <StudentsTable 
        students={mockStudents}
        borrowedCounts={borrowedCounts}
        onEdit={(student) => console.log('Edit:', student)}
        onView={(student) => console.log('View:', student)}
      />
    </div>
  );
}
