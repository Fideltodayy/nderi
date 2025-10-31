import StatCard from '../StatCard';
import { BookOpen } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="p-4">
      <StatCard 
        title="Total Books" 
        value="1,247" 
        icon={BookOpen}
        trend="+12 this month"
        iconColor="text-primary"
      />
    </div>
  );
}
