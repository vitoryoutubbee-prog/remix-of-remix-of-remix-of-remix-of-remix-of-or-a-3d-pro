import { PROJECT_STATUS_LABEL, type ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const styles: Record<ProjectStatus, string> = {
  rascunho: "bg-muted text-muted-foreground border-border",
  orcamento_enviado: "bg-primary-soft text-primary border-primary/20",
  em_negociacao: "bg-construction-soft text-construction-foreground border-construction/30",
  aprovado: "bg-success-soft text-success border-success/30",
  em_execucao: "bg-primary text-primary-foreground border-primary",
  concluido: "bg-success text-success-foreground border-success",
};

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        styles[status],
        className,
      )}
    >
      {PROJECT_STATUS_LABEL[status]}
    </span>
  );
}

export function DemoTag() {
  return (
    <span className="inline-flex items-center rounded-full border border-construction/40 bg-construction-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-construction-foreground uppercase">
      Demonstração
    </span>
  );
}
