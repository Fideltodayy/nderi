import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  iconColor?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, iconColor = "text-primary" }: StatCardProps) {
  return (
    <Card className="p-6" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
          <p className="text-4xl font-bold mt-2" data-testid={`value-${title.toLowerCase().replace(/\s+/g, '-')}`}>{value}</p>
          {trend && (
            <p className="text-sm text-muted-foreground mt-1">{trend}</p>
          )}
        </div>
        <div className={`${iconColor}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </Card>
  );
}
