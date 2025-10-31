import TopBooksChart from '../TopBooksChart';

export default function TopBooksChartExample() {
  const mockBooks = [
    { title: 'Strange Happenings', borrowed: 23 },
    { title: 'Master English 7', borrowed: 18 },
    { title: 'The last laugh', borrowed: 15 },
    { title: 'Poetry Simplified', borrowed: 12 },
    { title: 'Oxford Dictionaries', borrowed: 10 },
  ];

  return (
    <div className="p-4">
      <TopBooksChart books={mockBooks} />
    </div>
  );
}
