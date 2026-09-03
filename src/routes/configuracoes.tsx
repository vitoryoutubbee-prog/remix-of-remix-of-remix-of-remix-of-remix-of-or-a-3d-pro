import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — ORÇA 3D Construtor Pro" },
      { name: "description", content: "Preferências do aplicativo, dados de demonstração e reinício do sistema." },
      { property: "og:title", content: "Configurações — ORÇA 3D Construtor Pro" },
      { property: "og:description", content: "Gerencie dados de demonstração e preferências do aplicativo." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { state, resetDemo, setOnboardingDone } = useStore();

  return (
    <AppShell>
      <PageHeader title="Configurações" subtitle="Dados de demonstração e preferências." />

      <div className="grid max-w-3xl gap-4">
        <section className="surface-card p-5">
          <h2 className="font-display text-base font-bold">Guia de primeiros passos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Reexibe o passo a passo inicial no painel.
          </p>
          <button
            onClick={() => setOnboardingDone(false)}
            className="mt-4 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            Mostrar novamente
          </button>
        </section>

        <section className="surface-card p-5">
          <h2 className="font-display text-base font-bold">Dados do aplicativo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {state.projects.length} projetos e {state.clients.length} clientes salvos neste navegador.
          </p>
          <button
            onClick={() => {
              if (confirm("Isso apaga tudo e restaura os dados de demonstração. Continuar?")) resetDemo();
            }}
            className="mt-4 rounded-lg bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground transition hover:brightness-110"
          >
            Restaurar dados de demonstração
          </button>
        </section>
      </div>
    </AppShell>
  );
}
