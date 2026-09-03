import { Search } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ScreenHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground uppercase sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative mb-4">
      <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-full border border-border bg-card py-3 pr-4 pl-11 text-sm outline-none transition focus:border-primary"
      />
    </div>
  );
}

export interface FilterChip {
  id: string;
  label: string;
  count?: number;
}

export function FilterChips({
  chips,
  active,
  onSelect,
}: {
  chips: FilterChip[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1">
      {chips.map((c) => {
        const on = c.id === active;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold tracking-wide uppercase transition",
              on
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {c.label}
            {c.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px]",
                  on ? "bg-primary-foreground/20" : "bg-muted",
                )}
              >
                {c.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface-card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-primary">
        <Icon className="size-5" />
      </span>
      <h2 className="font-display text-base font-bold">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function SectionCard({
  title,
  icon: Icon,
  description,
  aside,
  children,
}: {
  title: string;
  icon?: ComponentType<{ className?: string }>;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="surface-card overflow-hidden">
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-primary">
              <Icon className="size-4" />
            </span>
          )}
          <div>
            <h2 className="font-display text-sm font-bold tracking-wide uppercase">{title}</h2>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
        {aside}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="surface-card px-4 py-3">
      <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 font-display text-lg font-bold text-foreground">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function StickyBar({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-20 z-30 px-4">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-lift backdrop-blur">
        <div>{left}</div>
        {right}
      </div>
    </div>
  );
}

export const fieldClass =
  "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none transition focus:border-primary";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}
