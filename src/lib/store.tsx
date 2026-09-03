import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { initialState, defaultVersions, seedChecklists, seedMaterials } from "./demo-data";
import { emptyBudget } from "./budget";
import { uid } from "./format";
import type { AppState, CatalogMaterial, Checklist, Client, Company, Project } from "./types";

function normalize(s: AppState): AppState {
  return {
    ...s,
    materialsCatalog: s.materialsCatalog ?? seedMaterials(),
    checklists: s.checklists ?? seedChecklists(),
  };
}

const KEY = "orca3d.state.v1";

interface StoreValue {
  state: AppState;
  ready: boolean;
  setCompany: (c: Company) => void;
  addClient: (c: Omit<Client, "id" | "createdAt">) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  removeClient: (id: string) => void;
  addProject: (p: Partial<Project> & { name: string; clientId: string }) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  removeProject: (id: string) => void;
  addMaterial: (m: Omit<CatalogMaterial, "id" | "createdAt">) => CatalogMaterial;
  updateMaterial: (id: string, patch: Partial<CatalogMaterial>) => void;
  removeMaterial: (id: string) => void;
  addChecklist: (title: string, stage: string, items?: string[]) => Checklist;
  updateChecklist: (id: string, patch: Partial<Checklist>) => void;
  removeChecklist: (id: string) => void;
  logHistory: (projectId: string, title: string, detail?: string) => void;
  setOnboardingDone: (v: boolean) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => initialState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(normalize(JSON.parse(raw) as AppState));
    } catch {
      /* ignore corrupted state */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, ready]);

  const logHistory = useCallback((projectId: string, title: string, detail?: string) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) =>
        p.id === projectId
          ? { ...p, history: [...p.history, { id: uid(), at: new Date().toISOString(), title, detail }] }
          : p,
      ),
    }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      ready,
      setCompany: (company) => setState((s) => ({ ...s, company })),
      addClient: (c) => {
        const client: Client = { ...c, id: uid(), createdAt: new Date().toISOString() };
        setState((s) => ({ ...s, clients: [client, ...s.clients] }));
        return client;
      },
      updateClient: (id, patch) =>
        setState((s) => ({
          ...s,
          clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeClient: (id) =>
        setState((s) => ({ ...s, clients: s.clients.filter((c) => c.id !== id) })),
      addProject: (p) => {
        const project: Project = {
          id: uid(),
          phone: "",
          email: "",
          address: "",
          type: "residencial",
          area: 0,
          roomCount: 0,
          notes: "",
          status: "rascunho",
          createdAt: new Date().toISOString(),
          rooms: [],
          budget: emptyBudget(),
          versions: defaultVersions(),
          proposal: {
            scope: "",
            deadline: "",
            payment: "",
            validity: "15 dias",
            notes: "",
          },
          history: [{ id: uid(), at: new Date().toISOString(), title: "Projeto criado" }],
          ...p,
        };
        setState((s) => ({ ...s, projects: [project, ...s.projects] }));
        return project;
      },
      updateProject: (id, patch) =>
        setState((s) => ({
          ...s,
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removeProject: (id) =>
        setState((s) => ({ ...s, projects: s.projects.filter((p) => p.id !== id) })),
      addMaterial: (m) => {
        const material: CatalogMaterial = { ...m, id: uid(), createdAt: new Date().toISOString() };
        setState((s) => ({ ...s, materialsCatalog: [material, ...s.materialsCatalog] }));
        return material;
      },
      updateMaterial: (id, patch) =>
        setState((s) => ({
          ...s,
          materialsCatalog: s.materialsCatalog.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      removeMaterial: (id) =>
        setState((s) => ({ ...s, materialsCatalog: s.materialsCatalog.filter((m) => m.id !== id) })),
      addChecklist: (title, stage, items = []) => {
        const list: Checklist = {
          id: uid(),
          title,
          stage,
          items: items.map((text) => ({ id: uid(), text, done: false })),
          createdAt: new Date().toISOString(),
        };
        setState((s) => ({ ...s, checklists: [list, ...s.checklists] }));
        return list;
      },
      updateChecklist: (id, patch) =>
        setState((s) => ({
          ...s,
          checklists: s.checklists.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeChecklist: (id) =>
        setState((s) => ({ ...s, checklists: s.checklists.filter((c) => c.id !== id) })),
      logHistory,
      setOnboardingDone: (v) => setState((s) => ({ ...s, onboardingDone: v })),
      resetDemo: () => setState(initialState()),
    }),
    [state, ready, logHistory],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore deve ser usado dentro de StoreProvider");
  return ctx;
}

export function useProject(id: string) {
  const { state } = useStore();
  return state.projects.find((p) => p.id === id);
}

export function useClientName(id: string) {
  const { state } = useStore();
  return state.clients.find((c) => c.id === id)?.name ?? "Cliente não informado";
}
