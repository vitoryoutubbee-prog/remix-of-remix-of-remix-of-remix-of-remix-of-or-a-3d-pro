import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { computeTotals } from "@/lib/budget";
import { brl, dateBR } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/clientes/$id")({
  head: () => ({
    meta: [
      { title: "Cliente — ORÇA 3D Construtor Pro" },
      { name: "description", content: "Ficha do cliente com contato, obras vinculadas e valores em negociação." },
      { property: "og:title", content: "Cliente — ORÇA 3D Construtor Pro" },
      { property: "og:description", content: "Contato, obras e valores de cada cliente da sua construtora." },
    ],
  }),
  component: ClientDetail,
});

function ClientDetail() {
  const { id } = Route.useParams();
  const { state, updateClient } = useStore();
  const client = state.clients.find((c) => c.id === id);
  const projects = state.projects.filter((p) => p.clientId === id);

  if (!client) {
    return (
      <AppShell>
        <PageHeader title="Cliente não encontrado" />
        <Link to="/clientes" className="text-sm font-semibold text-primary hover:underline">
          Voltar para clientes
        </Link>
      </AppShell>
    );
  }

  const total = projects.reduce((s, p) => s + computeTotals(p.budget).final, 0);
  const field = "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <AppShell>
      <Link
        to="/clientes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Clientes
      </Link>
      <PageHeader
        title={client.name}
        subtitle={`${projects.length} projeto(s) · ${brl(total)} em valor estimado · desde ${dateBR(client.createdAt)}`}
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="surface-card h-fit space-y-3 p-5">
          <h2 className="font-display text-base font-bold">Dados de contato</h2>
          {(
            [
              ["name", "Nome"],
              ["phone", "Telefone"],
              ["email", "E-mail"],
              ["address", "Endereço"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm font-medium">
              {label}
              <input
                className={`mt-1.5 ${field}`}
                value={client[key] ?? ""}
                onChange={(e) => updateClient(client.id, { [key]: e.target.value })}
              />
            </label>
          ))}
          <label className="block text-sm font-medium">
            Observações
            <textarea
              rows={3}
              className={`mt-1.5 ${field}`}
              value={client.notes ?? ""}
              onChange={(e) => updateClient(client.id, { notes: e.target.value })}
            />
          </label>
        </div>

        <div className="surface-card divide-y divide-border">
          {projects.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground">Nenhum projeto para este cliente.</p>
          )}
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 p-5">
              <div>
                <Link
                  to="/projetos/$id"
                  params={{ id: p.id }}
                  className="font-display text-base font-bold text-primary hover:underline"
                >
                  {p.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {p.area} m² · {brl(computeTotals(p.budget).final)}
                </p>
              </div>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
