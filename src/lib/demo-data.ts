import type { AppState, BudgetVersion, CatalogMaterial, Checklist, Project, Visualization } from "./types";

export const defaultVersions = (): BudgetVersion[] => [
  {
    tier: "economica",
    title: "Econômica",
    description: "Solução funcional com bom custo-benefício e prazo enxuto.",
    materials: "Porcelanato nacional 60x60, tinta acrílica standard, louças linha básica",
    finishes: "Rodapé em poliestireno, bancada em granito cinza, esquadrias em alumínio branco",
    multiplier: 0.82,
  },
  {
    tier: "padrao",
    title: "Padrão",
    description: "Equilíbrio entre estética, durabilidade e investimento.",
    materials: "Porcelanato acetinado 80x80, tinta acrílica premium, louças linha intermediária",
    finishes: "Marcenaria em MDF, bancada em quartzo, iluminação embutida em sanca",
    multiplier: 1,
  },
  {
    tier: "premium",
    title: "Premium",
    description: "Alto padrão de acabamento, design autoral e materiais nobres.",
    materials: "Porcelanato grande formato 120x120, marmoraria, metais com acabamento escovado",
    finishes: "Marcenaria planejada sob medida, iluminação cênica dimerizável, esquadrias em PVC acústico",
    multiplier: 1.34,
  },
];

const viz = (o: Partial<Visualization> = {}): Visualization => ({
  floor: "Porcelanato acetinado 80x80",
  wallColor: "#e8e3da",
  cladding: "Painel ripado amadeirado",
  door: "Pivotante em madeira",
  window: "Esquadria preta ampla",
  lighting: "Luz quente embutida",
  furniture: "Mobiliário contemporâneo",
  facade: "Concreto aparente + madeira",
  decor: "Plantas e quadros",
  renderStatus: "not_configured",
  ...o,
});

const demoProject = (): Project => ({
  id: "demo-casa-moderna",
  name: "Casa Moderna",
  clientId: "demo-joao",
  phone: "(11) 98877-1234",
  email: "joao.silva@email.com",
  address: "Rua das Acácias, 420 — Alphaville, Barueri/SP",
  type: "residencial",
  area: 145,
  roomCount: 6,
  notes:
    "Terreno plano, execução em 3 etapas. Cliente prioriza área gourmet integrada e fachada em concreto aparente.",
  status: "em_negociacao",
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 26).toISOString(),
  demo: true,
  rooms: [
    {
      id: "r1",
      name: "Sala de estar integrada",
      dimensions: "6,20 x 4,50 m",
      description: "Ambiente integrado à cozinha com pé-direito duplo parcial.",
      materials: "Porcelanato 80x80, drywall, painel ripado",
      finishes: "Sanca com LED, rodapé 15cm",
      notes: "Prever ponto elétrico para painel de TV.",
      visualization: viz(),
    },
    {
      id: "r2",
      name: "Cozinha",
      dimensions: "4,10 x 3,20 m",
      description: "Cozinha com ilha central e ligação direta à área gourmet.",
      materials: "Porcelanato, revestimento cerâmico, bancada em quartzo",
      finishes: "Marcenaria planejada, cuba em inox",
      notes: "Coifa com saída pela lateral.",
      visualization: viz({ wallColor: "#f2efe9", cladding: "Revestimento cerâmico 3D" }),
    },
    {
      id: "r3",
      name: "Área gourmet",
      dimensions: "5,00 x 3,60 m",
      description: "Espaço coberto com churrasqueira e bancada de apoio.",
      materials: "Deck cerâmico, tijolo aparente",
      finishes: "Pergolado metálico, iluminação cênica",
      notes: "Cliente quer vista para o jardim.",
      visualization: viz({ wallColor: "#d9cfc2", lighting: "Iluminação cênica externa" }),
    },
    {
      id: "r4",
      name: "Fachada",
      dimensions: "12,00 x 8,00 m",
      description: "Fachada frontal em dois volumes com muro em concreto.",
      materials: "Concreto aparente, madeira cumaru",
      finishes: "Portão pivotante, jardim linear",
      notes: "Prever iluminação de balizamento.",
      visualization: viz({ facade: "Concreto aparente + madeira cumaru" }),
    },
  ],
  budget: {
    materials: [
      { id: "m1", name: "Porcelanato acetinado 80x80", unit: "m²", qty: 145, unitPrice: 89.9 },
      { id: "m2", name: "Cimento CP-II 50kg", unit: "sc", qty: 180, unitPrice: 38.5 },
      { id: "m3", name: "Bloco estrutural 14x19x39", unit: "un", qty: 3200, unitPrice: 4.2 },
      { id: "m4", name: "Tinta acrílica premium 18L", unit: "lt", qty: 12, unitPrice: 389 },
      { id: "m5", name: "Esquadria de alumínio preto", unit: "m²", qty: 34, unitPrice: 1150 },
    ],
    labor: [
      { id: "l1", name: "Alvenaria estrutural", qty: 145, unitPrice: 210 },
      { id: "l2", name: "Instalações hidráulicas e elétricas", qty: 1, unitPrice: 28500 },
      { id: "l3", name: "Assentamento de revestimentos", qty: 145, unitPrice: 95 },
      { id: "l4", name: "Pintura geral", qty: 380, unitPrice: 32 },
    ],
    equipment: [
      { id: "e1", name: "Betoneira 400L (locação mensal)", qty: 4, unitPrice: 480 },
      { id: "e2", name: "Andaime fachadeiro (locação)", qty: 3, unitPrice: 1250 },
    ],
    others: [
      { id: "o1", name: "Projeto e ART", value: 6800 },
      { id: "o2", name: "Caçambas e limpeza de obra", value: 3400 },
    ],
    marginPct: 22,
    discountPct: 3,
  },
  versions: defaultVersions(),
  proposal: {
    scope:
      "Execução completa de residência unifamiliar de 145 m², incluindo fundação, estrutura, alvenaria, instalações, revestimentos, pintura, esquadrias e fachada, conforme projeto aprovado.",
    deadline: "7 meses a partir da assinatura do contrato",
    payment: "20% de entrada + 6 parcelas mensais conforme cronograma físico-financeiro",
    validity: "15 dias",
    notes:
      "Valores sujeitos a revisão em caso de alteração de escopo. Não inclui mobiliário solto e paisagismo.",
  },
  history: [
    { id: "h1", at: new Date(Date.now() - 86400000 * 26).toISOString(), title: "Projeto criado" },
    { id: "h2", at: new Date(Date.now() - 86400000 * 21).toISOString(), title: "Ambientes cadastrados", detail: "4 ambientes" },
    { id: "h3", at: new Date(Date.now() - 86400000 * 14).toISOString(), title: "Orçamento atualizado" },
    { id: "h4", at: new Date(Date.now() - 86400000 * 9).toISOString(), title: "Proposta gerada" },
    { id: "h5", at: new Date(Date.now() - 86400000 * 7).toISOString(), title: "Proposta enviada ao cliente" },
    { id: "h6", at: new Date(Date.now() - 86400000 * 3).toISOString(), title: "Cliente solicitou revisão de acabamentos" },
  ],
});

