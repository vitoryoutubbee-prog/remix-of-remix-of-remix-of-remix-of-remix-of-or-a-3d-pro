import { Link, useRouterState, type LinkProps } from "@tanstack/react-router";
import { Calculator, FolderKanban, HardHat, Home, LayoutGrid, Users } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

interface NavItem {
  to: NonNullable<LinkProps["to"]>;
  label: string;
  icon: typeof Home;
  exact?: boolean;
}

const nav: NavItem[] = [
  { to: "/", label: "Início", icon: Home, exact: true },
  { to: "/orcamentos", label: "Orçamentos", icon: Calculator },
  { to: "/projetos", label: "Projetos", icon: FolderKanban },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/mais", label: "Mais", icon: LayoutGrid },
];

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <HardHat className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-sm font-bold tracking-tight text-foreground uppercase">
          Orça 3D
        </span>
        <span className="block text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
          Construtor Pro
        </span>
      </span>
    </Link>
  );
}

function initials(name?: string) {
  if (!name) return "EU";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "EU";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { state } = useStore();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Brand />
          <Link
            to="/configuracoes"
            aria-label="Abrir perfil"
            className="flex size-10 items-center justify-center rounded-full bg-muted font-display text-xs font-bold text-muted-foreground transition hover:bg-muted/80"
          >
            {initials(state.company?.name)}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-28 sm:px-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto grid w-full max-w-2xl grid-cols-5 px-2 py-2">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5" />
                {item.label}
                <span
                  className={cn(
                    "h-0.5 w-6 rounded-full transition-colors",
                    active ? "bg-primary" : "bg-transparent",
                  )}
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground uppercase sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
