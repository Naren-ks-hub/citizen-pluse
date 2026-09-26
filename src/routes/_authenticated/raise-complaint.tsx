import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
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
import { PriorityBadge } from "@/components/status-badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CATEGORY_LABELS, CATEGORY_OPTIONS, suggestPriority } from "@/lib/priority";
import type { Category } from "@/lib/priority";
import { toast } from "sonner";
import { Camera, MapPin, Sparkles, Upload, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/raise-complaint")({
  head: () => ({ meta: [{ title: "Raise complaint — CitizenPulse" }] }),
  component: RaiseComplaint,
});

const schema = z.object({
  title: z.string().trim().min(3, "Title too short").max(120),
  category: z.string().min(1, "Category required"),
  area: z.string().trim().min(1, "Area required").max(100),
  ward: z.string().max(50).optional(),
  landmark: z.string().max(120).optional(),
  description: z.string().trim().min(10, "Please describe the issue").max(1000),
});

function RaiseComplaint() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "" as Category | "",
    area: "",
    ward: "",
    landmark: "",
    description: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const priority = useMemo(() => {
    if (!form.category) return null;
    return suggestPriority(form.category as Category, `${form.title} ${form.description}`);
  }, [form.category, form.title, form.description]);

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setImage(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (!user) return;
    setSubmitting(true);
    try {
      let image_url: string | null = null;
      if (image) {
        const ext = image.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("complaint-images").upload(path, image);
        if (upErr) throw upErr;
        image_url = path;
      }
      const { error } = await supabase.from("complaints").insert({
        user_id: user.id,
        title: parsed.data.title,
        category: parsed.data.category as Category,
        area: parsed.data.area,
        ward: parsed.data.ward || null,
        landmark: parsed.data.landmark || null,
        description: parsed.data.description,
        image_url,
        priority: priority ?? "medium",
      });
      if (error) throw error;
      toast.success("Complaint submitted successfully");
      navigate({ to: "/my-complaints" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const useLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          landmark: `Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}`,
        }));
        toast.success("Location captured");
      },
      () => toast.error("Couldn't fetch location"),
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold">Raise a complaint</h1>
          <p className="mt-1 text-muted-foreground">Give us the details — we'll route it to the right department.</p>
        </div>

        <form onSubmit={submit}>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Complaint details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Complaint title *</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      maxLength={120}
                      placeholder="e.g. Large pothole near Sector 12 signal"
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Category *</Label>
                      <Select
                        value={form.category}
                        onValueChange={(v) => setForm({ ...form, category: v as Category })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map(([v, l]) => (
                            <SelectItem key={v} value={v}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="area">Area *</Label>
                      <Input
                        id="area"
                        value={form.area}
                        onChange={(e) => setForm({ ...form, area: e.target.value })}
                        maxLength={100}
                        placeholder="e.g. Sector 12"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="ward">Ward</Label>
                      <Input
                        id="ward"
                        value={form.ward}
                        onChange={(e) => setForm({ ...form, ward: e.target.value })}
                        maxLength={50}
                        placeholder="e.g. Ward 42"
                      />
                    </div>
                    <div>
                      <Label htmlFor="landmark" className="flex items-center justify-between">
                        Landmark
                        <button
                          type="button"
                          onClick={useLocation}
                          className="text-xs text-accent hover:underline"
                        >
                          <MapPin className="mr-1 inline h-3 w-3" /> Use my location
                        </button>
                      </Label>
                      <Input
                        id="landmark"
                        value={form.landmark}
                        onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                        maxLength={120}
                        placeholder="Near landmark"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="desc">Description *</Label>
                    <Textarea
                      id="desc"
                      rows={5}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      maxLength={1000}
                      placeholder="Describe the issue in detail..."
                      required
                    />
                    <p className="mt-1 text-right text-xs text-muted-foreground">
                      {form.description.length}/1000
                    </p>
                  </div>

                  <div>
                    <Label>Photo</Label>
                    {preview ? (
                      <div className="relative mt-1 overflow-hidden rounded-lg border border-border">
                        <img src={preview} alt="Preview" className="max-h-64 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setImage(null); setPreview(null); }}
                          className="absolute right-2 top-2 rounded-full bg-background/90 p-1 shadow"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="mt-1 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center transition-smooth hover:border-accent hover:bg-secondary/50">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm font-medium">Click to upload a photo</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG · Max 5MB</p>
                        <input type="file" accept="image/*" className="hidden" onChange={onImage} />
                      </label>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display text-base">
                    <Sparkles className="h-4 w-4 text-accent" /> Suggested priority
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {priority ? (
                    <>
                      <PriorityBadge priority={priority} />
                      <p className="mt-3 text-xs text-muted-foreground">
                        Auto-suggested from category & keywords. Admin may adjust.
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Choose a category and describe the issue for a priority suggestion.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="font-display text-base">Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>· Be specific in the title.</p>
                  <p>· Attach a photo for faster action.</p>
                  <p>· Mention the exact landmark.</p>
                </CardContent>
              </Card>

              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="w-full bg-gradient-primary shadow-elegant"
              >
                <Upload className="mr-1 h-4 w-4" />
                {submitting ? "Submitting..." : "Submit complaint"}
              </Button>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

void CATEGORY_LABELS;
