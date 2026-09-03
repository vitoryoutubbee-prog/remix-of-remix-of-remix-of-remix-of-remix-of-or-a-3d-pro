import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { PROJECT_TYPE_LABEL, type ProjectType } from "@/lib/types";

export const Route = createFileRoute("/projetos/novo")({
  head: () => ({
    meta: [
      { title: "Novo projeto — ORÇA 3D Construtor Pro" },
      { name: "description", content: "Cadastre uma nova obra com cliente, tipo, área e ambientes." },
      { property: "og:title", content: "Novo projeto — ORÇA 3D Construtor Pro" },
      { property: "og:description", content: "Comece um novo orçamento de obra em poucos campos." },
    ],
  }),
  component: NewProjectPage,
});

const field = "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary";

function NewProjectPage() {
  const { state, addClient, addProject } = useStore();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [clientId, setClientId] = useState(state.clients[0]?.id ?? "new");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState<ProjectType>("residencial");
  const [area, setArea] = useState("");
  const [roomCount, setRoomCount] = useState("");
  const [notes, setNotes] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    let id = clientId;
    if (clientId === "new") {
      if (!clientName.trim()) return;
      id = addClient({ name: clientName.trim(), phone, email, address }).id;
    }
    const project = addProject({
      name: name.trim(),
      clientId: id,
      phone,
      email,
      address,
      type,
      area: Number(area) || 0,
      roomCount: Number(roomCount) || 0,
      notes,
    });
    void navigate({ to: "/projetos/$id", params: { id: project.id } });
  };

  return (
    <AppShell>
      <PageHeader title="Novo projeto" subtitle="Informações básicas da obra e do cliente." />
      <form onSubmit={submit} className="surface-card grid max-w-3xl gap-4 p-6 sm:grid-cols-2">
        <label className="sm:col-span-2 text-sm font-medium">
          Nome do projeto
          <input className={`mt-1.5 ${field}`} value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label className="text-sm font-medium">
          Cliente
          <select className={`mt-1.5 ${field}`} value={clientId} onChange={(e) => setClientId(e.target.value)}>
            {state.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="new">+ Novo cliente</option>
          </select>
        </label>

        {clientId === "new" && (
          <label className="text-sm font-medium">
            Nome do cliente
            <input className={`mt-1.5 ${field}`} value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </label>
        )}

        <label className="text-sm font-medium">
          Telefone
          <input className={`mt-1.5 ${field}`} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className="text-sm font-medium">
          E-mail
          <input type="email" className={`mt-1.5 ${field}`} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="sm:col-span-2 text-sm font-medium">
          Endereço da obra
          <input className={`mt-1.5 ${field}`} value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>

        <label className="text-sm font-medium">
          Tipo
          <select className={`mt-1.5 ${field}`} value={type} onChange={(e) => setType(e.target.value as ProjectType)}>
            {Object.entries(PROJECT_TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Área (m²)
          <input type="number" className={`mt-1.5 ${field}`} value={area} onChange={(e) => setArea(e.target.value)} />
        </label>
        <label className="text-sm font-medium">
          Nº de ambientes
          <input
            type="number"
            className={`mt-1.5 ${field}`}
            value={roomCount}
            onChange={(e) => setRoomCount(e.target.value)}
          />
        </label>

        <label className="sm:col-span-2 text-sm font-medium">
          Observações
          <textarea rows={3} className={`mt-1.5 ${field}`} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            Criar projeto
          </button>
        </div>
      </form>
    </AppShell>
  );
}
