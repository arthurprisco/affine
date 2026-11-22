import { createContext, ReactNode, useContext, useState } from "react";
import { DurationUnit } from "../shared/duration";

export type Step = {
  id: string;
  name: string;
  description?: string;
  duration: number;
  durationUnit: DurationUnit;
};

export type Recipe = {
  id: string;
  name: string;
  category: string;
  description?: string;
  steps: Step[];
};

export type NewRecipe = Omit<Recipe, "id">;

export const RECIPE_CATEGORIES = ["Queijo", "Vinho", "Embutido", "Outro"];

type RecipesContextValue = {
  recipes: Recipe[];
  addRecipe: (recipe: NewRecipe) => Recipe;
};

/** Atalho para os dados de exemplo: [nome, duração, unidade]. */
function steps(...items: [string, number, DurationUnit][]): Step[] {
  return items.map(([name, duration, durationUnit], index) => ({
    id: String(index + 1),
    name,
    duration,
    durationUnit,
  }));
}

// Maquete: ainda não existe camada de dados para receitas. O estado vive só
// em memória e é perdido ao fechar o app.
const INITIAL_RECIPES: Recipe[] = [
  {
    id: "1",
    name: "Queijo Canastra",
    category: "Queijo",
    steps: steps(
      ["Aquecer o leite a 35 °C", 30, "minutos"],
      ["Adicionar pingo e coalho", 40, "minutos"],
      ["Cortar a coalhada", 15, "minutos"],
      ["Enformar e prensar", 12, "horas"],
      ["Salgar e maturar", 22, "dias"],
    ),
  },
  {
    id: "2",
    name: "Queijo Minas Padrão",
    category: "Queijo",
    steps: steps(
      ["Pasteurizar o leite", 30, "minutos"],
      ["Coagular", 45, "minutos"],
      ["Enformar", 2, "horas"],
      ["Maturar", 20, "dias"],
    ),
  },
  {
    id: "3",
    name: "Parmesão Artesanal",
    category: "Queijo",
    steps: steps(
      ["Coagular", 30, "minutos"],
      ["Cozinhar a massa", 1, "horas"],
      ["Prensar", 1, "dias"],
      ["Salmoura", 2, "semanas"],
      ["Maturar", 6, "meses"],
      ["Virar periodicamente", 6, "meses"],
    ),
  },
  {
    id: "4",
    name: "Vinho Tinto Seco",
    category: "Vinho",
    steps: steps(
      ["Desengaçar e esmagar", 3, "horas"],
      ["Fermentar", 2, "semanas"],
      ["Prensar", 1, "dias"],
      ["Envelhecer", 1, "anos"],
    ),
  },
  {
    id: "5",
    name: "Vinho Rosé",
    category: "Vinho",
    steps: steps(
      ["Esmagar", 2, "horas"],
      ["Maceração curta", 12, "horas"],
      ["Fermentar", 3, "semanas"],
      ["Engarrafar", 1, "dias"],
    ),
  },
];

const RecipesContext = createContext<RecipesContextValue | null>(null);

export function RecipesProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);

  function addRecipe(recipe: NewRecipe) {
    const created: Recipe = { ...recipe, id: Date.now().toString() };
    setRecipes((current) => [created, ...current]);
    return created;
  }

  return (
    <RecipesContext.Provider value={{ recipes, addRecipe }}>
      {children}
    </RecipesContext.Provider>
  );
}

export function useRecipes() {
  const context = useContext(RecipesContext);
  if (!context) {
    throw new Error("useRecipes precisa estar dentro de <RecipesProvider>.");
  }
  return context;
}
