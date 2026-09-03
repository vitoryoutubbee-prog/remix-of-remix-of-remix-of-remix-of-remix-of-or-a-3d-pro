import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Camera,
  Download,
  FileText,
  Image as ImageIcon,
  RotateCcw,
  Share2,
  Sparkles,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import type { CameraPreset } from "@/components/Room3D";
import { RoomViewer3D } from "@/components/RoomViewer3D";
import { SectionCard, ScreenHeader } from "@/components/ui-kit";
import { uid } from "@/lib/format";
import { analyzeFloorPlan, type PlanAnalysis } from "@/lib/plan-ai.functions";
import { planBounds } from "@/lib/plan";
import { useStore } from "@/lib/store";
import type { Room, Visualization } from "@/lib/types";

export const Route = createFileRoute("/planta")({
  head: () => ({
    meta: [
      { title: "Planta baixa em 3D — ORÇA 3D Construtor Pro" },
      {
        name: "description",
        content:
          "Envie a planta baixa em JPG, PNG ou PDF e gere automaticamente a visualização 3D dos ambientes, com download em alta resolução e exportação em PDF.",
      },
      { property: "og:title", content: "Planta baixa em 3D — ORÇA 3D Construtor Pro" },
      {
        property: "og:description",
        content: "Da planta baixa ao 3D interativo em poucos segundos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlantaPage,
});

const ACCEPT = ["image/jpeg", "image/png", "application/pdf"];
const STEPS = [
  "Lendo o arquivo da planta…",
  "Identificando paredes e cotas…",
  "Reconhecendo portas e janelas…",
  "Montando os ambientes em 3D…",
  "Aplicando materiais e iluminação…",
];

const PRESETS: Array<{ id: CameraPreset; label: string }> = [
  { id: "canto", label: "Perspectiva" },
  { id: "frontal", label: "Frontal" },
  { id: "lateral", label: "Lateral" },
  { id: "topo", label: "Superior" },
];

function toVisualization(floor: string, wallColor: string, plan: Visualization["plan"]): Visualization {
  return {
    plan,
    floor,
    wallColor,
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

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    fr.readAsDataURL(file);
  });
}

function PlantaPage() {
  const [stage, setStage] = useState<"upload" | "processing" | "result">("upload");
  const [file, setFile] = useState<{ name: string; type: string; dataUrl: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [analysis, setAnalysis] = useState<PlanAnalysis | null>(null);
  const [roomIndex, setRoomIndex] = useState(0);
  const [preset, setPreset] = useState<CameraPreset>("canto");
  const [exporting, setExporting] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const analyze = useServerFn(analyzeFloorPlan);
  const navigate = useNavigate();
  const { state, updateProject, logHistory } = useStore();

  useEffect(() => {
    if (stage !== "processing") return;
    setProgress(6);
    setStepIndex(0);
    const t = setInterval(() => {
      setProgress((p) => (p >= 94 ? 94 : p + Math.max(0.6, (95 - p) * 0.045)));
      setStepIndex((i) => Math.min(STEPS.length - 1, i + (Math.random() > 0.72 ? 1 : 0)));
    }, 420);
    return () => clearInterval(t);
  }, [stage]);

  const room = analysis?.rooms[roomIndex];
  const visualization = useMemo(
    () => (room ? toVisualization(room.floor, room.wallColor, room.plan) : null),
    [room],
  );
  const dims = useMemo(() => {
    if (!room) return "";
    const b = planBounds(room.plan);
    return `${b.w.toFixed(2)} x ${b.d.toFixed(2)}`;
  }, [room]);

  async function handleFile(f: File) {
    if (!ACCEPT.includes(f.type)) {
      toast.error("Formato não aceito. Envie JPG, PNG ou PDF.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. O limite é 10 MB.");
      return;
    }
    const dataUrl = await readAsDataUrl(f);
    const picked = { name: f.name, type: f.type, dataUrl };
    setFile(picked);
    setStage("processing");
    try {
      const result = await analyze({
        data: { dataUrl, mimeType: f.type, fileName: f.name },
      });
      setAnalysis(result);
      setRoomIndex(0);
      setProgress(100);
      setTimeout(() => setStage("result"), 350);
      toast.success(`${result.rooms.length} ambiente(s) gerados em 3D`);
    } catch (err) {
      setStage("upload");
      toast.error(err instanceof Error ? err.message : "Falha ao gerar o 3D.");
    }
  }

  function captureRender(): string | null {
    const canvas = viewerRef.current?.querySelector("canvas");
    if (!canvas) return null;
    try {
      return canvas.toDataURL("image/png");
    } catch {
      return null;
    }
  }

  function downloadRender() {
    const url = captureRender();
    if (!url) {
      toast.error("Não foi possível capturar o render. Gire a cena e tente novamente.");
      return;
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = `render-3d-${(room?.name ?? "ambiente").toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
    toast.success("Render salvo em alta resolução");
  }

  async function exportPdf() {
    if (!analysis) return;
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pw = doc.internal.pageSize.getWidth();

      doc.setFontSize(18);
      doc.text(analysis.title || "Projeto 3D", 14, 20);
      doc.setFontSize(10);
      doc.text(doc.splitTextToSize(analysis.summary || "Visualização 3D gerada a partir da planta baixa.", pw - 28), 14, 28);
      doc.text(`Área total estimada: ${analysis.totalAreaM2.toFixed(2)} m²`, 14, 42);

      let y = 52;
      doc.setFontSize(12);
      doc.text("Ambientes identificados", 14, y);
      y += 7;
      doc.setFontSize(10);
      for (const r of analysis.rooms) {
        const b = planBounds(r.plan);
        doc.text(
          `• ${r.name} — ${b.w.toFixed(2)} x ${b.d.toFixed(2)} m · ${r.areaM2.toFixed(2)} m² · ${r.plan.openings.length} vão(s)`,
          16,
          y,
        );
        y += 6;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      }

      const render = captureRender();
      if (render) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text(`Render 3D — ${room?.name ?? "Ambiente"}`, 14, 18);
        doc.addImage(render, "PNG", 14, 24, pw - 28, (pw - 28) * 0.62, undefined, "FAST");
      }

      if (file && file.type !== "application/pdf") {
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Planta baixa original", 14, 18);
        doc.addImage(file.dataUrl, file.type === "image/png" ? "PNG" : "JPEG", 14, 24, pw - 28, 0);
      }

      doc.save(`projeto-3d-${Date.now()}.pdf`);
      toast.success("PDF exportado com planta e render");
    } catch {
      toast.error("Não foi possível exportar o PDF.");
    } finally {
      setExporting(false);
    }
  }

  async function share() {
    const url = captureRender();
    if (!url || !navigator.share) {
      await navigator.clipboard.writeText(window.location.href).catch(() => undefined);
      toast.success("Link copiado para compartilhar");
      return;
    }
    try {
      const blob = await (await fetch(url)).blob();
      const imgFile = new File([blob], "render-3d.png", { type: "image/png" });
      await navigator.share({ title: analysis?.title ?? "Render 3D", files: [imgFile] });
    } catch {
      /* usuário cancelou */
    }
  }

  function saveToProject(projectId: string) {
    if (!analysis) return;
    const project = state.projects.find((p) => p.id === projectId);
    if (!project) return;
    const rooms: Room[] = analysis.rooms.map((r) => {
      const b = planBounds(r.plan);
      return {
        id: uid(),
        name: r.name,
        dimensions: `${b.w.toFixed(2)} x ${b.d.toFixed(2)}`,
        description: r.notes,
        materials: "",
        finishes: "",
        notes: "Gerado a partir da planta baixa",
        visualization: toVisualization(r.floor, r.wallColor, r.plan),
      };
    });
    updateProject(projectId, { rooms: [...project.rooms, ...rooms] });
    logHistory(projectId, "Planta baixa importada", `${rooms.length} ambiente(s) gerados em 3D`);
    toast.success("Ambientes adicionados ao projeto");
    void navigate({ to: "/projetos/$id", params: { id: projectId } });
  }

  function reset() {
    setStage("upload");
    setAnalysis(null);
    setFile(null);
    setProgress(0);
  }

  return (
    <AppShell>
      <ScreenHeader
        title="Planta baixa → 3D"
        subtitle="Envie a planta em JPG, PNG ou PDF e receba os ambientes em 3D interativo."
      />

      {stage === "upload" && <UploadStage onFile={handleFile} />}

      {stage === "processing" && (
        <SectionCard title="Gerando seu projeto em 3D…">
          <div className="flex flex-col items-center gap-5 py-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-7 animate-pulse text-primary" />
            </span>
            <div className="w-full max-w-md">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">{STEPS[stepIndex]}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {Math.round(progress)}% · isso costuma levar de 15 a 40 segundos
              </p>
            </div>
          </div>
        </SectionCard>
      )}

      {stage === "result" && analysis && visualization && room && (
        <div className="space-y-4">
          <SectionCard
            title={analysis.title || "Projeto em 3D"}
            description={`${analysis.rooms.length} ambiente(s) · ${analysis.totalAreaM2.toFixed(2)} m² estimados`}
          >
            <div className="mb-3 flex flex-wrap gap-2">
              {analysis.rooms.map((r, i) => (
                <button
                  key={r.name + i}
                  type="button"
                  onClick={() => setRoomIndex(i)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    i === roomIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>

            <RoomViewer3D
              v={visualization}
              roomName={room.name}
              dimensions={dims}
              className="aspect-4/3 sm:aspect-16/10"
              capture
              cameraPreset={preset}
              containerRef={viewerRef}
              hint="arraste para girar · scroll para zoom"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreset(p.id)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    preset === p.id
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Camera className="size-3.5" /> {p.label}
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              {room.notes || `${dims.replace("x", "×")} m · pé-direito ${room.plan.height.toFixed(2)} m · ${room.plan.openings.length} vão(s)`}
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={downloadRender}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <Download className="size-4" /> Baixar render
              </button>
              <button
                type="button"
                onClick={exportPdf}
                disabled={exporting}
                className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                <FileText className="size-4" /> {exporting ? "Exportando…" : "Exportar PDF"}
              </button>
              <button
                type="button"
                onClick={share}
                className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold"
              >
                <Share2 className="size-4" /> Compartilhar
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Usar em um projeto" description="Adiciona os ambientes gerados a uma obra existente.">
            {state.projects.length ? (
              <div className="flex flex-wrap gap-2">
                {state.projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => saveToProject(p.id)}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:border-primary hover:text-primary"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Crie um projeto primeiro para salvar os ambientes.</p>
            )}
          </SectionCard>

          {file && file.type !== "application/pdf" && (
            <SectionCard title="Planta original">
              <img src={file.dataUrl} alt="Planta baixa enviada" className="w-full rounded-xl border border-border" />
            </SectionCard>
          )}

          <button
            type="button"
            onClick={reset}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold"
          >
            <RotateCcw className="size-4" /> Enviar outra planta
          </button>
        </div>
      )}
    </AppShell>
  );
}

function UploadStage({ onFile }: { onFile: (f: File) => void | Promise<void> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <SectionCard title="Enviar planta baixa" description="JPG, PNG ou PDF até 10 MB.">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void onFile(f);
        }}
        className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition ${
          over ? "border-primary bg-primary/5" : "border-border"
        }`}
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Upload className="size-6 text-muted-foreground" />
        </span>
        <p className="text-sm font-semibold">Arraste a planta aqui ou escolha um arquivo</p>
        <p className="text-xs text-muted-foreground">Quanto mais nítidas as cotas, mais preciso fica o 3D.</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-1 flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <ImageIcon className="size-4" /> Selecionar arquivo
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
            e.target.value = "";
          }}
        />
      </div>
    </SectionCard>
  );
}
