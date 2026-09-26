import { Link } from "@tanstack/react-router";
import { ShieldCheck, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/10 backdrop-blur">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-bold">CitizenPulse</span>
            </div>
            <p className="text-sm text-primary-foreground/70">
              Turning citizen complaints into actionable civic insights.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide">Platform</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/features" className="hover:text-primary-foreground">Features</Link></li>
              <li><Link to="/about" className="hover:text-primary-foreground">About</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary-foreground">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide">Get involved</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/auth" search={{ mode: "signup" }} className="hover:text-primary-foreground">Register</Link></li>
              <li><Link to="/raise-complaint" className="hover:text-primary-foreground">Raise Complaint</Link></li>
              <li><Link to="/contact" className="hover:text-primary-foreground">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide">Reach us</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Municipal Corporation, City Hall</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> 1800-XXX-CITY</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@citizenpulse.gov</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-primary-foreground/10 pt-6 text-xs text-primary-foreground/60 md:flex-row">
          <p>© {new Date().getFullYear()} CitizenPulse. A civic-tech initiative.</p>
          <p>Built for transparent, accountable government service.</p>
        </div>
      </div>
    </footer>
  );
}
