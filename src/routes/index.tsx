import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ShieldCheck,
  MapPin,
  BarChart3,
  Clock,
  Users,
  FileText,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Camera,
  Send,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const stats = [
  { label: "Complaints resolved", value: "12,480+" },
  { label: "Active wards", value: "48" },
  { label: "Avg. resolution", value: "3.2 days" },
  { label: "Citizen satisfaction", value: "94%" },
];

const features = [
  {
    icon: Send,
    title: "One-tap reporting",
    desc: "Snap a photo, drop a pin, and file a complaint in under 60 seconds — from any device.",
  },
  {
    icon: Zap,
    title: "Smart priority engine",
    desc: "Automatic priority suggestions from category + keywords so critical issues surface first.",
  },
  {
    icon: BarChart3,
    title: "Live civic analytics",
    desc: "Officials see hotspot maps, category trends, and resolution SLAs on a real-time dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Accountable & transparent",
    desc: "Every complaint has a timeline, remarks, and an assigned officer — full audit trail.",
  },
];

const steps = [
  {
    icon: Camera,
    title: "Report it",
    desc: "Fill a short form, attach a photo, and pin the location of the issue.",
  },
  {
    icon: Sparkles,
    title: "We prioritize",
    desc: "Our engine tags urgency and routes it to the right department automatically.",
  },
  {
    icon: CheckCircle2,
    title: "It gets fixed",
    desc: "Officers act, update status, and you get notified when the issue is resolved.",
  },
];

const testimonials = [
  {
    quote: "The pothole on my street was fixed within four days. I've never seen the city move this fast.",
    name: "Anita Sharma",
    role: "Resident, Ward 12",
  },
  {
    quote: "Analytics helped us cut streetlight complaints by 60% in one quarter. Game changer.",
    name: "R. Krishnan",
    role: "Municipal Officer",
  },
  {
    quote: "Finally a portal that respects citizens' time. Clean, fast, and I always know what's happening.",
    name: "Priya Nair",
    role: "Citizen",
  },
];

const faqs = [
  {
    q: "Is CitizenPulse free to use?",
    a: "Yes — it's a public-service platform available to every resident free of charge.",
  },
  {
    q: "How do I know my complaint is being worked on?",
    a: "Every complaint gets a live timeline with status updates and remarks from the assigned officer.",
  },
  {
    q: "Which types of issues can I report?",
    a: "Roads, water, garbage, streetlights, drainage, electricity, transport, sanitation, parks — and more.",
  },
  {
    q: "Can I stay anonymous?",
    a: "You must register to file a complaint so we can update you on progress, but your details are never shared publicly.",
  },
];

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28 lg:px-8">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Community Problem Analytics Platform
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Turning citizen complaints into <span className="text-info">actionable</span> civic insight.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-primary-foreground/80">
              Report broken streetlights, potholes, garbage, water leaks — anything. Track every step until it's fixed. See your city improve in real time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-elegant">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Get started free <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/features">Explore features</Link>
              </Button>
            </div>
          </div>

          {/* Mock dashboard preview */}
          <div className="relative hidden md:block">
            <div className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-4 backdrop-blur-xl shadow-elegant">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Open", value: "128", color: "bg-warning/90 text-warning-foreground" },
                  { label: "In progress", value: "42", color: "bg-info/90 text-info-foreground" },
                  { label: "Resolved", value: "1,204", color: "bg-success/90 text-success-foreground" },
                  { label: "High priority", value: "17", color: "bg-destructive/90 text-destructive-foreground" },
                ].map((c) => (
                  <div key={c.label} className={`rounded-xl p-4 ${c.color}`}>
                    <p className="text-xs uppercase tracking-wider opacity-90">{c.label}</p>
                    <p className="mt-1 text-2xl font-bold">{c.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-background/95 p-4 text-foreground">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent complaints</span>
                  <span className="text-xs text-primary">Live</span>
                </div>
                <ul className="space-y-2 text-sm">
                  {[
                    ["Pothole near Sec 12", "Roads", "warning"],
                    ["Streetlight out", "Lights", "info"],
                    ["Water leak", "Water", "destructive"],
                  ].map(([t, c, tone]) => (
                    <li key={t} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full bg-${tone}`} /> {t}
                      </span>
                      <span className="text-xs text-muted-foreground">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold text-primary">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">Features</p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            Everything a modern civic portal should be.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Built for citizens who want action, and administrators who need insight.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant">
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

      {/* How it works */}
      <section className="bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">How it works</p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              Three steps between problem and progress.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-elegant">
                  <s.icon className="h-6 w-6" />
                </div>
                <div className="absolute -top-4 right-6 font-display text-6xl font-bold text-primary/10">
                  0{i + 1}
                </div>
                <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">Testimonials</p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            Trusted across neighbourhoods.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="shadow-card">
              <CardContent className="p-6">
                <p className="text-foreground/90">"{t.quote}"</p>
                <div className="mt-6 border-t border-border pt-4">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-secondary/50">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">FAQ</p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              Answers, up front.
            </h2>
          </div>
          <Accordion type="single" collapsible className="mt-8">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`f-${i}`}>
                <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-none bg-gradient-hero text-primary-foreground shadow-elegant">
          <CardContent className="grid gap-6 p-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h3 className="font-display text-2xl font-bold sm:text-3xl">
                Ready to make your city work better?
              </h3>
              <p className="mt-2 text-primary-foreground/80">
                Register in under a minute. File your first complaint today.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                <Link to="/auth" search={{ mode: "signup" }}>Register free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/contact">Talk to us</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
}

// Suppress unused imports warning
void Users;
void FileText;
void MapPin;
void Clock;
