import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { RoomEditor3D } from "@/components/RoomEditor3D";
import { StatusBadge } from "@/components/StatusBadge";
import { computeTotals } from "@/lib/budget";
import { brl, dateTimeBR, uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import {
  PROJECT_STATUS_LABEL,
  PROJECT_TYPE_LABEL,
  type ProjectStatus,
  type Room,
  type Visualization,
} from "@/lib/types";

export const Route = createFileRoute("/projetos/$id")({
  head: () => ({
    meta: [
      { title: "Detalhes do projeto — ORÇA 3D Construtor Pro" },
      { name: "description", content: "Ambientes, orçamento detalhado, versões e proposta comercial da obra." },
      { property: "og:title", content: "Detalhes do projeto — ORÇA 3D Construtor Pro" },
      { property: "og:description", content: "Ambientes, custos e proposta comercial em uma única tela." },
    ],
  }),
  component: ProjectDetail,
});

const field = "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary";
const tabs = ["Resumo", "Ambientes", "Orçamento", "Proposta", "Histórico"] as const;

function newVisualization(): Visualization {
  return {
    floor: "Porcelanato acetinado 80x80",
    wallColor: "#e8e3da",
    cladding: "Painel ripado amadeirado",
    door: "Pivotante em madeira",
    window: "Esquadria preta ampla",
    lighting: "Luz quente embutida",
    furniture: "Mobiliário contemporâneo",
    facade: "Concreto aparente + madeira",
    decor: "Plantas e quadros",
    renderStatus: "not_configured",
    items: [],
  };
}

function ProjectDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { state, updateProject, removeProject, logHistory } = useStore();
  const project = state.projects.find((p) => p.id === id);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Resumo");

  if (!project) {
    return (
      <AppShell>
        <PageHeader title="Projeto não encontrado" subtitle="Ele pode ter sido removido." />
        <Link to="/projetos" className="text-sm font-semibold text-primary hover:underline">
          Voltar para projetos
        </Link>
      </AppShell>
    );
  }

  const totals = computeTotals(project.budget);
  const client = state.clients.find((c) => c.id === project.clientId);

  const addRoom = () => {
    const room: Room = {
      id: uid(),
      name: "Novo ambiente",
      dimensions: "",
      description: "",
      materials: "",
      finishes: "",
      notes: "",
    };
    updateProject(project.id, { rooms: [...project.rooms, room] });
    logHistory(project.id, "Ambiente adicionado", room.name);
  };

  const patchRoom = (roomId: string, patch: Partial<Room>) =>
    updateProject(project.id, {
      rooms: project.rooms.map((r) => (r.id === roomId ? { ...r, ...patch } : r)),
    });

  return (
    <AppShell>
      <Link
        to="/projetos"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Projetos
      </Link>

      <PageHeader
        title={project.name}
        subtitle={`${client?.name ?? "Cliente"} · ${PROJECT_TYPE_LABEL[project.type]} · ${project.area} m²`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={project.status}
              onChange={(e) => {
                const status = e.target.value as ProjectStatus;
                updateProject(project.id, { status });
                logHistory(project.id, "Status alterado", PROJECT_STATUS_LABEL[status]);
              }}
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
            >
              {Object.entries(PROJECT_STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (confirm("Excluir este projeto?")) {
                  removeProject(project.id);
                  void navigate({ to: "/projetos" });
                }
              }}
              className="rounded-lg border border-border px-3 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10"
            >
              Excluir
            </button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === t ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Resumo" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="surface-card p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold">Informações da obra</h2>
              <StatusBadge status={project.status} />
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Endereço</dt>
                <dd>{project.address || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Contato</dt>
                <dd>{[project.phone, project.email].filter(Boolean).join(" · ") || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Ambientes</dt>
                <dd>{project.rooms.length}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Área</dt>
                <dd>{project.area} m²</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Observações</dt>
                <dd>{project.notes || "—"}</dd>
              </div>
            </dl>
          </div>
          <div className="surface-card p-5">
            <h2 className="font-display text-base font-bold">Valores</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Custo</span> <span>{brl(totals.cost)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Margem</span> <span>{brl(totals.margin)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Desconto</span> <span>-{brl(totals.discount)}</span>
              </li>
              <li className="flex justify-between border-t border-border pt-2 font-display text-lg font-bold">
                <span>Final</span> <span>{brl(totals.final)}</span>
              </li>
            </ul>
            <div className="mt-5 space-y-2">
              {project.versions.map((v) => (
                <div key={v.tier} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-semibold">{v.title}</p>
                  <p className="text-xs text-muted-foreground">{v.description}</p>
                  <p className="mt-1 font-display text-base font-bold">{brl(totals.final * v.multiplier)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "Ambientes" && (
        <div className="space-y-4">
          <button
            onClick={addRoom}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            <Plus className="size-4" /> Adicionar ambiente
          </button>

          {project.rooms.length === 0 && (
            <p className="surface-card p-8 text-center text-sm text-muted-foreground">
              Nenhum ambiente cadastrado ainda.
            </p>
          )}

          {project.rooms.map((room) => (
            <article key={room.id} className="surface-card grid gap-5 p-5 lg:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <input
                    className={field}
                    value={room.name}
                    onChange={(e) => patchRoom(room.id, { name: e.target.value })}
                  />
                  <button
                    aria-label={`Remover ${room.name}`}
                    onClick={() =>
                      updateProject(project.id, { rooms: project.rooms.filter((r) => r.id !== room.id) })
                    }
                    className="rounded-lg p-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <input
                  className={field}
                  placeholder="Dimensões (ex.: 4,20 x 3,10 m)"
                  value={room.dimensions}
                  onChange={(e) => patchRoom(room.id, { dimensions: e.target.value })}
                />
                <textarea
                  rows={2}
                  className={field}
                  placeholder="Descrição"
                  value={room.description}
                  onChange={(e) => patchRoom(room.id, { description: e.target.value })}
                />
                <input
                  className={field}
                  placeholder="Materiais"
                  value={room.materials}
                  onChange={(e) => patchRoom(room.id, { materials: e.target.value })}
                />
                <input
                  className={field}
                  placeholder="Acabamentos"
                  value={room.finishes}
                  onChange={(e) => patchRoom(room.id, { finishes: e.target.value })}
                />
              </div>
              {room.visualization ? (
                <RoomEditor3D
                  v={room.visualization}
                  roomName={room.name}
                  dimensions={room.dimensions}
                  onChange={(patch) =>
                    patchRoom(room.id, { visualization: { ...room.visualization!, ...patch } })
                  }
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Visualização 3D ainda não criada para este ambiente.
                  <button
                    onClick={() => {
                      patchRoom(room.id, { visualization: newVisualization() });
                      toast.success("Visualização 3D criada — monte o ambiente!");
                    }}
                    className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    Criar visualização 3D
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {tab === "Orçamento" && (
        <div className="space-y-4">
          {(
            [
              ["materials", "Materiais"],
              ["labor", "Mão de obra"],
              ["equipment", "Equipamentos"],
              ["others", "Outros custos"],
            ] as const
          ).map(([key, label]) => (
            <section key={key} className="surface-card overflow-x-auto p-5">
              <h2 className="font-display text-base font-bold">{label}</h2>
              <table className="mt-3 w-full min-w-[480px] text-sm">
                <tbody className="divide-y divide-border">
                  {project.budget[key].map((item) => {
                    const value =
                      key === "others"
                        ? (item as { value: number }).value
                        : (item as { qty: number; unitPrice: number }).qty *
                          (item as { qty: number; unitPrice: number }).unitPrice;
                    return (
                      <tr key={item.id}>
                        <td className="py-2">{item.name}</td>
                        <td className="py-2 text-right font-medium">{brl(value)}</td>
                      </tr>
                    );
                  })}
                  {project.budget[key].length === 0 && (
                    <tr>
                      <td className="py-2 text-muted-foreground">Nenhum item.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          ))}

          <section className="surface-card grid gap-4 p-5 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Margem (%)
              <input
                type="number"
                className={`mt-1.5 ${field}`}
                value={project.budget.marginPct}
                onChange={(e) =>
                  updateProject(project.id, {
                    budget: { ...project.budget, marginPct: Number(e.target.value) || 0 },
                  })
                }
              />
            </label>
            <label className="text-sm font-medium">
              Desconto (%)
              <input
                type="number"
                className={`mt-1.5 ${field}`}
                value={project.budget.discountPct}
                onChange={(e) =>
                  updateProject(project.id, {
                    budget: { ...project.budget, discountPct: Number(e.target.value) || 0 },
                  })
                }
              />
            </label>
            <p className="sm:col-span-2 font-display text-xl font-bold">
              Valor final: {brl(totals.final)}
            </p>
          </section>
        </div>
      )}

      {tab === "Proposta" && (
        <div className="surface-card grid max-w-3xl gap-4 p-6">
          {(
            [
              ["scope", "Escopo"],
              ["deadline", "Prazo"],
              ["payment", "Condições de pagamento"],
              ["validity", "Validade"],
              ["notes", "Observações"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="text-sm font-medium">
              {label}
              <textarea
                rows={key === "scope" || key === "notes" ? 3 : 2}
                className={`mt-1.5 ${field}`}
                value={project.proposal[key]}
                onChange={(e) =>
                  updateProject(project.id, { proposal: { ...project.proposal, [key]: e.target.value } })
                }
              />
            </label>
          ))}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                logHistory(project.id, "Proposta atualizada");
                toast.success("Proposta atualizada.");
              }}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            >
              Registrar atualização
            </button>
            <button
              onClick={() => window.print()}
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
            >
              Gerar PDF
            </button>
            <button
              onClick={async () => {
                const text = `${project.name} — ${brl(totals.final)}\n${project.proposal.scope}`;
                if (navigator.share) {
                  try {
                    await navigator.share({ title: project.name, text });
                    return;
                  } catch {
                    /* usuário cancelou */
                  }
                }
                await navigator.clipboard.writeText(text);
                toast.success("Resumo da proposta copiado.");
              }}
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
            >
              Compartilhar
            </button>
          </div>
          {/* placeholder para futura integração de PDF server-side */}
        </div>
      )}

      {tab === "Histórico" && (
        <ol className="surface-card divide-y divide-border">
          {[...project.history].reverse().map((h) => (
            <li key={h.id} className="p-4">
              <p className="text-sm font-semibold">{h.title}</p>
              {h.detail && <p className="text-sm text-muted-foreground">{h.detail}</p>}
              <p className="mt-0.5 text-xs text-muted-foreground">{dateTimeBR(h.at)}</p>
            </li>
          ))}
        </ol>
      )}
    </AppShell>
  );
}
