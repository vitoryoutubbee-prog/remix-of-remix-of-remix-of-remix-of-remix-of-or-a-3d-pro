import type { Budget } from "./types";

export interface BudgetTotals {
  materials: number;
  labor: number;
  equipment: number;
  others: number;
  cost: number;
  margin: number;
  discount: number;
  final: number;
}

export function computeTotals(b: Budget): BudgetTotals {
  const materials = b.materials.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const labor = b.labor.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const equipment = b.equipment.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const others = b.others.reduce((s, i) => s + i.value, 0);
  const cost = materials + labor + equipment + others;
  const margin = cost * (b.marginPct / 100);
  const withMargin = cost + margin;
  const discount = withMargin * (b.discountPct / 100);
  return {
    materials,
    labor,
    equipment,
    others,
    cost,
    margin,
    discount,
    final: withMargin - discount,
  };
}

export const emptyBudget = (): Budget => ({
  materials: [],
  labor: [],
  equipment: [],
  others: [],
  marginPct: 20,
  discountPct: 0,
});
