import { Feather } from "@expo/vector-icons";
import type { AppTabParamList } from "../../routes/app.routes";

export type MenuItem = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  route: keyof AppTabParamList;
};

export const menuItems: MenuItem[] = [
  { label: "Início", icon: "home", route: "Home" },
  { label: "Todos os Lotes", icon: "box", route: "AllBatches" },
  { label: "Novo Lote", icon: "plus-square", route: "AddBatch" },
  { label: "Agenda", icon: "calendar", route: "Planner" },
  { label: "Perfil", icon: "user", route: "Profile" },
];
