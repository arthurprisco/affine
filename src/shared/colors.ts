// export const colors = {
//   background: "#F5F4F0",
//   primary: "#293B51",
//   "primary-orange": "#FDB26D",
//   "orange-border": "#FF993B",
//   "orange-text": "#412402",
//   "orange-text-link": "#B05400",
//   // Texto escuro neutro (títulos)
//   ink: "#424242",
//   // Borda padrão de cards
//   line: "#D3D1C7",
//   // Escala de branco para conteúdo sobre `primary` (NavBar, TabBar, Drawer)
//   "on-primary": "rgba(255,255,255,0.75)",
//   "on-primary-subtle": "rgba(255,255,255,0.55)",
//   "on-primary-faint": "rgba(255,255,255,0.15)",
// };

// src/shared/colors.ts
// Fonte única das cores. Nomes pelo PAPEL, nunca pela aparência.
// Grupos: DEFAULT gera a classe base (bg-accent); as chaves geram sufixos (bg-accent-soft).
// Conteúdo sobre uma cor de fundo usa o grupo `on` (text-on-primary, text-on-accent).

export const colors = {
  // Fundo de toda tela
  background: "#F5F4F0",

  // Marca / estrutura: header, NavBar, TabBar, Drawer, progresso, botões de ícone
  primary: "#293B51",

  // Ação / atenção. Escasso: no máximo uma ação principal por tela.
  accent: {
    DEFAULT: "#FDB26D", // fundo da ação principal
    strong: "#FF993B", // borda de estado selecionado e badge de prazo
    text: "#B05400", // texto laranja legível sobre fundo claro (link, chip ativo)
    soft: "#F8E1CD", // fundo de estado selecionado e badge (pegar no Figma)
  },

  // Texto
  ink: {
    DEFAULT: "#424242", // títulos e texto principal
    muted: "#656565", // metadados ("90 dias · 5 etapas")
    placeholder: "#9A9A9A", // placeholder de input
  },

  // Linhas e bordas
  line: {
    DEFAULT: "#D3D1C7", // borda padrão de cards, linhas do título de seção
    input: "#9A9A9A", // borda de input/botão secundário, se for diferente
  },

  // Erro / perigo: mensagens de erro de campo em formulários
  danger: "#B3261E",

  // Camada que escurece a tela atrás de diálogos (Dialog, Select, ConfirmDialog)
  overlay: "rgba(0,0,0,0.5)",

  // Conteúdo sobre uma cor de fundo
  on: {
    primary: {
      DEFAULT: "rgba(255,255,255,0.75)", // ícones e texto na NavBar/TabBar/Drawer
      subtle: "rgba(255,255,255,0.55)", // itens inativos
      faint: "rgba(255,255,255,0.15)", // divisórias, fundos de hover/pressed
    },
    accent: "#412402", // texto sobre accent (botão principal)
    success: "#FFFFFF", // ícone de check sobre `success` (etapa concluída)
  },

  // TODO: cores ainda não cadastradas (pegar no Figma)
  surface: "#F9F9F9", // fundo de cards e inputs (branco?)
  success: "#4F7A3A", // etapas concluídas (barra segmentada e linha do tempo do lote)
  tag: "#D9D9D9", // fundo de etiqueta "Lote #..."
  track: "#D9D9D9", // trilho de barras de progresso
};
