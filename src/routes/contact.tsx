import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(1, "Message required").max(1000),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — CitizenPulse" },
      { name: "description", content: "Get in touch with the CitizenPulse team." },
      { property: "og:title", content: "Contact CitizenPulse" },
      { property: "og:description", content: "Get in touch with our civic-tech team." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    // Demo: just show success. Wire to real endpoint later.
    setTimeout(() => {
      toast.success("Thanks! We'll be in touch.");
      setForm({ name: "", email: "", message: "" });
      setSubmitting(false);
    }, 500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Contact us</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            Questions, partnerships, or feedback — we'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="space-y-4 md:col-span-1">
          {[
            { icon: MapPin, title: "Office", body: "Municipal Corporation, City Hall" },
            { icon: Phone, title: "Phone", body: "1800-XXX-CITY" },
            { icon: Mail, title: "Email", body: "hello@citizenpulse.gov" },
          ].map((c) => (
            <Card key={c.title} className="shadow-card">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="rounded-lg bg-gradient-primary p-2 text-primary-foreground">
                  <c.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.title}</p>
                  <p className="font-medium">{c.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-card md:col-span-2">
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    maxLength={255}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  maxLength={1000}
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {form.message.length}/1000
                </p>
              </div>
              <Button type="submit" disabled={submitting} className="bg-gradient-primary shadow-elegant">
                {submitting ? "Sending..." : "Send message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
}
