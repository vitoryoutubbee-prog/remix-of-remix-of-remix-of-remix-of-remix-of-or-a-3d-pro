import {
  Expand,
  Maximize2,
  Minus,
  Palette,
  Plus,
  RotateCw,
  Sofa,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PlanEditor2D } from "@/components/PlanEditor2D";
import { RoomViewer3D } from "@/components/RoomViewer3D";
import { parseDimensions } from "@/components/Room3D.helpers";
import { rectPlan } from "@/lib/plan";
import { CATALOG_BY_KIND, CATEGORIES, SCENE_CATALOG, createSceneItem } from "@/lib/scene-catalog";
import type { SceneItem, SceneItemKind, Visualization } from "@/lib/types";

const FLOORS = [
  "Porcelanato acetinado 80x80",
  "Porcelanato grande formato 120x120",
  "Piso amadeirado",
  "Cimento queimado",
  "Deck de madeira",
  "Piso cerâmico",
];

const LIGHTS = ["Luz quente embutida", "Luz neutra", "Luz fria", "Iluminação cênica externa", "Luz natural"];

const CLADDINGS = ["Painel ripado amadeirado", "Tijolinho aparente", "Painel liso pintado"];

const SWATCHES = ["#e8e3da", "#f3f1ec", "#d9dfd6", "#dfe4ea", "#e9ded4", "#c9cfd6", "#b8bfae", "#2f3439"];

const ITEM_COLORS = [
  "#4c5663",
  "#7c6a52",
  "#6b4a2c",
  "#2f3a3f",
  "#c8b18a",
  "#d9d2c6",
  "#4c7d50",
  "#1c1f24",
  "#a8523f",
  "#3fa9c9",
];

const selectCls =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary";

