import { createFileRoute } from "@tanstack/react-router";
import { Boxes, Package, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  EmptyState,
  Field,
  FilterChips,
  ScreenHeader,
  SearchField,
  StatTile,
  fieldClass,
  type FilterChip,
} from "@/components/ui-kit";
import { brl } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/materiais")({
  head: () => ({
    meta: [
      { title: "Banco de materiais — ORÇA 3D Construtor Pro" },
      {
        name: "description",
        content: "Cadastro de materiais com unidade, preço e fornecedor para orçar mais rápido.",
      },
      { property: "og:title", content: "Banco de materiais — ORÇA 3D Construtor Pro" },
      {
        property: "og:description",
        content: "Sua tabela de preços de materiais sempre à mão na hora de orçar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MaterialsPage,
});

const emptyForm = { name: "", category: "", unit: "un", price: "", supplier: "" };

function MaterialsPage() {
  const { state, addMaterial, removeMaterial } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("todos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const categories = useMemo(
    () => Array.from(new Set(state.materialsCatalog.map((m) => m.category).filter(Boolean))).sort(),
    [state.materialsCatalog],
  );

  const chips: FilterChip[] = [
    { id: "todos", label: "Todos", count: state.materialsCatalog.length },
    ...categories.map((c) => ({
      id: c,
      label: c,
      count: state.materialsCatalog.filter((m) => m.category === c).length,
    })),
  ];

  const term = q.trim().toLowerCase();
  const list = state.materialsCatalog.filter(
    (m) =>
      (cat === "todos" || m.category === cat) &&
      (!term || `${m.name} ${m.supplier} ${m.category}`.toLowerCase().includes(term)),
  );

  const avg = list.length ? list.reduce((s, m) => s + m.price, 0) / list.length : 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addMaterial({
      name: form.name.trim(),
      category: form.category.trim() || "Geral",
      unit: form.unit.trim() || "un",
      price: Number(form.price.replace(",", ".")) || 0,
      supplier: form.supplier.trim(),
    });
    setForm(emptyForm);
    setOpen(false);
  };

  return (
    <AppShell>
      <ScreenHeader
        title="Banco de materiais"
        subtitle="Tabela de preços reutilizável nos seus orçamentos."
        actions={
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:brightness-110"
          >
            <Plus className="size-4" />
            {open ? "Fechar" : "Novo material"}
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-3 gap-3">
        <StatTile label="Itens" value={String(state.materialsCatalog.length)} />
        <StatTile label="Categorias" value={String(categories.length)} />
        <StatTile label="Preço médio" value={brl(avg)} />
      </div>

      {open && (
        <form onSubmit={submit} className="surface-card mb-5 grid gap-3 p-5 sm:grid-cols-2">
          <Field label="Material">
            <input
              className={fieldClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Cimento CP-II 50kg"
            />
          </Field>
          <Field label="Categoria">
            <input
              className={fieldClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Ex: Estrutura"
              list="categorias-materiais"
            />
          </Field>
          <datalist id="categorias-materiais">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <Field label="Unidade">
            <input
              className={fieldClass}
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="un, m², sc, m³"
            />
          </Field>
          <Field label="Preço unitário (R$)">
            <input
              className={fieldClass}
              inputMode="decimal"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0,00"
            />
          </Field>
          <Field label="Fornecedor">
            <input
              className={fieldClass}
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              placeholder="Opcional"
            />
          </Field>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:brightness-110"
            >
              Salvar material
            </button>
          </div>
        </form>
      )}

      <SearchField value={q} onChange={setQ} placeholder="Buscar material ou fornecedor..." />
      <FilterChips chips={chips} active={cat} onSelect={setCat} />

      {list.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="Nenhum material encontrado"
          description="Cadastre materiais com preço e unidade para montar orçamentos em segundos."
        />
      ) : (
        <ul className="space-y-2">
          {list.map((m) => (
            <li
              key={m.id}
              className="surface-card flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                  <Package className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{m.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {m.category} · {m.unit}
                    {m.supplier ? ` · ${m.supplier}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold whitespace-nowrap">
                  {brl(m.price)}
                </span>
                <button
                  type="button"
                  aria-label={`Remover ${m.name}`}
                  onClick={() => removeMaterial(m.id)}
                  className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
