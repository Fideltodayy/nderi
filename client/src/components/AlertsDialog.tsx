import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { format } from "date-fns";
import {
  AlertCircle,
  AlertTriangle,
  FileWarning,
  BookX,
  BookUp,
  User,
  Receipt,
  Wallet,
} from "lucide-react";

interface AlertsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AlertsDialog({
  open,
  onOpenChange,
}: AlertsDialogProps) {
  const { data: auditLogs = [] } = useAuditLogs();

  const suspiciousActivities = useMemo(() => {
    return auditLogs.filter((log) => log.riskLevel && log.riskLevel !== "low");
  }, [auditLogs]);

  const getIcon = (resourceType: string) => {
    switch (resourceType) {
      case "book":
        return <BookX className="w-4 h-4" />;
      case "student":
        return <User className="w-4 h-4" />;
      case "transaction":
        return <Receipt className="w-4 h-4" />;
      case "debt":
        return <Wallet className="w-4 h-4" />;
      default:
        return <FileWarning className="w-4 h-4" />;
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "medium":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <FileWarning className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Suspicious Activity Alerts
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {suspiciousActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No suspicious activities detected
              </div>
            ) : (
              suspiciousActivities
                .sort(
                  (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
                )
                .map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    <div className="shrink-0">
                      {getRiskIcon(activity.riskLevel || "low")}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            activity.riskLevel === "high"
                              ? "destructive"
                              : activity.riskLevel === "medium"
                              ? "default"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {activity.riskLevel} Risk
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          {getIcon(activity.resourceType)}
                          <span className="capitalize">
                            {activity.resourceType}
                          </span>
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {activity.action}
                        </Badge>
                      </div>
                      <p>{activity.notes}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{format(new Date(activity.timestamp), "PPpp")}</span>
                        <span>User: {activity.userId}</span>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}