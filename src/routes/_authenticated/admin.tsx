import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { StatCard } from "@/components/stat-card";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CATEGORY_LABELS } from "@/lib/priority";
import type { Database } from "@/integrations/supabase/types";
import {
  Users, FileText, Clock, CheckCircle2, AlertTriangle, ShieldOff, Timer,
  BarChart3, TrendingUp, MapPin, Download,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  Legend, LineChart, Line, CartesianGrid,
} from "recharts";

type Complaint = Database["public"]["Tables"]["complaints"]["Row"];
type Status = Database["public"]["Enums"]["complaint_status"];
type Priority = Database["public"]["Enums"]["complaint_priority"];

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin console — CitizenPulse" }] }),
  component: AdminPage,
});

const CHART_COLORS = [
  "oklch(0.28 0.09 265)",
  "oklch(0.55 0.14 250)",
  "oklch(0.62 0.15 155)",
  "oklch(0.78 0.15 80)",
  "oklch(0.58 0.22 25)",
  "oklch(0.62 0.14 240)",
  "oklch(0.5 0.15 300)",
  "oklch(0.55 0.15 30)",
  "oklch(0.6 0.12 200)",
  "oklch(0.4 0.1 100)",
];

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const qc = useQueryClient();

  const { data: complaints = [] } = useQuery({
    queryKey: ["admin-complaints"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [editing, setEditing] = useState<Complaint | null>(null);
  const [remark, setRemark] = useState("");
  const [officer, setOfficer] = useState("");
  const [status, setStatus] = useState<Status>("pending");
  const [priority, setPriority] = useState<Priority>("medium");

  const openEdit = (c: Complaint) => {
    setEditing(c);
    setRemark(c.admin_remark ?? "");
    setOfficer(c.assigned_officer ?? "");
    setStatus(c.status);
    setPriority(c.priority);
  };

  const saveEdit = async () => {
    if (!editing) return;
    const { error } = await supabase.from("complaints").update({
      status, priority, admin_remark: remark || null, assigned_officer: officer || null,
    }).eq("id", editing.id);
    if (error) return toast.error(error.message);
    toast.success("Complaint updated");
    qc.invalidateQueries({ queryKey: ["admin-complaints"] });
    setEditing(null);
  };

  const deleteComplaint = async (id: string) => {
    if (!confirm("Delete this complaint? This cannot be undone.")) return;
    const { error } = await supabase.from("complaints").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Complaint deleted");
    qc.invalidateQueries({ queryKey: ["admin-complaints"] });
  };

  const totals = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === "pending").length;
    const in_progress = complaints.filter((c) => c.status === "in_progress").length;
    const resolved = complaints.filter((c) => c.status === "resolved").length;
    const high = complaints.filter((c) => c.priority === "high").length;
    const low = complaints.filter((c) => c.priority === "low").length;

    const resolvedTimes = complaints
      .filter((c) => c.status === "resolved")
      .map((c) => (new Date(c.updated_at).getTime() - new Date(c.created_at).getTime()) / 86400000);
    const avgDays = resolvedTimes.length
      ? (resolvedTimes.reduce((a, b) => a + b, 0) / resolvedTimes.length).toFixed(1)
      : "0";

    return { total, pending, in_progress, resolved, high, low, avgDays };
  }, [complaints]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    complaints.forEach((c) => map.set(c.category, (map.get(c.category) ?? 0) + 1));
    return Array.from(map.entries()).map(([k, v]) => ({ name: CATEGORY_LABELS[k as keyof typeof CATEGORY_LABELS], value: v }));
  }, [complaints]);

  const areaData = useMemo(() => {
    const map = new Map<string, number>();
    complaints.forEach((c) => map.set(c.area, (map.get(c.area) ?? 0) + 1));
    return Array.from(map.entries()).map(([k, v]) => ({ area: k, count: v })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [complaints]);

  const statusData = [
    { name: "Pending", value: totals.pending },
    { name: "In Progress", value: totals.in_progress },
    { name: "Resolved", value: totals.resolved },
    { name: "Rejected", value: complaints.filter((c) => c.status === "rejected").length },
  ];

  const monthlyData = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString("default", { month: "short" });
      map.set(key, 0);
    }
    complaints.forEach((c) => {
      const key = new Date(c.created_at).toLocaleString("default", { month: "short" });
      if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([month, count]) => ({ month, count }));
  }, [complaints]);

  const exportCSV = () => {
    const rows = [
      ["id", "title", "category", "area", "priority", "status", "created_at"],
      ...complaints.map((c) => [c.id, c.title, c.category, c.area, c.priority, c.status, c.created_at]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `complaints-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <ShieldOff className="h-12 w-12 text-destructive" />
          <h1 className="mt-4 font-display text-2xl font-bold">Admin access required</h1>
          <p className="mt-2 text-muted-foreground">
            Your account isn't an administrator. Ask an existing admin to grant you the role, or reach out via the contact page.
          </p>
          <div className="mt-6 flex gap-2">
            <Button asChild variant="outline"><Link to="/dashboard">Back to dashboard</Link></Button>
            <Button asChild className="bg-gradient-primary"><Link to="/contact">Contact us</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">Admin console</h1>
            <p className="text-muted-foreground">Monitor, prioritize, and resolve citizen complaints.</p>
          </div>
          <Button onClick={exportCSV} variant="outline"><Download className="mr-1 h-4 w-4" /> Export CSV</Button>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="manage">Complaints</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total users" value={users.length} icon={<Users className="h-6 w-6" />} accent="primary" />
              <StatCard label="Total complaints" value={totals.total} icon={<FileText className="h-6 w-6" />} accent="info" />
              <StatCard label="Pending" value={totals.pending} icon={<Clock className="h-6 w-6" />} accent="warning" />
              <StatCard label="Resolved" value={totals.resolved} icon={<CheckCircle2 className="h-6 w-6" />} accent="success" />
              <StatCard label="In progress" value={totals.in_progress} icon={<TrendingUp className="h-6 w-6" />} accent="info" />
              <StatCard label="High priority" value={totals.high} icon={<AlertTriangle className="h-6 w-6" />} accent="destructive" />
              <StatCard label="Low priority" value={totals.low} icon={<BarChart3 className="h-6 w-6" />} accent="success" />
              <StatCard label="Avg. resolution" value={`${totals.avgDays}d`} icon={<Timer className="h-6 w-6" />} accent="primary" hint="days per resolved complaint" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-card">
                <CardHeader><CardTitle>Recent complaints</CardTitle></CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    {complaints.slice(0, 6).map((c) => (
                      <div key={c.id} className="flex items-center justify-between gap-3 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{c.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {CATEGORY_LABELS[c.category]} · {c.area}
                          </p>
                        </div>
                        <PriorityBadge priority={c.priority} />
                        <StatusBadge status={c.status} />
                      </div>
                    ))}
                    {complaints.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No complaints yet</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" /> Top problem areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {areaData.length === 0 && <p className="text-sm text-muted-foreground">No data yet</p>}
                    {areaData.map((a, i) => {
                      const pct = (a.count / (areaData[0]?.count || 1)) * 100;
                      return (
                        <div key={a.area}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{a.area}</span>
                            <span className="text-muted-foreground">{a.count}</span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-gradient-primary transition-all"
                              style={{ width: `${pct}%`, opacity: 1 - i * 0.08 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* MANAGE */}
          <TabsContent value="manage" className="mt-6">
            <Card className="shadow-card">
              <CardContent className="p-4">
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
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {complaints.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">#{c.id.slice(0, 6)}</TableCell>
                          <TableCell className="max-w-[220px] truncate font-medium">{c.title}</TableCell>
                          <TableCell>{CATEGORY_LABELS[c.category]}</TableCell>
                          <TableCell>{c.area}</TableCell>
                          <TableCell><PriorityBadge priority={c.priority} /></TableCell>
                          <TableCell><StatusBadge status={c.status} /></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>Edit</Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteComplaint(c.id)}>Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {complaints.length === 0 && (
                        <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No complaints yet</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS */}
          <TabsContent value="analytics" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-card">
                <CardHeader><CardTitle>Category distribution</CardTitle></CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={90} label>
                        {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader><CardTitle>Resolution status</CardTitle></CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} label>
                        {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-card lg:col-span-2">
                <CardHeader><CardTitle>Complaints by area</CardTitle></CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={areaData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.015 250)" />
                      <XAxis dataKey="area" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="oklch(0.55 0.14 250)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-card lg:col-span-2">
                <CardHeader><CardTitle>Monthly complaints trend</CardTitle></CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.015 250)" />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="oklch(0.28 0.09 265)" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users" className="mt-6">
            <Card className="shadow-card">
              <CardContent className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Complaints</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => {
                      const count = complaints.filter((c) => c.user_id === u.id).length;
                      return (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>{u.phone || "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{count}</TableCell>
                        </TableRow>
                      );
                    })}
                    {users.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No users yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage complaint</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{editing.title}</p>
                <p className="text-sm text-muted-foreground">
                  {CATEGORY_LABELS[editing.category]} · {editing.area}
                </p>
                <p className="mt-2 text-sm">{editing.description}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Assigned officer</Label>
                <Input value={officer} onChange={(e) => setOfficer(e.target.value)} maxLength={100} />
              </div>
              <div>
                <Label>Admin remark</Label>
                <Textarea value={remark} onChange={(e) => setRemark(e.target.value)} rows={3} maxLength={500} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit} className="bg-gradient-primary">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
