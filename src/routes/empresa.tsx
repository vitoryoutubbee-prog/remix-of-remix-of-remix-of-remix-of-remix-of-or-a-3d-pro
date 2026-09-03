import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import type { Company } from "@/lib/types";

export const Route = createFileRoute("/empresa")({
  head: () => ({
    meta: [
      { title: "Minha Empresa — ORÇA 3D Construtor Pro" },
      { name: "description", content: "Dados da construtora usados nas propostas enviadas aos clientes." },
      { property: "og:title", content: "Minha Empresa — ORÇA 3D Construtor Pro" },
      { property: "og:description", content: "Personalize os dados que aparecem nas suas propostas comerciais." },
    ],
  }),
  component: CompanyPage,
});

const field = "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary";

const fields: [keyof Company, string][] = [
  ["name", "Nome da empresa"],
  ["owner", "Responsável técnico"],
  ["document", "CNPJ / CPF"],
  ["phone", "Telefone"],
  ["whatsapp", "WhatsApp"],
  ["email", "E-mail"],
  ["address", "Endereço"],
  ["instagram", "Instagram"],
  ["website", "Site"],
];

function CompanyPage() {
  const { state, setCompany } = useStore();
  const [form, setForm] = useState<Company>(state.company);
  const [saved, setSaved] = useState(false);

  return (
    <AppShell>
      <PageHeader title="Minha Empresa" subtitle="Esses dados aparecem no cabeçalho das propostas." />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setCompany(form);
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        }}
        className="surface-card grid max-w-3xl gap-4 p-6 sm:grid-cols-2"
      >
        {fields.map(([key, label]) => (
          <label key={key} className="text-sm font-medium">
            {label}
            <input
              className={`mt-1.5 ${field}`}
              value={(form[key] as string) ?? ""}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}
        <div className="sm:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            Salvar dados
          </button>
          {saved && <span className="text-sm font-medium text-success">Dados salvos.</span>}
        </div>
      </form>
    </AppShell>
  );
}
