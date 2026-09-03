import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Handshake,
  History,
  MapPin,
  Plus,
  Ruler,
  Settings,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DemoTag, StatusBadge } from "@/components/StatusBadge";
import { Onboarding } from "@/components/Onboarding";
import { computeTotals } from "@/lib/budget";
import { brl, dateBR } from "@/lib/format";
import { useStore } from "@/lib/store";
import { PROJECT_TYPE_LABEL } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Início — ORÇA 3D Construtor Pro" },
      {
        name: "description",
        content:
          "Gerencie obras, monte orçamentos inteligentes e apresente propostas visuais profissionais aos seus clientes.",
      },
      { property: "og:title", content: "ORÇA 3D Construtor Pro — Mostre a obra antes de vender a obra" },
      {
        property: "og:description",
        content: "Orçamentos, visualização conceitual de ambientes e propostas comerciais para a construção civil.",
      },
    ],
  }),
  component: Dashboard,
});

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof FileText;
}) {
  return (
    <div className="surface-card relative overflow-hidden p-5">
      <span className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4.5" />
        </span>
      </div>
      <p className="mt-4 font-display text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Shortcut({ to, label, icon: Icon }: { to: string; label: string; icon: typeof History }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3.5 text-sm font-medium text-foreground transition hover:bg-muted/60"
    >
      <span className="flex items-center gap-2.5">
        <Icon className="size-4 text-muted-foreground" />
        {label}
      </span>
      <ArrowRight className="size-4 text-primary" />
    </Link>
  );
}

function Dashboard() {
  const { state } = useStore();
  const projects = state.projects;

  const totals = projects.map((p) => ({ p, t: computeTotals(p.budget) }));
  const active = projects.filter((p) => ["em_negociacao", "aprovado", "em_execucao", "orcamento_enviado"].includes(p.status));
  const approved = totals.filter(({ p }) => p.status === "aprovado" || p.status === "em_execucao" || p.status === "concluido");
  const negotiating = totals.filter(({ p }) => p.status === "em_negociacao" || p.status === "orcamento_enviado");
  const receivable = approved.reduce((s, x) => s + x.t.final, 0);
  const recent = totals.slice(0, 5);

  return (
    <AppShell>
      <Onboarding />

      <p className="text-sm text-muted-foreground">Bem-vindo de volta 👋</p>
      <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground uppercase sm:text-4xl">
        Meus projetos
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Em aberto"
          value={String(active.length)}
          hint={active.length === 0 ? "— nenhum ainda" : `${projects.length} projetos no total`}
          icon={FileText}
        />
        <StatCard
          label="Aprovados"
          value={String(approved.length)}
          hint={approved.length === 0 ? "— nenhum ainda" : `${approved.length} propostas aprovadas`}
          icon={CheckCircle2}
        />
        <StatCard
          label="A receber"
          value={brl(receivable)}
          hint={`${approved.length} projetos aprovados`}
          icon={Wallet}
        />
        <StatCard
          label="Em negociação"
          value={brl(negotiating.reduce((s, x) => s + x.t.final, 0))}
          hint={`${negotiating.length} propostas em aberto`}
          icon={TrendingUp}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="flex flex-col gap-4">
          <Link
            to="/projetos/novo"
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-display text-sm font-bold tracking-wide text-primary-foreground uppercase transition hover:brightness-110"
          >
            <Plus className="size-5" /> Novo orçamento
          </Link>

          <div className="surface-card p-4">
            <p className="px-1 pb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Atalhos
            </p>
            <div className="flex flex-col gap-2">
              <Shortcut to="/orcamentos" label="Ver histórico" icon={History} />
              <Shortcut to="/configuracoes" label="Configurações do perfil" icon={Settings} />
            </div>
          </div>
        </div>

        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-foreground uppercase">
            Últimos orçamentos
          </h2>

          {recent.length === 0 ? (
            <div className="surface-card flex flex-col items-center justify-center px-6 py-16 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FileText className="size-6" />
              </span>
              <p className="mt-5 font-display text-base font-bold text-foreground">
                Nenhum orçamento criado ainda
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Clique em "+ Novo orçamento" para criar o seu primeiro
              </p>
              <Link
                to="/projetos/novo"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
              >
                <Plus className="size-4" /> Criar primeiro orçamento
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recent.map(({ p, t }) => (
                <Link
                  key={p.id}
                  to="/projetos/$id"
                  params={{ id: p.id }}
                  className="surface-card flex flex-col gap-3 p-4 transition hover:shadow-[var(--shadow-lift)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-display text-base font-bold text-foreground">{p.name}</h3>
                      {p.demo && <DemoTag />}
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Handshake className="size-3.5" /> {PROJECT_TYPE_LABEL[p.type]}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" /> {p.address || "Endereço não informado"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Ruler className="size-3.5" /> {p.area} m² · {p.rooms.length} ambientes
                      </span>
                    </p>
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <p className="font-display text-base font-bold text-foreground">{brl(t.final)}</p>
                    <p className="text-xs text-muted-foreground">{dateBR(p.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