const demoProject2 = (): Project => ({
  id: "demo-reforma-apto",
  name: "Reforma Apartamento Vista Mar",
  clientId: "demo-marina",
  phone: "(13) 99614-8820",
  email: "marina.duarte@email.com",
  address: "Av. Beira Mar, 1180 — Santos/SP",
  type: "reforma",
  area: 92,
  roomCount: 4,
  notes: "Reforma com foco em integração sala/cozinha e troca completa de revestimentos.",
  status: "aprovado",
  createdAt: new Date(Date.now() - 86400000 * 48).toISOString(),
  demo: true,
  rooms: [
    {
      id: "r1",
      name: "Sala",
      dimensions: "5,40 x 3,80 m",
      description: "Integração com a cozinha e varanda.",
      materials: "Porcelanato, drywall",
      finishes: "Sanca de LED",
      notes: "",
      visualization: viz({ wallColor: "#eef1f4" }),
    },
    {
      id: "r2",
      name: "Banheiro social",
      dimensions: "2,40 x 1,80 m",
      description: "Troca completa de louças e metais.",
      materials: "Porcelanato, marmoraria",
      finishes: "Nicho embutido, box em vidro",
      notes: "",
      visualization: viz({ wallColor: "#e6e9ea" }),
    },
  ],
  budget: {
    materials: [
      { id: "m1", name: "Porcelanato 90x90", unit: "m²", qty: 92, unitPrice: 118 },
      { id: "m2", name: "Marcenaria planejada", unit: "vb", qty: 1, unitPrice: 34500 },
    ],
    labor: [
      { id: "l1", name: "Demolição e remoção", qty: 1, unitPrice: 9800 },
      { id: "l2", name: "Execução de reforma geral", qty: 92, unitPrice: 480 },
    ],
    equipment: [{ id: "e1", name: "Elevador de carga (locação)", qty: 2, unitPrice: 1600 }],
    others: [{ id: "o1", name: "Taxas de condomínio para obra", value: 1800 }],
    marginPct: 25,
    discountPct: 0,
  },
  versions: defaultVersions(),
  proposal: {
    scope: "Reforma completa de apartamento de 92 m² com integração de ambientes.",
    deadline: "90 dias",
    payment: "30% entrada + 3 parcelas",
    validity: "20 dias",
    notes: "",
  },
  history: [
    { id: "h1", at: new Date(Date.now() - 86400000 * 48).toISOString(), title: "Projeto criado" },
    { id: "h2", at: new Date(Date.now() - 86400000 * 30).toISOString(), title: "Proposta enviada" },
    { id: "h3", at: new Date(Date.now() - 86400000 * 22).toISOString(), title: "Cliente aprovou a proposta" },
  ],
});

