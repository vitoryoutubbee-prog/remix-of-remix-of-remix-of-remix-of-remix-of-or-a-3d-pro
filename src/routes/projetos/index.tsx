import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Plus } from "lucide-react";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { DemoTag, StatusBadge } from "@/components/StatusBadge";
import { computeTotals } from "@/lib/budget";
import { brl, dateBR } from "@/lib/format";
import { useStore } from "@/lib/store";
import { PROJECT_TYPE_LABEL } from "@/lib/types";

export const Route = createFileRoute("/projetos/")({
  head: () => ({
    meta: [
      { title: "Projetos — ORÇA 3D Construtor Pro" },
      { name: "description", content: "Lista de obras e reformas com status, valores e prazos." },
      { property: "og:title", content: "Projetos — ORÇA 3D Construtor Pro" },
      { property: "og:description", content: "Acompanhe todas as suas obras e reformas em um só painel." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { state } = useStore();
  const [q, setQ] = useState("");

  const list = state.projects.filter((p) =>
    `${p.name} ${p.address}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell>
      <PageHeader
        title="Projetos"
        subtitle="Todas as suas obras, reformas e propostas."
        action={
          <Link
            to="/projetos/novo"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            <Plus className="size-4" /> Novo projeto
          </Link>
        }
      />

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nome ou endereço"
        className="mb-6 w-full max-w-md rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
      />

      {list.length === 0 ? (
        <p className="surface-card p-8 text-center text-sm text-muted-foreground">
          Nenhum projeto encontrado.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => {
            const t = computeTotals(p.budget);
            return (
              <article key={p.id} className="surface-card flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-base font-bold">{p.name}</h2>
                      {p.demo && <DemoTag />}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {state.clients.find((c) => c.id === p.clientId)?.name ?? "Cliente"}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {PROJECT_TYPE_LABEL[p.type]} · {p.area} m² · {p.rooms.length} ambientes
                </p>
                <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
                  <div>
                    <p className="font-display text-lg font-bold">{brl(t.final)}</p>
                    <p className="text-xs text-muted-foreground">Criado em {dateBR(p.createdAt)}</p>
                  </div>
                  <Link
                    to="/projetos/$id"
                    params={{ id: p.id }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
                  >
                    Abrir <ArrowRight className="size-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
