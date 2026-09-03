import type { SceneItem, SceneItemKind } from "./types";

export interface CatalogEntry {
  kind: SceneItemKind;
  label: string;
  category: "Mobiliário" | "Decoração" | "Área externa";
  color: string;
  /** raio aproximado em metros, usado para não sobrepor ao adicionar */
  footprint: number;
}

export const SCENE_CATALOG: CatalogEntry[] = [
  { kind: "sofa", label: "Sofá", category: "Mobiliário", color: "#4c5663", footprint: 1.2 },
  { kind: "poltrona", label: "Poltrona", category: "Mobiliário", color: "#7c6a52", footprint: 0.5 },
  { kind: "mesaCentro", label: "Mesa de centro", category: "Mobiliário", color: "#6b4a2c", footprint: 0.6 },
  { kind: "mesaJantar", label: "Mesa de jantar", category: "Mobiliário", color: "#5d4126", footprint: 0.9 },
  { kind: "cadeira", label: "Cadeira", category: "Mobiliário", color: "#3f4650", footprint: 0.3 },
  { kind: "cama", label: "Cama", category: "Mobiliário", color: "#d9d2c6", footprint: 1.1 },
  { kind: "estante", label: "Estante", category: "Mobiliário", color: "#6f4f31", footprint: 0.7 },
  { kind: "armario", label: "Armário", category: "Mobiliário", color: "#efece6", footprint: 0.8 },
  { kind: "balcao", label: "Balcão / cozinha", category: "Mobiliário", color: "#2f3a3f", footprint: 0.9 },
  { kind: "tv", label: "TV + painel", category: "Mobiliário", color: "#1c1f24", footprint: 0.8 },
  { kind: "tapete", label: "Tapete", category: "Decoração", color: "#cfc9be", footprint: 1.2 },
  { kind: "planta", label: "Planta", category: "Decoração", color: "#4c7d50", footprint: 0.4 },
  { kind: "luminaria", label: "Luminária de piso", category: "Decoração", color: "#e8c98a", footprint: 0.3 },
  { kind: "quadro", label: "Quadro / painel", category: "Decoração", color: "#20242a", footprint: 0.3 },
  { kind: "vaso", label: "Vaso decorativo", category: "Decoração", color: "#b9b2a6", footprint: 0.3 },
  { kind: "churrasqueira", label: "Churrasqueira", category: "Área externa", color: "#8b8b86", footprint: 0.8 },
  { kind: "piscina", label: "Piscina", category: "Área externa", color: "#3fa9c9", footprint: 1.6 },
  { kind: "espreguicadeira", label: "Espreguiçadeira", category: "Área externa", color: "#c8b18a", footprint: 0.6 },
];

export const CATALOG_BY_KIND: Record<SceneItemKind, CatalogEntry> = Object.fromEntries(
  SCENE_CATALOG.map((c) => [c.kind, c]),
) as Record<SceneItemKind, CatalogEntry>;

export const CATEGORIES = ["Mobiliário", "Decoração", "Área externa"] as const;

/** Cria um item novo posicionado em um ponto livre da planta. */
export function createSceneItem(kind: SceneItemKind, existing: SceneItem[], w: number, d: number): SceneItem {
  const entry = CATALOG_BY_KIND[kind];
  const margin = 0.6;
  const maxX = Math.max(0.2, w / 2 - margin);
  const maxZ = Math.max(0.2, d / 2 - margin);

  let best = { x: 0, z: 0 };
  let bestDist = -1;
  for (let i = 0; i < 60; i++) {
    const x = (Math.random() * 2 - 1) * maxX;
    const z = (Math.random() * 2 - 1) * maxZ;
    const dist = existing.length
      ? Math.min(...existing.map((it) => Math.hypot(it.x - x, it.z - z)))
      : 99;
    if (dist > bestDist) {
      bestDist = dist;
      best = { x, z };
    }
    if (dist > entry.footprint + 0.8) break;
  }

  return {
    id: `it_${Math.random().toString(36).slice(2, 10)}`,
    kind,
    x: Number(best.x.toFixed(2)),
    z: Number(best.z.toFixed(2)),
    rot: 0,
    scale: 1,
    color: entry.color,
  };
}
