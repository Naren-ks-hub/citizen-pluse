import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — CitizenPulse" },
      { name: "description", content: "CitizenPulse is a civic-tech platform bridging citizens and city officials with transparent complaint tracking and analytics." },
      { property: "og:title", content: "About CitizenPulse" },
      { property: "og:description", content: "The civic-tech platform bridging citizens and city officials." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">About CitizenPulse</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
            A civic-technology initiative built to make city services responsive, accountable, and data-driven.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Target, title: "Our mission", body: "Give every citizen a fair, fast, transparent way to raise civic issues — and equip officials with the data to act." },
            { icon: Eye, title: "Our vision", body: "A city where every complaint is visible, every action is tracked, and every neighbourhood improves measurably." },
            { icon: Heart, title: "Our values", body: "Transparency, accountability, respect for citizens' time, and evidence-based decision making." },
          ].map((v) => (
            <Card key={v.title} className="shadow-card">
              <CardContent className="p-6">
                <v.icon className="mb-3 h-8 w-8 text-accent" />
                <h3 className="font-display text-xl font-semibold">{v.title}</h3>
                <p className="mt-2 text-muted-foreground">{v.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="prose prose-slate mt-16 max-w-none">
          <h2 className="font-display text-2xl font-bold">Why CitizenPulse exists</h2>
          <p className="mt-3 text-muted-foreground">
            Traditional grievance systems bury citizen voices in paperwork. CitizenPulse replaces phone trees and paper forms with a modern, mobile-first platform. Complaints are photographed, geo-tagged, categorised, and prioritised automatically — then routed to the right officer.
          </p>
          <p className="mt-3 text-muted-foreground">
            City administrators see a live analytics dashboard showing hotspots, resolution SLAs, and category trends. Data replaces guesswork. Repeat issues get budgetary attention. Officers are recognised for turnaround, not paperwork.
          </p>
          <p className="mt-3 text-muted-foreground">
            The result: a feedback loop where citizens see change, officials see impact, and cities get measurably better.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
