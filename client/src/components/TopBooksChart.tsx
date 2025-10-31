import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TopBook {
  title: string;
  borrowed: number;
}

interface TopBooksChartProps {
  books: TopBook[];
}

export default function TopBooksChart({ books }: TopBooksChartProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Top 10 Borrowed Books</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={books} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis type="number" className="text-xs" />
          <YAxis dataKey="title" type="category" width={150} className="text-xs" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Bar dataKey="borrowed" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
