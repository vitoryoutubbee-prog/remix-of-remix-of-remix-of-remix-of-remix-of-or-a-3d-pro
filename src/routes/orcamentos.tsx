import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Plus, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import {
  EmptyState,
  FilterChips,
  ScreenHeader,
  SearchField,
  StatTile,
  type FilterChip,
} from "@/components/ui-kit";
import { computeTotals } from "@/lib/budget";
import { brl, dateBR } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { ProjectStatus } from "@/lib/types";

export const Route = createFileRoute("/orcamentos")({
  head: () => ({
    meta: [
      { title: "Orçamentos — ORÇA 3D Construtor Pro" },
      {
        name: "description",
        content: "Crie, filtre e acompanhe orçamentos de obra com custo, margem e valor final.",
      },
      { property: "og:title", content: "Orçamentos — ORÇA 3D Construtor Pro" },
      {
        property: "og:description",
        content: "Gestão completa dos seus orçamentos de construção e reforma.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BudgetsPage,
});

type FilterId = "todos" | "abertos" | "aprovados" | "concluidos";

const groups: Record<Exclude<FilterId, "todos">, ProjectStatus[]> = {
  abertos: ["rascunho", "orcamento_enviado", "em_negociacao"],
  aprovados: ["aprovado", "em_execucao"],
  concluidos: ["concluido"],
};

function NewBudgetButton({ block }: { block?: boolean }) {
  return (
    <Link
      to="/projetos/novo"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:brightness-110 ${
        block ? "w-full sm:w-auto" : ""
      }`}
    >
      <Plus className="size-4" />
      Novo orçamento
    </Link>
  );
}

function BudgetsPage() {
  const { state } = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterId>("todos");

  const rows = useMemo(
    () =>
      state.projects.map((p) => ({
        p,
        t: computeTotals(p.budget),
        client: state.clients.find((c) => c.id === p.clientId)?.name ?? "Cliente não informado",
      })),
    [state.projects, state.clients],
  );

  const chips: FilterChip[] = [
    { id: "todos", label: "Todos", count: rows.length },
    {
      id: "abertos",
      label: "Em aberto",
      count: rows.filter((r) => groups.abertos.includes(r.p.status)).length,
    },
    {
      id: "aprovados",
      label: "Aprovados",
      count: rows.filter((r) => groups.aprovados.includes(r.p.status)).length,
    },
    {
      id: "concluidos",
      label: "Concluídos",
      count: rows.filter((r) => groups.concluidos.includes(r.p.status)).length,
    },
  ];

  const term = q.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    const byStatus = filter === "todos" || groups[filter].includes(r.p.status);
    const byTerm =
      !term ||
      [r.p.name, r.client, r.p.address].some((v) => v.toLowerCase().includes(term));
    return byStatus && byTerm;
  });

  const total = filtered.reduce((s, r) => s + r.t.final, 0);
  const approved = rows
    .filter((r) => groups.aprovados.includes(r.p.status))
    .reduce((s, r) => s + r.t.final, 0);

  return (
    <AppShell>
      <ScreenHeader
        title="Orçamentos"
        subtitle="Gerencie propostas, custos e margens das suas obras."
        actions={<NewBudgetButton />}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Orçamentos" value={String(rows.length)} />
        <StatTile label="Em aberto" value={String(chips[1]?.count ?? 0)} />
        <StatTile label="Aprovado" value={brl(approved)} />
        <StatTile label="Filtro atual" value={brl(total)} />
      </div>

      <SearchField
        value={q}
        onChange={setQ}
        placeholder="Buscar por cliente, obra ou endereço..."
      />
      <FilterChips chips={chips} active={filter} onSelect={(id) => setFilter(id as FilterId)} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum orçamento encontrado"
          description={
            rows.length === 0
              ? "Crie seu primeiro orçamento agora e monte custos de material, mão de obra e margem."
              : "Ajuste a busca ou troque o filtro para ver outros orçamentos."
          }
          action={<NewBudgetButton block />}
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map(({ p, t, client }) => (
            <li key={p.id}>
              <Link
                to="/projetos/$id"
                params={{ id: p.id }}
                className="surface-card block px-5 py-4 transition hover:border-primary/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-bold text-foreground">
                      {p.name}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">{client}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {p.address || "Endereço não informado"} · {dateBR(p.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={p.status} />
                    <p className="mt-2 font-display text-lg font-bold text-foreground">
                      {brl(t.final)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
                  <span className="text-muted-foreground">
                    Custo
                    <strong className="block text-sm font-bold text-foreground">
                      {brl(t.cost)}
                    </strong>
                  </span>
                  <span className="text-muted-foreground">
                    Margem
                    <strong className="block text-sm font-bold text-foreground">
                      {brl(t.margin)}
                    </strong>
                  </span>
                  <span className="flex items-center justify-end gap-1 text-muted-foreground">
                    <TrendingUp className="size-3.5" />
                    {p.budget.marginPct}%
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
