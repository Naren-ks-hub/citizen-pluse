import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: "primary" | "success" | "warning" | "destructive" | "info";
  hint?: string;
}

const ACCENTS = {
  primary: "from-primary to-primary-glow text-primary-foreground",
  success: "from-success to-success text-success-foreground",
  warning: "from-warning to-warning text-warning-foreground",
  destructive: "from-destructive to-destructive text-destructive-foreground",
  info: "from-info to-info text-info-foreground",
};

export function StatCard({ label, value, icon, accent = "primary", hint }: StatCardProps) {
  return (
    <Card className="shadow-card transition-smooth hover:shadow-elegant hover:-translate-y-0.5">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${ACCENTS[accent]}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-bold text-foreground">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
