import { createServerFn } from "@tanstack/react-start";
import { DEFAULT_WALL_HEIGHT, OPENING_DEFAULTS } from "@/lib/plan";
import type { Opening, OpeningKind, PlanPoint, RoomPlan } from "@/lib/types";

export interface DetectedRoom {
  name: string;
  areaM2: number;
  plan: RoomPlan;
  floor: string;
  wallColor: string;
  notes: string;
}

export interface PlanAnalysis {
  title: string;
  summary: string;
  totalAreaM2: number;
  rooms: DetectedRoom[];
}

interface RawRoom {
  name?: unknown;
  widthM?: unknown;
  depthM?: unknown;
  points?: unknown;
  openings?: unknown;
  heightM?: unknown;
  floor?: unknown;
  wallColor?: unknown;
  notes?: unknown;
}

const PROMPT = `Você é um arquiteto que interpreta plantas baixas.
Analise a planta enviada e devolva SOMENTE um JSON válido (sem markdown) no formato:
{
  "title": "nome curto do projeto",
  "summary": "1 frase descrevendo a planta",
  "rooms": [
    {
      "name": "Sala de estar",
      "widthM": 4.5,
      "depthM": 3.2,
      "points": [{"x":-2.25,"z":-1.6},{"x":2.25,"z":-1.6},{"x":2.25,"z":1.6},{"x":-2.25,"z":1.6}],
      "heightM": 2.8,
      "openings": [
        {"wall":0,"offset":1.2,"width":1.2,"height":1.2,"sill":1.05,"kind":"janela"},
        {"wall":3,"offset":1.6,"width":0.8,"height":2.1,"sill":0,"kind":"porta"}
      ],
      "floor": "Porcelanato acetinado 80x80",
      "wallColor": "#e8e3da",
      "notes": "observação curta"
    }
  ]
}
Regras:
- Use metros reais. Se houver cotas na planta, respeite-as; senão estime por proporção (portas ~0,80 m).
- "points" são os cantos do ambiente no sentido horário, em metros, relativos ao CENTRO do próprio ambiente.
- "wall" é o índice do segmento entre points[i] e points[i+1]; "offset" é a distância em metros do início da parede até o centro do vão.
- kind ∈ "porta" | "portaJanela" | "janela" | "vao".
- floor ∈ "Porcelanato acetinado 80x80" | "Porcelanato grande formato 120x120" | "Piso amadeirado" | "Cimento queimado" | "Deck de madeira" | "Piso cerâmico".
- Máximo 8 ambientes, os mais relevantes. Nomes em português.`;

const FLOORS = [
  "Porcelanato acetinado 80x80",
  "Porcelanato grande formato 120x120",
  "Piso amadeirado",
  "Cimento queimado",
  "Deck de madeira",
  "Piso cerâmico",
];

