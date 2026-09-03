import { DoorOpen, Maximize, Plus, Ruler, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import {
  OPENING_DEFAULTS,
  clampOpening,
  m,
  planArea,
  planBounds,
  planPerimeter,
  rectPlan,
  snap,
  uidPlan,
  walls,
  wallArea,
} from "@/lib/plan";
import type { Opening, OpeningKind, RoomPlan } from "@/lib/types";

const PAD = 1.2; // metros de folga ao redor da planta

/**
 * Editor de planta baixa em SVG, pensado para o dedo: arraste os cantos,
 * toque numa parede para inserir porta/janela, medidas sempre visíveis.
 */
export function PlanEditor2D({
  plan,
  onChange,
}: {
  plan: RoomPlan;
  onChange: (plan: RoomPlan) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [selWall, setSelWall] = useState<number | null>(null);
  const [selOpening, setSelOpening] = useState<string | null>(null);

  const segs = walls(plan);
  const b = planBounds(plan);
  const view = {
    x: b.minX - PAD,
    y: b.minZ - PAD,
    w: b.w + PAD * 2,
    h: b.d + PAD * 2,
  };
  const unit = Math.max(view.w, view.h) / 100; // 1 px de traço ≈ escala da planta

  const toPlan = (e: React.PointerEvent) => {
    const svg = svgRef.current!;
    const r = svg.getBoundingClientRect();
    const rx = (e.clientX - r.left) / r.width;
    const ry = (e.clientY - r.top) / r.height;
    return { x: view.x + rx * view.w, z: view.y + ry * view.h };
  };

  const setPoint = (i: number, x: number, z: number) => {
    const points = plan.points.map((p, idx) => (idx === i ? { x: snap(x), z: snap(z) } : p));
    onChange({ ...plan, points });
  };

  const addCorner = (wallIdx: number) => {
    const s = segs[wallIdx]!;
    const points = [...plan.points];
    points.splice(wallIdx + 1, 0, { x: snap(s.mid.x), z: snap(s.mid.z) });
    // vãos das paredes seguintes deslocam um índice
    const openings = plan.openings.map((o) =>
      o.wall > wallIdx ? { ...o, wall: o.wall + 1 } : o.wall === wallIdx ? { ...o, offset: Math.min(o.offset, s.length / 2 - o.width / 2 - 0.05) } : o,
    );
    onChange({ ...plan, points, openings });
    setSelWall(null);
  };

  const removeCorner = (i: number) => {
    if (plan.points.length <= 3) return;
    const points = plan.points.filter((_, idx) => idx !== i);
    const openings = plan.openings.filter((o) => o.wall !== i).map((o) => (o.wall > i ? { ...o, wall: o.wall - 1 } : o));
    onChange({ ...plan, points, openings });
  };

  const addOpening = (wallIdx: number, kind: OpeningKind) => {
    const s = segs[wallIdx]!;
    const def = OPENING_DEFAULTS[kind];
    const op = clampOpening(
      { id: uidPlan("op"), wall: wallIdx, offset: s.length / 2, kind, ...def },
      s.length,
    );
    onChange({ ...plan, openings: [...plan.openings, op] });
    setSelOpening(op.id);
  };

  const patchOpening = (id: string, patch: Partial<Opening>) =>
    onChange({
      ...plan,
      openings: plan.openings.map((o) =>
        o.id === id ? clampOpening({ ...o, ...patch }, segs[o.wall]?.length ?? 3) : o,
      ),
    });

  const removeOpening = (id: string) => {
    onChange({ ...plan, openings: plan.openings.filter((o) => o.id !== id) });
    setSelOpening(null);
  };

  const opening = plan.openings.find((o) => o.id === selOpening) ?? null;
  const area = planArea(plan);

  const outline = plan.points.map((p) => `${p.x},${p.z}`).join(" ");

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        <svg
          ref={svgRef}
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          className="block aspect-4/3 w-full touch-none select-none"
          onPointerMove={(e) => {
            if (dragIdx === null) return;
            const p = toPlan(e);
            setPoint(dragIdx, p.x, p.z);
          }}
          onPointerUp={() => setDragIdx(null)}
          onPointerLeave={() => setDragIdx(null)}
        >
          <defs>
            <pattern id="grid1m" width="1" height="1" patternUnits="userSpaceOnUse">
              <path d="M1 0 L0 0 0 1" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth={unit} />
            </pattern>
          </defs>
          <rect x={view.x} y={view.y} width={view.w} height={view.h} fill="url(#grid1m)" className="text-muted-foreground" />

          <polygon points={outline} className="fill-primary/10 stroke-primary" strokeWidth={unit * 3} strokeLinejoin="round" />

          {/* paredes clicáveis + medidas */}
          {segs.map((s) => {
            const active = selWall === s.index;
            const nx = s.nx;
            const nz = s.nz;
            return (
              <g key={s.index}>
                <line
                  x1={s.a.x}
                  y1={s.a.z}
                  x2={s.b.x}
                  y2={s.b.z}
                  stroke="transparent"
                  strokeWidth={unit * 26}
                  className="cursor-pointer"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setSelWall(active ? null : s.index);
                    setSelOpening(null);
                  }}
                />
                <line
                  x1={s.a.x}
                  y1={s.a.z}
                  x2={s.b.x}
                  y2={s.b.z}
                  className={active ? "stroke-primary" : "stroke-foreground/70"}
                  strokeWidth={unit * (active ? 7 : 4)}
                  strokeLinecap="round"
                  pointerEvents="none"
                />
                {/* vãos desenhados sobre a parede */}
                {plan.openings
                  .filter((o) => o.wall === s.index)
                  .map((o) => {
                    const t = o.offset / (s.length || 1);
                    const cx = s.a.x + (s.b.x - s.a.x) * t;
                    const cz = s.a.z + (s.b.z - s.a.z) * t;
                    const ux = (s.b.x - s.a.x) / (s.length || 1);
                    const uz = (s.b.z - s.a.z) / (s.length || 1);
                    const half = o.width / 2;
                    const door = o.kind === "porta" || o.kind === "portaJanela";
                    return (
                      <g key={o.id}>
                        <line
                          x1={cx - ux * half}
                          y1={cz - uz * half}
                          x2={cx + ux * half}
                          y2={cz + uz * half}
                          className={
                            selOpening === o.id ? "stroke-amber-400" : door ? "stroke-orange-400" : "stroke-sky-400"
                          }
                          strokeWidth={unit * 9}
                          strokeLinecap="butt"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            setSelOpening(o.id);
                            setSelWall(s.index);
                          }}
                        />
                        {door && (
                          <path
                            d={`M ${cx - ux * half} ${cz - uz * half} a ${o.width} ${o.width} 0 0 1 ${ux * half + nx * o.width} ${uz * half + nz * o.width}`}
                            fill="none"
                            className="stroke-orange-400/60"
                            strokeWidth={unit * 1.5}
                            strokeDasharray={`${unit * 4} ${unit * 4}`}
                            pointerEvents="none"
                          />
                        )}
                      </g>
                    );
                  })}
                <text
                  x={s.mid.x + nx * 0.34}
                  y={s.mid.z + nz * 0.34}
                  fontSize={Math.max(view.w, view.h) * 0.045}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground font-semibold"
                  pointerEvents="none"
                >
                  {m(s.length)}
                </text>
              </g>
            );
          })}

          {/* cantos arrastáveis */}
          {plan.points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.z}
              r={Math.max(view.w, view.h) * 0.028}
              className={dragIdx === i ? "fill-primary" : "fill-card stroke-primary"}
              strokeWidth={unit * 3}
              onPointerDown={(e) => {
                e.stopPropagation();
                (e.target as Element).setPointerCapture(e.pointerId);
                setDragIdx(i);
              }}
              onDoubleClick={() => removeCorner(i)}
            />
          ))}

          <text
            x={view.x + view.w / 2}
            y={view.y + view.h - Math.max(view.w, view.h) * 0.04}
            fontSize={Math.max(view.w, view.h) * 0.05}
            textAnchor="middle"
            className="fill-muted-foreground font-semibold"
            pointerEvents="none"
          >
            {area.toFixed(2).replace(".", ",")} m² de piso
          </text>
        </svg>

        <span className="pointer-events-none absolute top-2 left-2 rounded-md bg-foreground/70 px-2 py-1 text-[10px] font-semibold tracking-wide text-background uppercase">
          Arraste os cantos · toque numa parede
        </span>
      </div>

      {/* medidas rápidas */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { icon: Maximize, label: "Piso", value: `${area.toFixed(2).replace(".", ",")} m²` },
          { icon: Ruler, label: "Perímetro", value: m(planPerimeter(plan)) },
          { icon: DoorOpen, label: "Parede útil", value: `${wallArea(plan).toFixed(1).replace(".", ",")} m²` },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card/60 p-2">
            <s.icon className="mx-auto size-3.5 text-primary" />
            <p className="mt-1 font-display text-sm font-bold">{s.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ações da parede selecionada */}
      {selWall !== null && segs[selWall] && (
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-3">
          <p className="mb-2 text-xs font-bold uppercase">
            Parede {selWall + 1} · {m(segs[selWall]!.length)}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(OPENING_DEFAULTS) as OpeningKind[]).map((k) => (
              <button
                key={k}
                onClick={() => addOpening(selWall, k)}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-2 text-xs font-medium hover:border-primary"
              >
                <Plus className="size-3" /> {OPENING_DEFAULTS[k].label}
              </button>
            ))}
            <button
              onClick={() => addCorner(selWall)}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-2 text-xs font-medium hover:border-primary"
            >
              <Plus className="size-3" /> Dividir parede (novo canto)
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <label className="flex-1 text-xs font-medium">
              Comprimento (m)
              <input
                type="number"
                step="0.05"
                min="0.6"
                value={segs[selWall]!.length.toFixed(2)}
                onChange={(e) => {
                  const target = Number(e.target.value);
                  if (!target || target < 0.6) return;
                  const s = segs[selWall]!;
                  const ux = (s.b.x - s.a.x) / (s.length || 1);
                  const uz = (s.b.z - s.a.z) / (s.length || 1);
                  const j = (selWall + 1) % plan.points.length;
                  setPoint(j, s.a.x + ux * target, s.a.z + uz * target);
                }}
                className="mt-1 w-full rounded-lg border border-border bg-card px-2 py-2 text-sm"
              />
            </label>
            <label className="flex-1 text-xs font-medium">
              Pé-direito (m)
              <input
                type="number"
                step="0.05"
                min="2"
                max="6"
                value={plan.height}
                onChange={(e) => onChange({ ...plan, height: Number(e.target.value) || 2.8 })}
                className="mt-1 w-full rounded-lg border border-border bg-card px-2 py-2 text-sm"
              />
            </label>
          </div>
        </div>
      )}

      {/* vão selecionado */}
      {opening && (
        <div className="rounded-xl border border-border bg-card/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase">{OPENING_DEFAULTS[opening.kind].label}</p>
            <button
              onClick={() => removeOpening(opening.id)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Remover vão"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(
              [
                ["width", "Largura", 0.4, 6],
                ["height", "Altura", 0.4, 3.5],
                ["sill", "Peitoril", 0, 2],
                ["offset", "Posição", 0, 20],
              ] as const
            ).map(([key, label, min, max]) => (
              <label key={key} className="text-xs font-medium">
                {label} (m)
                <input
                  type="number"
                  step="0.05"
                  min={min}
                  max={max}
                  value={opening[key]}
                  onChange={(e) => patchOpening(opening.id, { [key]: Number(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-border bg-card px-2 py-2 text-sm"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => onChange(rectPlan(Math.max(2, b.w || 4), Math.max(2, b.d || 3)))}
        className="text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        Reiniciar planta como retângulo
      </button>
    </div>
  );
}
