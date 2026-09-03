import { Building2, Calculator, FolderKanban, X } from "lucide-react";
import { useStore } from "@/lib/store";

const steps = [
  { icon: Building2, title: "Cadastre sua empresa", text: "Dados e contato aparecem nas propostas." },
  { icon: FolderKanban, title: "Crie um projeto", text: "Ambientes, medidas e acabamentos." },
  { icon: Calculator, title: "Monte o orçamento", text: "Materiais, mão de obra e margem." },
];

export function Onboarding() {
  const { state, ready, setOnboardingDone } = useStore();
  if (!ready || state.onboardingDone) return null;

  return (
    <section className="surface-card relative mb-8 p-5">
      <button
        aria-label="Fechar introdução"
        onClick={() => setOnboardingDone(true)}
        className="absolute top-3 right-3 rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
      >
        <X className="size-4" />
      </button>
      <h2 className="font-display text-lg font-bold">Primeiros passos</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Três passos para enviar sua primeira proposta profissional.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-xl border border-border p-4">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Icon className="size-4.5" />
            </span>
            <p className="mt-3 text-sm font-semibold">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
