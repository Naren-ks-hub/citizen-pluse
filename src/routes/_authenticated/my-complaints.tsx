import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from "@/lib/priority";
import { FileText, Plus, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/my-complaints")({
  head: () => ({ meta: [{ title: "My complaints — CitizenPulse" }] }),
  component: MyComplaints,
});

function MyComplaints() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [cat, setCat] = useState<string>("all");

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["my-complaints-list", user?.id],
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

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (cat !== "all" && c.category !== cat) return false;
      if (q) {
        const s = `${c.title} ${c.area} ${c.description}`.toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [complaints, q, status, cat]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">My complaints</h1>
            <p className="text-muted-foreground">Track and manage all your submissions.</p>
          </div>
          <Button asChild className="bg-gradient-primary shadow-elegant">
            <Link to="/raise-complaint">
              <Plus className="mr-1 h-4 w-4" /> New complaint
            </Link>
          </Button>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_180px_180px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search title, area, description..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORY_OPTIONS.map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <p className="py-10 text-center text-muted-foreground">Loading...</p>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 font-medium">No complaints found</p>
                <p className="text-sm text-muted-foreground">Try adjusting filters, or file a new complaint.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{c.id.slice(0, 6)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate font-medium">{c.title}</TableCell>
                        <TableCell>{CATEGORY_LABELS[c.category]}</TableCell>
                        <TableCell>{c.area}</TableCell>
                        <TableCell><PriorityBadge priority={c.priority} /></TableCell>
                        <TableCell><StatusBadge status={c.status} /></TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(c.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
