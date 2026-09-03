import type { Opening, OpeningKind, RoomPlan } from "./types";

export const WALL_THICKNESS = 0.15;
export const DEFAULT_WALL_HEIGHT = 2.8;
/** passo de encaixe em metros (5 cm) */
export const SNAP = 0.05;

export const OPENING_DEFAULTS: Record<OpeningKind, { width: number; height: number; sill: number; label: string }> = {
  porta: { width: 0.8, height: 2.1, sill: 0, label: "Porta" },
  portaJanela: { width: 1.6, height: 2.1, sill: 0, label: "Porta-janela" },
  janela: { width: 1.2, height: 1.2, sill: 1.05, label: "Janela" },
  vao: { width: 1.4, height: 2.2, sill: 0, label: "Vão livre" },
};

export const snap = (n: number) => Math.round(n / SNAP) * SNAP;

export function uidPlan(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Retângulo padrão a partir de largura x profundidade em metros. */
export function rectPlan(w: number, d: number): RoomPlan {
  return {
    points: [
      { x: -w / 2, z: -d / 2 },
      { x: w / 2, z: -d / 2 },
      { x: w / 2, z: d / 2 },
      { x: -w / 2, z: d / 2 },
    ],
    openings: [
      { id: uidPlan("op"), wall: 3, offset: d / 2, kind: "porta", ...OPENING_DEFAULTS.porta },
      { id: uidPlan("op"), wall: 0, offset: w / 2, kind: "janela", ...OPENING_DEFAULTS.janela },
    ],
    height: DEFAULT_WALL_HEIGHT,
  };
}

export interface WallSeg {
  index: number;
  a: { x: number; z: number };
  b: { x: number; z: number };
  length: number;
  /** ângulo no plano XZ */
  angle: number;
  mid: { x: number; z: number };
  /** normal unitária apontando para dentro do ambiente */
  nx: number;
  nz: number;
}

export function walls(plan: RoomPlan): WallSeg[] {
  const p = plan.points;
  const c = centroid(plan);
  return p.map((a, i) => {
    const b = p[(i + 1) % p.length]!;
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const length = Math.hypot(dx, dz);
    const mid = { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 };
    // normal candidata
    let nx = -dz / (length || 1);
    let nz = dx / (length || 1);
    if ((c.x - mid.x) * nx + (c.z - mid.z) * nz < 0) {
      nx = -nx;
      nz = -nz;
    }
    return { index: i, a, b, length, angle: Math.atan2(dz, dx), mid, nx, nz };
  });
}

export function centroid(plan: RoomPlan) {
  const p = plan.points;
  const sum = p.reduce((acc, q) => ({ x: acc.x + q.x, z: acc.z + q.z }), { x: 0, z: 0 });
  return { x: sum.x / (p.length || 1), z: sum.z / (p.length || 1) };
}

/** Área em m² (fórmula do cadarço). */
export function planArea(plan: RoomPlan) {
  const p = plan.points;
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i]!;
    const b = p[(i + 1) % p.length]!;
    s += a.x * b.z - b.x * a.z;
  }
  return Math.abs(s) / 2;
}

export function planPerimeter(plan: RoomPlan) {
  return walls(plan).reduce((s, w) => s + w.length, 0);
}

/** Área de parede pintável = perímetro x pé-direito menos os vãos. */
export function wallArea(plan: RoomPlan) {
  const gross = planPerimeter(plan) * plan.height;
  const holes = plan.openings.reduce((s, o) => s + o.width * o.height, 0);
  return Math.max(0, gross - holes);
}

export function planBounds(plan: RoomPlan) {
  const xs = plan.points.map((p) => p.x);
  const zs = plan.points.map((p) => p.z);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minZ: Math.min(...zs),
    maxZ: Math.max(...zs),
    w: Math.max(...xs) - Math.min(...xs),
    d: Math.max(...zs) - Math.min(...zs),
  };
}

/** Divide uma parede em pedaços cheios entre os vãos (coordenada local -L/2..L/2). */
export function wallPieces(length: number, openings: Opening[]) {
  const sorted = [...openings].sort((a, b) => a.offset - b.offset);
  const pieces: { center: number; width: number }[] = [];
  let cursor = 0;
  for (const o of sorted) {
    const start = Math.max(0, o.offset - o.width / 2);
    const end = Math.min(length, o.offset + o.width / 2);
    if (start > cursor) pieces.push({ center: (cursor + start) / 2 - length / 2, width: start - cursor });
    cursor = Math.max(cursor, end);
  }
  if (cursor < length) pieces.push({ center: (cursor + length) / 2 - length / 2, width: length - cursor });
  return pieces.filter((p) => p.width > 0.01);
}

/** Mantém o vão dentro da parede. */
export function clampOpening(o: Opening, length: number): Opening {
  const width = Math.min(o.width, Math.max(0.4, length - 0.2));
  const offset = Math.min(length - width / 2 - 0.05, Math.max(width / 2 + 0.05, o.offset));
  return { ...o, width: Number(width.toFixed(2)), offset: Number(offset.toFixed(2)) };
}

export const m = (n: number) => `${n.toFixed(2).replace(".", ",")} m`;