const num = (v: unknown, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

function rectPoints(w: number, d: number): PlanPoint[] {
  return [
    { x: -w / 2, z: -d / 2 },
    { x: w / 2, z: -d / 2 },
    { x: w / 2, z: d / 2 },
    { x: -w / 2, z: d / 2 },
  ];
}

function sanitizeRoom(raw: RawRoom, i: number): DetectedRoom {
  const width = Math.min(30, Math.max(1.2, num(raw.widthM, 3.5)));
  const depth = Math.min(30, Math.max(1.2, num(raw.depthM, 3)));

  let points: PlanPoint[] = rectPoints(width, depth);
  if (Array.isArray(raw.points) && raw.points.length >= 3 && raw.points.length <= 12) {
    const parsed = raw.points
      .map((p) => {
        const q = p as { x?: unknown; z?: unknown };
        return { x: num(q.x, NaN), z: num(q.z, NaN) };
      })
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.z));
    if (parsed.length >= 3) points = parsed;
  }

  const height = Math.min(6, Math.max(2.2, num(raw.heightM, DEFAULT_WALL_HEIGHT)));
  const wallCount = points.length;

  const openings: Opening[] = (Array.isArray(raw.openings) ? raw.openings : [])
    .slice(0, 12)
    .map((o, k): Opening => {
      const r = o as Record<string, unknown>;
      const kind: OpeningKind =
        r["kind"] === "porta" || r["kind"] === "portaJanela" || r["kind"] === "janela" || r["kind"] === "vao"
          ? r["kind"]
          : "janela";
      const def = OPENING_DEFAULTS[kind];
      const wall = Math.min(wallCount - 1, Math.max(0, Math.round(num(r["wall"], 0))));
      const a = points[wall]!;
      const b = points[(wall + 1) % wallCount]!;
      const len = Math.hypot(b.x - a.x, b.z - a.z);
      const width2 = Math.min(Math.max(0.4, num(r["width"], def.width)), Math.max(0.4, len - 0.2));
      const offset = Math.min(len - width2 / 2 - 0.05, Math.max(width2 / 2 + 0.05, num(r["offset"], len / 2)));
      return {
        id: `op_${i}_${k}_${Math.random().toString(36).slice(2, 7)}`,
        wall,
        offset: Number(offset.toFixed(2)),
        width: Number(width2.toFixed(2)),
        height: Math.min(height - 0.1, Math.max(0.4, num(r["height"], def.height))),
        sill: Math.max(0, num(r["sill"], def.sill)),
        kind,
      };
    });

  const plan: RoomPlan = { points, openings, height };

  let area = 0;
  for (let k = 0; k < points.length; k++) {
    const a = points[k]!;
    const b = points[(k + 1) % points.length]!;
    area += a.x * b.z - b.x * a.z;
  }

  const floorRaw = typeof raw.floor === "string" ? raw.floor : "";
  return {
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : `Ambiente ${i + 1}`,
    areaM2: Number((Math.abs(area) / 2).toFixed(2)),
    plan,
    floor: FLOORS.includes(floorRaw) ? floorRaw : "Porcelanato acetinado 80x80",
    wallColor: typeof raw.wallColor === "string" && /^#[0-9a-f]{6}$/i.test(raw.wallColor) ? raw.wallColor : "#e8e3da",
    notes: typeof raw.notes === "string" ? raw.notes : "",
  };
}

function extractJson(text: string): Record<string, unknown> {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("A IA não retornou um JSON válido da planta.");
  return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
}

export const analyzeFloorPlan = createServerFn({ method: "POST" })
  .inputValidator((input: { dataUrl: string; mimeType: string; fileName: string }) => {
    if (!input?.dataUrl?.startsWith("data:")) throw new Error("Arquivo inválido.");
    if (input.dataUrl.length > 14_000_000) throw new Error("Arquivo muito grande (máx. ~10 MB).");
    return input;
  })
  .handler(async ({ data }): Promise<PlanAnalysis> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("IA não configurada neste projeto.");

    const isPdf = data.mimeType === "application/pdf";
    const content = [
      { type: "text", text: PROMPT },
      isPdf
        ? { type: "file", file: { filename: data.fileName || "planta.pdf", file_data: data.dataUrl } }
        : { type: "image_url", image_url: { url: data.dataUrl } },
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.7-flash",
        messages: [{ role: "user", content }],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Muitas requisições agora. Tente de novo em alguns segundos.");
      if (res.status === 402) throw new Error("Créditos de IA insuficientes para gerar o 3D.");
      throw new Error(`Falha ao analisar a planta (${res.status}). ${body.slice(0, 200)}`);
    }

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = json.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(text);

    const rawRooms = Array.isArray(parsed["rooms"]) ? (parsed["rooms"] as RawRoom[]) : [];
    const rooms = rawRooms.slice(0, 8).map(sanitizeRoom);
    if (!rooms.length) throw new Error("Não consegui identificar ambientes nessa planta. Tente uma imagem mais nítida.");

    return {
      title: typeof parsed["title"] === "string" ? (parsed["title"] as string) : "Planta importada",
      summary: typeof parsed["summary"] === "string" ? (parsed["summary"] as string) : "",
      totalAreaM2: Number(rooms.reduce((s, r) => s + r.areaM2, 0).toFixed(2)),
      rooms,
    };
  });
