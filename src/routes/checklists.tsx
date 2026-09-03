import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck, ListChecks, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  EmptyState,
  Field,
  ScreenHeader,
  SearchField,
  StatTile,
  fieldClass,
} from "@/components/ui-kit";
import { uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Checklist } from "@/lib/types";

export const Route = createFileRoute("/checklists")({
  head: () => ({
    meta: [
      { title: "Checklists de obra — ORÇA 3D Construtor Pro" },
      {
        name: "description",
        content: "Listas de verificação para visita técnica, execução e entrega da obra.",
      },
      { property: "og:title", content: "Checklists de obra — ORÇA 3D Construtor Pro" },
      {
        property: "og:description",
        content: "Padronize etapas e não esqueça nenhum item em campo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChecklistsPage,
});

function progress(c: Checklist) {
  if (c.items.length === 0) return 0;
  return Math.round((c.items.filter((i) => i.done).length / c.items.length) * 100);
}

function ChecklistCard({ list }: { list: Checklist }) {
  const { updateChecklist, removeChecklist } = useStore();
  const [text, setText] = useState("");
  const pct = progress(list);

  return (
    <section className="surface-card overflow-hidden">
      <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.14em] text-primary uppercase">
            {list.stage}
          </p>
          <h2 className="font-display text-base font-bold">{list.title}</h2>
          <p className="text-xs text-muted-foreground">
            {list.items.filter((i) => i.done).length}/{list.items.length} concluídos
          </p>
        </div>
        <button
          type="button"
          aria-label={`Remover ${list.title}`}
          onClick={() => removeChecklist(list.id)}
          className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </header>

      <div className="h-1.5 w-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>

      <ul className="divide-y divide-border">
        {list.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 px-5 py-3">
            <button
              type="button"
              aria-pressed={item.done}
              aria-label={item.text}
              onClick={() =>
                updateChecklist(list.id, {
                  items: list.items.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i)),
                })
              }
              className={`flex size-6 shrink-0 items-center justify-center rounded-md border transition ${
                item.done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card"
              }`}
            >
              {item.done && <ClipboardCheck className="size-3.5" />}
            </button>
            <span
              className={`flex-1 text-sm ${
                item.done ? "text-muted-foreground line-through" : "text-foreground"
              }`}
            >
              {item.text}
            </span>
            <button
              type="button"
              aria-label={`Excluir item ${item.text}`}
              onClick={() =>
                updateChecklist(list.id, { items: list.items.filter((i) => i.id !== item.id) })
              }
              className="rounded-md p-1.5 text-muted-foreground transition hover:text-destructive"
            >
              <X className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          updateChecklist(list.id, {
            items: [...list.items, { id: uid(), text: text.trim(), done: false }],
          });
          setText("");
        }}
        className="flex gap-2 border-t border-border px-5 py-3"
      >
        <input
          className={fieldClass}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Adicionar item..."
          aria-label={`Adicionar item em ${list.title}`}
        />
        <button
          type="submit"
          className="rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:brightness-110"
        >
          <Plus className="size-4" />
        </button>
      </form>
    </section>
  );
}

function ChecklistsPage() {
  const { state, addChecklist } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", stage: "Execução" });

  const term = q.trim().toLowerCase();
  const lists = state.checklists.filter(
    (c) =>
      !term ||
      `${c.title} ${c.stage}`.toLowerCase().includes(term) ||
      c.items.some((i) => i.text.toLowerCase().includes(term)),
  );

  const totalItems = state.checklists.reduce((s, c) => s + c.items.length, 0);
  const doneItems = state.checklists.reduce(
    (s, c) => s + c.items.filter((i) => i.done).length,
    0,
  );

  return (
    <AppShell>
      <ScreenHeader
        title="Checklists"
        subtitle="Padronize visita técnica, execução e entrega da obra."
        actions={
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:brightness-110"
          >
            <Plus className="size-4" />
            {open ? "Fechar" : "Novo checklist"}
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-3 gap-3">
        <StatTile label="Listas" value={String(state.checklists.length)} />
        <StatTile label="Itens" value={String(totalItems)} />
        <StatTile
          label="Concluídos"
          value={`${totalItems ? Math.round((doneItems / totalItems) * 100) : 0}%`}
        />
      </div>

      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.title.trim()) return;
            addChecklist(form.title.trim(), form.stage.trim() || "Geral");
            setForm({ title: "", stage: "Execução" });
            setOpen(false);
          }}
          className="surface-card mb-5 grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto]"
        >
          <Field label="Título">
            <input
              className={fieldClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Vistoria de acabamento"
            />
          </Field>
          <Field label="Etapa">
            <input
              className={fieldClass}
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value })}
              placeholder="Pré-obra, Execução, Pós-obra"
            />
          </Field>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:brightness-110"
            >
              Criar
            </button>
          </div>
        </form>
      )}

      <SearchField value={q} onChange={setQ} placeholder="Buscar checklist ou item..." />

      {lists.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Nenhum checklist encontrado"
          description="Crie listas de verificação para não esquecer nada em campo."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {lists.map((c) => (
            <ChecklistCard key={c.id} list={c} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
