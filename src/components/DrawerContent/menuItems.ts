import { Feather } from "@expo/vector-icons";
import type {
  AppStackParamList,
  AppTabParamList,
} from "../../routes/app.routes";

/** Destino de um item: uma aba do bottom-tabs ou uma tela do stack. */
export type MenuRoute =
  keyof AppTabParamList | Exclude<keyof AppStackParamList, "AppTabs">;

export type MenuItem = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  route: MenuRoute;
};

export const menuItems: MenuItem[] = [
  { label: "Início", icon: "home", route: "Home" },
  { label: "Todos os Lotes", icon: "box", route: "AllBatches" },
  { label: "Novo Lote", icon: "plus-square", route: "AddBatch" },
  { label: "Receitas", icon: "book-open", route: "Recipes" },
  { label: "Agenda", icon: "calendar", route: "Planner" },
  { label: "Perfil", icon: "user", route: "Profile" },
];

const TAB_ROUTES: ReadonlyArray<keyof AppTabParamList> = [
  "Home",
  "AllBatches",
  "AddBatch",
  "Planner",
  "Profile",
];

export function isTabRoute(route: MenuRoute): route is keyof AppTabParamList {
  return (TAB_ROUTES as ReadonlyArray<string>).includes(route);
}
