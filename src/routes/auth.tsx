import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

type Search = { mode?: "signin" | "signup" };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    mode: s.mode === "signup" ? "signup" : "signin",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — CitizenPulse" },
      { name: "description", content: "Sign in or register on CitizenPulse to report civic issues." },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email("Valid email required").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

const signUpSchema = signInSchema.extend({
  full_name: z.string().trim().min(1, "Full name required").max(100),
  phone: z.string().trim().min(6, "Phone required").max(20),
});

function passwordScore(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">(mode ?? "signin");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const [signIn, setSignIn] = useState({ email: "", password: "" });
  const [signUp, setSignUp] = useState({
    full_name: "",
    phone: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signInSchema.safeParse(signIn);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/dashboard", replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse(signUp);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: parsed.data.full_name,
          phone: parsed.data.phone,
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created! You're signed in.");
    navigate({ to: "/dashboard", replace: true });
  };

  const score = passwordScore(signUp.password);
  const scoreLabel = ["Too weak", "Weak", "Okay", "Strong", "Excellent"][score];
  const scoreColor = ["bg-destructive", "bg-destructive", "bg-warning", "bg-info", "bg-success"][score];

  return (
    <div className="flex min-h-screen bg-gradient-hero">
      <div className="mx-auto grid w-full max-w-6xl md:grid-cols-2">
        <div className="hidden flex-col justify-between p-12 text-primary-foreground md:flex">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10 backdrop-blur">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="font-display text-xl font-bold">CitizenPulse</span>
          </Link>
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight">
              Every complaint tracked. Every citizen heard.
            </h2>
            <p className="mt-4 max-w-md text-primary-foreground/80">
              Join thousands of residents helping build a more responsive, transparent city.
            </p>
          </div>
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} CitizenPulse
          </p>
        </div>

        <div className="flex items-center justify-center p-6 md:p-12">
          <Card className="w-full max-w-md shadow-elegant">
            <CardContent className="p-6">
              <div className="mb-6 text-center md:hidden">
                <Link to="/" className="inline-flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
                    <ShieldCheck className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="font-display text-lg font-bold text-primary">CitizenPulse</span>
                </Link>
              </div>

              <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="si-email">Email</Label>
                      <Input
                        id="si-email"
                        type="email"
                        value={signIn.email}
                        onChange={(e) => setSignIn({ ...signIn, email: e.target.value })}
                        maxLength={255}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="si-pwd">Password</Label>
                      <div className="relative">
                        <Input
                          id="si-pwd"
                          type={showPwd ? "text" : "password"}
                          value={signIn.password}
                          onChange={(e) => setSignIn({ ...signIn, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                          aria-label="Toggle password visibility"
                        >
                          {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-gradient-primary shadow-elegant">
                      {loading ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="su-name">Full name</Label>
                      <Input
                        id="su-name"
                        value={signUp.full_name}
                        onChange={(e) => setSignUp({ ...signUp, full_name: e.target.value })}
                        maxLength={100}
                        required
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="su-phone">Phone</Label>
                        <Input
                          id="su-phone"
                          value={signUp.phone}
                          onChange={(e) => setSignUp({ ...signUp, phone: e.target.value })}
                          maxLength={20}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="su-email">Email</Label>
                        <Input
                          id="su-email"
                          type="email"
                          value={signUp.email}
                          onChange={(e) => setSignUp({ ...signUp, email: e.target.value })}
                          maxLength={255}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="su-pwd">Password</Label>
                      <div className="relative">
                        <Input
                          id="su-pwd"
                          type={showPwd ? "text" : "password"}
                          value={signUp.password}
                          onChange={(e) => setSignUp({ ...signUp, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                          aria-label="Toggle password visibility"
                        >
                          {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {signUp.password && (
                        <div className="mt-2">
                          <div className="flex h-1.5 gap-1">
                            {[0, 1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className={`flex-1 rounded-full ${i < score ? scoreColor : "bg-muted"}`}
                              />
                            ))}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{scoreLabel}</p>
                        </div>
                      )}
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-gradient-primary shadow-elegant">
                      {loading ? "Creating account..." : "Create account"}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      By registering you agree to our terms and privacy policy.
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
