export type ProjectStatus =
  | "rascunho"
  | "orcamento_enviado"
  | "em_negociacao"
  | "aprovado"
  | "em_execucao"
  | "concluido";

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  rascunho: "Rascunho",
  orcamento_enviado: "Orçamento enviado",
  em_negociacao: "Em negociação",
  aprovado: "Aprovado",
  em_execucao: "Em execução",
  concluido: "Concluído",
};

export type ProjectType =
  | "residencial"
  | "reforma"
  | "ampliacao"
  | "area_externa"
  | "comercial"
  | "outro";

export const PROJECT_TYPE_LABEL: Record<ProjectType, string> = {
  residencial: "Construção residencial",
  reforma: "Reforma",
  ampliacao: "Ampliação",
  area_externa: "Área externa",
  comercial: "Comercial",
  outro: "Outro",
};

export type Tier = "economica" | "padrao" | "premium";

export interface Company {
  name: string;
  owner: string;
  document: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  logoDataUrl?: string | undefined;
  instagram: string;
  website: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes?: string | undefined;
  demo?: boolean | undefined;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  dimensions: string;
  description: string;
  materials: string;
  finishes: string;
  notes: string;
  visualization?: Visualization | undefined;
  beforeImage?: string | undefined;
}

export type SceneItemKind =
  | "sofa"
  | "poltrona"
  | "mesaCentro"
  | "mesaJantar"
  | "cadeira"
  | "cama"
  | "estante"
  | "armario"
  | "balcao"
  | "tv"
  | "tapete"
  | "planta"
  | "luminaria"
  | "quadro"
  | "vaso"
  | "churrasqueira"
  | "piscina"
  | "espreguicadeira";

export interface SceneItem {
  id: string;
  kind: SceneItemKind;
  /** posição no piso, em metros, relativa ao centro do ambiente */
  x: number;
  z: number;
  /** rotação em radianos no eixo Y */
  rot: number;
  scale: number;
  color: string;
}

export type OpeningKind = "porta" | "portaJanela" | "janela" | "vao";

export interface Opening {
  id: string;
  /** índice da parede (segmento) da planta */
  wall: number;
  /** distância em metros do início da parede até o centro do vão */
  offset: number;
  width: number;
  height: number;
  /** altura do peitoril em metros (0 para portas) */
  sill: number;
  kind: OpeningKind;
}

export interface PlanPoint {
  x: number;
  z: number;
}

export interface RoomPlan {
  /** cantos do ambiente em metros, sentido horário, relativos ao centro */
  points: PlanPoint[];
  openings: Opening[];
  /** pé-direito em metros */
  height: number;
}

export interface Visualization {
  plan?: RoomPlan | undefined;
  floor: string;
  wallColor: string;
  cladding: string;
  door: string;
  window: string;
  lighting: string;
  furniture: string;
  facade: string;
  decor: string;
  items?: SceneItem[] | undefined;
  renderUrl?: string | undefined;
  renderStatus?: "not_configured" | "pending" | "ready" | undefined;
}

export interface MaterialItem {
  id: string;
  name: string;
  unit: string;
  qty: number;
  unitPrice: number;
}

export interface LaborItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface OtherCostItem {
  id: string;
  name: string;
  value: number;
}

export interface Budget {
  materials: MaterialItem[];
  labor: LaborItem[];
  equipment: EquipmentItem[];
  others: OtherCostItem[];
  marginPct: number;
  discountPct: number;
}

export interface BudgetVersion {
  tier: Tier;
  title: string;
  description: string;
  materials: string;
  finishes: string;
  multiplier: number;
}

export interface Proposal {
  scope: string;
  deadline: string;
  payment: string;
  validity: string;
  notes: string;
}

export interface HistoryEntry {
  id: string;
  at: string;
  title: string;
  detail?: string | undefined;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  phone: string;
  email: string;
  address: string;
  type: ProjectType;
  area: number;
  roomCount: number;
  notes: string;
  status: ProjectStatus;
  createdAt: string;
  demo?: boolean | undefined;
  rooms: Room[];
  budget: Budget;
  versions: BudgetVersion[];
  proposal: Proposal;
  history: HistoryEntry[];
}

export interface CatalogMaterial {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  supplier: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  stage: string;
  projectId?: string | undefined;
  items: ChecklistItem[];
  createdAt: string;
}

export interface AppState {
  company: Company;
  clients: Client[];
  projects: Project[];
  materialsCatalog: CatalogMaterial[];
  checklists: Checklist[];
  onboardingDone: boolean;
}