export const initialState = (): AppState => ({
  company: {
    name: "Construtora Exemplo Ltda",
    owner: "Responsável Técnico",
    document: "00.000.000/0001-00",
    phone: "(11) 0000-0000",
    whatsapp: "(11) 90000-0000",
    email: "contato@suaempresa.com.br",
    address: "Sua cidade / UF",
    instagram: "@suaempresa",
    website: "www.suaempresa.com.br",
  },
  clients: [
    {
      id: "demo-joao",
      name: "João Silva",
      phone: "(11) 98877-1234",
      email: "joao.silva@email.com",
      address: "Alphaville, Barueri/SP",
      notes: "Indicação de cliente anterior.",
      demo: true,
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
    {
      id: "demo-marina",
      name: "Marina Duarte",
      phone: "(13) 99614-8820",
      email: "marina.duarte@email.com",
      address: "Santos/SP",
      demo: true,
      createdAt: new Date(Date.now() - 86400000 * 50).toISOString(),
    },
  ],
  projects: [demoProject(), demoProject2()],
  materialsCatalog: seedMaterials(),
  checklists: seedChecklists(),
  onboardingDone: false,
});

export function seedMaterials(): CatalogMaterial[] {
  const base = new Date(Date.now() - 86400000 * 10).toISOString();
  const rows: Array<[string, string, string, number, string]> = [
    ["Cimento CP-II 50kg", "Estrutura", "sc", 42.9, "Depósito Central"],
    ["Areia média lavada", "Estrutura", "m³", 135, "Areial São Jorge"],
    ["Brita 1", "Estrutura", "m³", 148, "Areial São Jorge"],
    ["Bloco cerâmico 14x19x39", "Alvenaria", "un", 3.25, "Cerâmica Vale"],
    ["Argamassa AC-III 20kg", "Revestimento", "sc", 32.5, "Depósito Central"],
    ["Porcelanato acetinado 80x80", "Revestimento", "m²", 89.9, "Casa dos Pisos"],
    ["Rejunte flexível 5kg", "Revestimento", "un", 28.4, "Casa dos Pisos"],
    ["Tinta acrílica premium 18L", "Pintura", "lt", 349, "Tintas Prime"],
    ["Massa corrida PVA 25kg", "Pintura", "sc", 62, "Tintas Prime"],
    ["Fio flexível 2,5mm (rolo 100m)", "Elétrica", "rl", 189, "Elétrica Norte"],
    ["Disjuntor bipolar 25A", "Elétrica", "un", 46.9, "Elétrica Norte"],
    ["Tubo PVC esgoto 100mm", "Hidráulica", "br", 74.5, "Hidro Sul"],
    ["Registro de gaveta 3/4", "Hidráulica", "un", 58.9, "Hidro Sul"],
    ["Telha fibrocimento 6mm", "Cobertura", "un", 68, "Coberturas MG"],
  ];
  return rows.map(([name, category, unit, price, supplier], i) => ({
    id: `mat-${i + 1}`,
    name,
    category,
    unit,
    price,
    supplier,
    createdAt: base,
  }));
}

export function seedChecklists(): Checklist[] {
  const at = new Date(Date.now() - 86400000 * 8).toISOString();
  const mk = (id: string, title: string, stage: string, items: string[]): Checklist => ({
    id,
    title,
    stage,
    items: items.map((text, i) => ({ id: `${id}-${i}`, text, done: false })),
    createdAt: at,
  });
  return [
    mk("chk-visita", "Visita técnica", "Pré-obra", [
      "Medir todos os ambientes",
      "Fotografar estado atual",
      "Checar padrão de energia",
      "Verificar acesso para materiais",
      "Registrar pedidos do cliente",
    ]),
    mk("chk-inicio", "Início de obra", "Execução", [
      "Contrato assinado",
      "ART/RRT emitida",
      "Canteiro e tapume montados",
      "Equipe definida e EPIs conferidos",
      "Cronograma validado com o cliente",
    ]),
    mk("chk-entrega", "Entrega final", "Pós-obra", [
      "Limpeza fina concluída",
      "Testes elétricos e hidráulicos",
      "Retoques de pintura",
      "Manual e garantias entregues",
      "Vistoria assinada pelo cliente",
    ]),
  ];
}
