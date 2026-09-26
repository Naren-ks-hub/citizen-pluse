import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "My profile — CitizenPulse" }] }),
  component: ProfilePage,
});

const schema = z.object({
  full_name: z.string().trim().min(1).max(100),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
});

function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ full_name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile) setForm({
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      address: profile.address || "",
    });
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
    }).eq("id", user!.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  const changePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 6) return toast.error("Password must be at least 6 characters");
    setPwdSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setPwdSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    setPwd("");
  };

  const initials = (form.full_name || user?.email || "U")
    .split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 font-display text-3xl font-bold">My profile</h1>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center p-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-gradient-primary text-2xl text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <p className="mt-3 font-semibold">{form.full_name || "—"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader><CardTitle>Personal information</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={save} className="space-y-4">
                  <div>
                    <Label htmlFor="fn">Full name</Label>
                    <Input id="fn" value={form.full_name} maxLength={100}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="ph">Phone</Label>
                    <Input id="ph" value={form.phone} maxLength={20}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="ad">Address</Label>
                    <Textarea id="ad" rows={3} value={form.address} maxLength={300}
                      onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </div>
                  <Button type="submit" disabled={saving} className="bg-gradient-primary">
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={changePwd} className="space-y-4">
                  <div>
                    <Label htmlFor="np">New password</Label>
                    <Input id="np" type="password" value={pwd}
                      onChange={(e) => setPwd(e.target.value)} minLength={6} />
                  </div>
                  <Button type="submit" disabled={pwdSaving} variant="outline">
                    {pwdSaving ? "Updating..." : "Update password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