export function RoomEditor3D({
  v,
  roomName,
  dimensions,
  onChange,
}: {
  v: Visualization;
  roomName: string;
  dimensions: string;
  onChange: (patch: Partial<Visualization>) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [presenting, setPresenting] = useState(false);
  const [tab, setTab] = useState<"3d" | "planta">("3d");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Mobiliário");

  const items = useMemo(() => v.items ?? [], [v.items]);
  const [w, d] = parseDimensions(dimensions);
  const plan = useMemo(() => v.plan ?? rectPlan(w, d), [v.plan, w, d]);
  const selected = items.find((i) => i.id === selectedId) ?? null;

  const setItems = (next: SceneItem[]) => onChange({ items: next });

  const addItem = (kind: SceneItemKind) => {
    const item = createSceneItem(kind, items, w, d);
    setItems([...items, item]);
    setSelectedId(item.id);
    toast.success(`${CATALOG_BY_KIND[kind].label} adicionado`);
  };

  const patchItem = (id: string, patch: Partial<SceneItem>) =>
    setItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateItem = (item: SceneItem) => {
    const copy: SceneItem = {
      ...item,
      id: `it_${Math.random().toString(36).slice(2, 10)}`,
      x: Math.max(-w / 2 + 0.3, Math.min(w / 2 - 0.3, item.x + 0.6)),
      z: Math.max(-d / 2 + 0.3, Math.min(d / 2 - 0.3, item.z + 0.4)),
    };
    setItems([...items, copy]);
    setSelectedId(copy.id);
  };

  const viewer = (fullscreen: boolean) => (
    <RoomViewer3D
      v={v}
      roomName={roomName}
      dimensions={dimensions}
      editable={!fullscreen}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onMove={(id, x, z) => patchItem(id, { x, z })}
      className={fullscreen ? "h-full rounded-none border-0" : "aspect-16/10"}
      {...(fullscreen ? { hint: "Modo apresentação · arraste para girar · scroll para zoom" } : {})}
    />
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 rounded-xl border border-border bg-card/60 p-1">
        {(["3d", "planta"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold tracking-wide uppercase transition ${
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {t === "3d" ? "3D" : "Planta"}
          </button>
        ))}
      </div>

      {tab === "planta" ? (
        <PlanEditor2D plan={plan} onChange={(p) => onChange({ plan: p })} />
      ) : (
        <>
      <div className="relative">

        {viewer(false)}
        <div className="absolute top-2 right-2 flex gap-1.5">
          <button
            onClick={() => setPresenting(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground/80 px-2.5 py-1.5 text-xs font-semibold text-background backdrop-blur hover:bg-foreground"
          >
            <Maximize2 className="size-3.5" /> Apresentar
          </button>
        </div>
      </div>

      {/* catálogo */}
      <div className="rounded-xl border border-border bg-card/60 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase">
            <Sofa className="size-3.5 text-primary" /> Adicionar ao ambiente
          </span>
          <span className="text-[11px] text-muted-foreground">
            {items.length} {items.length === 1 ? "objeto" : "objetos"}
          </span>
        </div>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                category === c ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SCENE_CATALOG.filter((e) => e.category === category).map((e) => (
            <button
              key={e.kind}
              onClick={() => addItem(e.kind)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:border-primary hover:bg-primary/10"
            >
              <Plus className="size-3" /> {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* lista de objetos */}
      {items.length > 0 && (
        <div className="rounded-xl border border-border bg-card/60 p-3">
          <p className="mb-2 text-xs font-bold tracking-wide uppercase">Objetos na cena</p>
          <ul className="flex flex-wrap gap-1.5">
            {items.map((item) => (
              <li key={item.id}>
                <div
                  className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition ${
                    selectedId === item.id ? "border-primary bg-primary/10" : "border-border"
                  }`}
                >
                  <button onClick={() => setSelectedId(item.id)} className="flex items-center gap-1.5 font-medium">
                    <span
                      className="size-3 rounded-full border border-black/10"
                      style={{ backgroundColor: item.color }}
                    />
                    {CATALOG_BY_KIND[item.kind].label}
                  </button>
                  <button
                    aria-label={`Remover ${CATALOG_BY_KIND[item.kind].label}`}
                    onClick={() => removeItem(item.id)}
                    className="rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* edição do objeto selecionado */}
      {selected && (
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold tracking-wide uppercase">
              {CATALOG_BY_KIND[selected.kind].label} selecionado
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => duplicateItem(selected)}
                className="rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-muted"
              >
                Duplicar
              </button>
              <button
                onClick={() => removeItem(selected.id)}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" /> Remover
              </button>
            </div>
          </div>

          <p className="mb-2 text-[11px] text-muted-foreground">
            Arraste o objeto direto na cena 3D para reposicionar.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold">
              <span className="inline-flex items-center gap-1">
                <RotateCw className="size-3.5" /> Rotação
              </span>
              <input
                type="range"
                min={0}
                max={360}
                step={5}
                value={Math.round((selected.rot * 180) / Math.PI)}
                onChange={(e) => patchItem(selected.id, { rot: (Number(e.target.value) * Math.PI) / 180 })}
                className="mt-1.5 w-full accent-primary"
              />
            </label>
            <label className="text-xs font-semibold">
              <span className="inline-flex items-center gap-1">
                <Expand className="size-3.5" /> Tamanho
              </span>
              <input
                type="range"
                min={0.5}
                max={1.8}
                step={0.05}
                value={selected.scale}
                onChange={(e) => patchItem(selected.id, { scale: Number(e.target.value) })}
                className="mt-1.5 w-full accent-primary"
              />
            </label>
          </div>

          <div className="mt-3">
            <span className="inline-flex items-center gap-1 text-xs font-semibold">
              <Palette className="size-3.5" /> Cor
            </span>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {ITEM_COLORS.map((color) => (
                <button
                  key={color}
                  aria-label={`Cor ${color}`}
                  onClick={() => patchItem(selected.id, { color })}
                  className={`size-6 rounded-full border-2 transition ${
                    selected.color.toLowerCase() === color ? "border-primary" : "border-border"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                aria-label="Cor personalizada"
                value={selected.color}
                onChange={(e) => patchItem(selected.id, { color: e.target.value })}
                className="size-6 cursor-pointer rounded border border-border bg-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* acabamentos do ambiente */}
      <details className="rounded-xl border border-border bg-card/60 p-3">
        <summary className="cursor-pointer text-xs font-bold tracking-wide uppercase">
          Acabamentos do ambiente
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold">
            Piso
            <select className={`mt-1.5 ${selectCls}`} value={v.floor} onChange={(e) => onChange({ floor: e.target.value })}>
              {FLOORS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold">
            Iluminação
            <select
              className={`mt-1.5 ${selectCls}`}
              value={v.lighting}
              onChange={(e) => onChange({ lighting: e.target.value })}
            >
              {LIGHTS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold">
            Revestimento da parede de fundo
            <select
              className={`mt-1.5 ${selectCls}`}
              value={v.cladding}
              onChange={(e) => onChange({ cladding: e.target.value })}
            >
              {CLADDINGS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <div className="text-xs font-semibold">
            Cor das paredes
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {SWATCHES.map((color) => (
                <button
                  key={color}
                  aria-label={`Parede ${color}`}
                  onClick={() => onChange({ wallColor: color })}
                  className={`size-6 rounded-full border-2 ${
                    v.wallColor.toLowerCase() === color ? "border-primary" : "border-border"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                aria-label="Cor personalizada das paredes"
                value={v.wallColor}
                onChange={(e) => onChange({ wallColor: e.target.value })}
                className="size-6 cursor-pointer rounded border border-border bg-transparent"
              />
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setItems([]);
            setSelectedId(null);
            toast.success("Cena limpa");
          }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
        >
          <Minus className="size-3.5" /> Limpar objetos da cena
        </button>
      </details>
        </>
      )}


      {/* modo apresentação */}
      {presenting && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/98 backdrop-blur">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <p className="font-display text-base font-bold">{roomName}</p>
              <p className="text-xs text-muted-foreground">
                {dimensions || `${w.toFixed(1)} x ${d.toFixed(1)} m`} · {items.length} objetos
              </p>
            </div>
            <button
              onClick={() => setPresenting(false)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted"
            >
              <X className="size-4" /> Fechar
            </button>
          </div>
          <div className="min-h-0 flex-1">{viewer(true)}</div>
        </div>
      )}
    </div>
  );
}
