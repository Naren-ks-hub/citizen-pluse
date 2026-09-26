import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { StatCard } from "@/components/stat-card";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/lib/priority";
import { useAuth } from "@/hooks/use-auth";
import { FileText, Clock, CheckCircle2, AlertTriangle, Plus, ArrowRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CitizenPulse" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, isAdmin } = useAuth();

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["my-complaints", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === "pending").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;
  const highPriority = complaints.filter((c) => c.priority === "high").length;
  const recent = complaints.slice(0, 5);

  const name = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "Citizen";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome */}
        <Card className="mb-6 overflow-hidden border-none bg-gradient-hero text-primary-foreground shadow-elegant">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-primary-foreground/70">Welcome back,</p>
              <h1 className="font-display text-2xl font-bold sm:text-3xl">{name}</h1>
              <p className="mt-1 text-sm text-primary-foreground/80">
                Here's a quick snapshot of your complaints.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                <Link to="/raise-complaint">
                  <Plus className="mr-1 h-4 w-4" /> Raise complaint
                </Link>
              </Button>
              {isAdmin && (
                <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/admin">
                    <ShieldCheck className="mr-1 h-4 w-4" /> Admin console
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total complaints" value={total} icon={<FileText className="h-6 w-6" />} accent="primary" />
          <StatCard label="Pending" value={pending} icon={<Clock className="h-6 w-6" />} accent="warning" />
          <StatCard label="Resolved" value={resolved} icon={<CheckCircle2 className="h-6 w-6" />} accent="success" />
          <StatCard label="High priority" value={highPriority} icon={<AlertTriangle className="h-6 w-6" />} accent="destructive" />
        </div>

        {/* Recent */}
        <Card className="mt-6 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Recent complaints</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/my-complaints">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
            ) : recent.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-muted-foreground">You haven't filed any complaints yet.</p>
                <Button asChild className="mt-4 bg-gradient-primary">
                  <Link to="/raise-complaint">File your first complaint</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recent.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {CATEGORY_LABELS[c.category]} · {c.area} · {new Date(c.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
