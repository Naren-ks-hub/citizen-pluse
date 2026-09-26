import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X, ShieldCheck, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/features", label: "Features" },
  { to: "/contact", label: "Contact" },
];

const citizenLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/raise-complaint", label: "Raise Complaint" },
  { to: "/my-complaints", label: "My Complaints" },
];

export function Navbar() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  };

  const initials = (user?.user_metadata?.full_name || user?.email || "U")
    .split(" ")
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-elegant">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold text-primary">CitizenPulse</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Civic Analytics
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {publicLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-smooth hover:bg-secondary hover:text-primary"
              activeProps={{ className: "text-primary bg-secondary" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {citizenLinks.map((l) => (
                  <DropdownMenuItem key={l.to} asChild>
                    <Link to={l.to} className="w-full cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> {l.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="w-full cursor-pointer text-primary">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Admin Console
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild className="bg-gradient-primary shadow-elegant">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Register
                </Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-md p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="space-y-1 px-4 py-3">
            {publicLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
            {user &&
              citizenLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
                >
                  {l.label}
                </Link>
              ))}
            {user && isAdmin && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-secondary"
              >
                Admin Console
              </Link>
            )}
            <div className="mt-2 flex gap-2 pt-2">
              {user ? (
                <Button className="w-full" variant="outline" onClick={handleSignOut}>
                  Sign out
                </Button>
              ) : (
                <>
                  <Button asChild className="flex-1" variant="outline">
                    <Link to="/auth">Sign in</Link>
                  </Button>
                  <Button asChild className="flex-1 bg-gradient-primary">
                    <Link to="/auth" search={{ mode: "signup" }}>Register</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
