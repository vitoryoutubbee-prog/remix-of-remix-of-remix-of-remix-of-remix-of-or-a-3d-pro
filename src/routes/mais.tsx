import { createFileRoute, Link, type LinkProps } from "@tanstack/react-router";
import {
  Boxes,
  Building2,
  ChevronRight,
  FolderKanban,
  ListChecks,
  Settings,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ScreenHeader } from "@/components/ui-kit";

export const Route = createFileRoute("/mais")({
  head: () => ({
    meta: [
      { title: "Mais ferramentas — ORÇA 3D Construtor Pro" },
      {
        name: "description",
        content: "Checklists, banco de materiais, clientes, empresa e configurações do app.",
      },
      { property: "og:title", content: "Mais ferramentas — ORÇA 3D Construtor Pro" },
      {
        property: "og:description",
        content: "Acesse todas as ferramentas de gestão da sua construtora.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MorePage,
});

const groups: Array<{
  title: string;
  items: Array<{
    to: NonNullable<LinkProps["to"]>;
    label: string;
    desc: string;
    icon: typeof Boxes;
  }>;
}> = [
  {
    title: "Operação",
    items: [
      {
        to: "/checklists",
        label: "Checklists",
        desc: "Visita técnica, execução e entrega",
        icon: ListChecks,
      },
      {
        to: "/materiais",
        label: "Banco de materiais",
        desc: "Tabela de preços e fornecedores",
        icon: Boxes,
      },
      {
        to: "/projetos",
        label: "Projetos",
        desc: "Obras, ambientes e visualização 3D",
        icon: FolderKanban,
      },
    ],
  },
  {
    title: "Cadastros",
    items: [
      { to: "/clientes", label: "Clientes", desc: "Contatos e histórico", icon: Users },
      { to: "/empresa", label: "Empresa", desc: "Dados que saem na proposta", icon: Building2 },
      {
        to: "/configuracoes",
        label: "Configurações",
        desc: "Preferências e dados do app",
        icon: Settings,
      },
    ],
  },
];

function MorePage() {
  return (
    <AppShell>
      <ScreenHeader title="Mais" subtitle="Todas as ferramentas da sua operação." />

      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g.title}>
            <h2 className="mb-2 text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
              {g.title}
            </h2>
            <div className="surface-card divide-y divide-border overflow-hidden">
              {g.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 px-5 py-4 transition hover:bg-muted/50"
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-foreground">
                        {item.label}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.desc}
                      </span>
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
