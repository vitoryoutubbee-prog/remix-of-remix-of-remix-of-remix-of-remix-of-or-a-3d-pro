import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DemoTag } from "@/components/StatusBadge";
import {
  EmptyState,
  Field,
  ScreenHeader,
  SearchField,
  StatTile,
  fieldClass,
} from "@/components/ui-kit";
import { dateBR } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/clientes/")({
  head: () => ({
    meta: [
      { title: "Clientes — ORÇA 3D Construtor Pro" },
      {
        name: "description",
        content: "Cadastro de clientes com contato, endereço e projetos vinculados.",
      },
      { property: "og:title", content: "Clientes — ORÇA 3D Construtor Pro" },
      {
        property: "og:description",
        content: "Organize os contatos dos seus clientes e suas obras.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientsPage,
});

const emptyForm = { name: "", phone: "", email: "", address: "" };

function ClientsPage() {
  const { state, addClient, removeClient } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const term = q.trim().toLowerCase();
  const list = state.clients.filter(
    (c) => !term || `${c.name} ${c.phone} ${c.email} ${c.address}`.toLowerCase().includes(term),
  );

  const withProjects = state.clients.filter((c) =>
    state.projects.some((p) => p.clientId === c.id),
  ).length;

  return (
    <AppShell>
      <ScreenHeader
        title="Clientes"
        subtitle="Contatos, endereços e obras vinculadas."
        actions={
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:brightness-110"
          >
            <Plus className="size-4" />
            {open ? "Fechar" : "Novo cliente"}
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-3 gap-3">
        <StatTile label="Clientes" value={String(state.clients.length)} />
        <StatTile label="Com obra" value={String(withProjects)} />
        <StatTile label="Sem obra" value={String(state.clients.length - withProjects)} />
      </div>

      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return;
            addClient(form);
            setForm(emptyForm);
            setOpen(false);
          }}
          className="surface-card mb-5 grid gap-3 p-5 sm:grid-cols-2"
        >
          {(
            [
              ["name", "Nome"],
              ["phone", "Telefone"],
              ["email", "E-mail"],
              ["address", "Endereço"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                className={fieldClass}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </Field>
          ))}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:brightness-110"
            >
              Salvar cliente
            </button>
          </div>
        </form>
      )}

      <SearchField value={q} onChange={setQ} placeholder="Buscar cliente, telefone ou cidade..." />

      {list.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum cliente encontrado"
          description="Cadastre um cliente para vincular orçamentos e projetos a ele."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((c) => (
            <li key={c.id} className="surface-card px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to="/clientes/$id"
                      params={{ id: c.id }}
                      className="font-display text-base font-bold text-foreground hover:text-primary"
                    >
                      {c.name}
                    </Link>
                    {c.demo && <DemoTag />}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {state.projects.filter((p) => p.clientId === c.id).length} projeto(s) · desde{" "}
                    {dateBR(c.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Remover ${c.name}`}
                  onClick={() => removeClient(c.id)}
                  className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Phone className="size-3.5 shrink-0" />
                  {c.phone || "Sem telefone"}
                </p>
                <p className="flex items-center gap-2 truncate">
                  <Mail className="size-3.5 shrink-0" />
                  {c.email || "Sem e-mail"}
                </p>
                <p className="flex items-center gap-2 truncate">
                  <MapPin className="size-3.5 shrink-0" />
                  {c.address || "Sem endereço"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
