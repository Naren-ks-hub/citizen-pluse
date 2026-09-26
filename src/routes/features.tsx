import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import {
  Send, BarChart3, Camera, Bell, Users, Shield, FileText, MapPin, Zap, Clock, TrendingUp, Filter,
} from "lucide-react";

const features = [
  { icon: Send, title: "Complaint submission", desc: "Structured form with categories, area, ward, landmark, and photo upload." },
  { icon: Camera, title: "Image evidence", desc: "Attach photos so officials see exactly what needs fixing." },
  { icon: MapPin, title: "Location tagging", desc: "Pinpoint the issue by ward, area, and landmark for precise routing." },
  { icon: Zap, title: "Smart priority", desc: "Automatic priority suggestion based on category + keywords in your description." },
  { icon: BarChart3, title: "Live analytics", desc: "Officials get real-time charts on categories, hotspots, trends, and SLA." },
  { icon: Bell, title: "Status updates", desc: "Track pending → in progress → resolved with timeline notifications." },
  { icon: Shield, title: "Role-based access", desc: "Separate citizen and administrator experiences with proper security." },
  { icon: Users, title: "User management", desc: "Admins can view users, complaint histories, and manage the community." },
  { icon: Filter, title: "Search & filter", desc: "Find any complaint by status, category, area, priority, or date." },
  { icon: FileText, title: "Reports & export", desc: "Generate daily / weekly / monthly reports for oversight and audit." },
  { icon: Clock, title: "Resolution SLA", desc: "Measure average time to resolve — hold departments to service standards." },
  { icon: TrendingUp, title: "Hotspot heatmap", desc: "See which wards need the most attention with visual analytics." },
];

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — CitizenPulse" },
      { name: "description", content: "Full-featured civic complaint platform: complaints, image uploads, analytics, priority engine, reports, and role-based dashboards." },
      { property: "og:title", content: "CitizenPulse Features" },
      { property: "og:description", content: "Complaints, analytics, priority engine, hotspot maps, and more." },
    ],
  }),
  component: Features,
});

function Features() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Everything you need to run a responsive city.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
            One platform. Citizens raise. Officials resolve. Data drives decisions.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="shadow-card transition-smooth hover:-translate-y-0.5 hover:shadow-elegant">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-elegant">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
