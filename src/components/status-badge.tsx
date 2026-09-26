import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type Status = Database["public"]["Enums"]["complaint_status"];
type Priority = Database["public"]["Enums"]["complaint_priority"];

const STATUS_STYLES: Record<Status, string> = {
  pending: "bg-warning/20 text-warning-foreground border border-warning/30",
  in_progress: "bg-info/20 text-info border border-info/30",
  resolved: "bg-success/20 text-success border border-success/30",
  rejected: "bg-destructive/20 text-destructive border border-destructive/30",
};

const STATUS_LABEL: Record<Status, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge className={`${STATUS_STYLES[status]} font-medium`} variant="outline">
      {STATUS_LABEL[status]}
    </Badge>
  );
}

const PRIORITY_STYLES: Record<Priority, string> = {
  high: "bg-destructive text-destructive-foreground",
  medium: "bg-warning text-warning-foreground",
  low: "bg-success text-success-foreground",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge className={`${PRIORITY_STYLES[priority]} font-medium uppercase text-[10px] tracking-wider`}>
      {priority}
    </Badge>
  );
}
