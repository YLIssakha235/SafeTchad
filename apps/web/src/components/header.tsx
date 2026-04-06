import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import UserMenu from "./user-menu";
import { MenuIcon } from "lucide-react";

// ── Theme toggle ──────────────────────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    return (
      (localStorage.getItem("st-theme") as "light" | "dark") ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
    );
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("st-theme", theme);
  }, [theme]);

  return { theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function CloseIcon(){
  return (
    <svg width ="18" height="18" viewBox="0 0 24 24" fill= "none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  );
}


// ── Nav links config ──────────────────────────────────────────────────────────
const NAV_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/incidents", label: "Incidents" },
] as const;

// ── Header ────────────────────────────────────────────────────────────────────
export default function Header() {
  const { theme, toggle } = useTheme();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  // ajout pour mobile menu
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Ferme le menu mobile à chaque changement de route
    setMobileOpen(false);
  }, [currentPath]);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand text-white">
            <ShieldIcon />
          </span>
          <span className="font-display text-lg leading-none tracking-tight">
            Safe<span className="text-brand">Tchad</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-1 bg-muted rounded-full px-1.5 py-1.5">
          {NAV_LINKS.map(({ to, label }) => {
            const isActive =
              to === "/"
                ? currentPath === "/"
                : currentPath.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={[
                  "px-4 py-1 rounded-full text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Signaler CTA */}
          <Link
            to="/incidents/create"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Signaler
          </Link>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label="Changer le thème"
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

            {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Ouvrir le menu"
            className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
            >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>


          <UserMenu />
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className= "mx-auto max-w-6xl px-4 py-4 flex flex-col gap-2">
            {NAV_LINKS.map(({ to, label }) => {
              const isActive =
                to === "/"
                  ? currentPath === "/"
                  : currentPath.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={[
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  ].join(" ")}
                >
                  {label}
                </Link>
              );
            })}

            <Link
              to="/incidents/create"
              className="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Signaler un incident
            </Link>
          </div>
        </div>
    )}
  </header>

  );
}