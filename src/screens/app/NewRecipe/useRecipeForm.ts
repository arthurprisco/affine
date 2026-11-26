import { useRef, useState } from "react";
import {
  Recipe,
  RecipeInput,
  useCreateRecipe,
  useUpdateRecipe,
} from "../../../api/recipes";
import { errorMessage } from "../../../lib/api";
import { DurationUnit } from "../../../shared/duration";

/** Etapa em edição: a duração ainda é o texto digitado no campo. */
export type StepDraft = {
  id: string;
  name: string;
  description: string;
  duration: string;
  durationUnit: DurationUnit;
};

export type StepField = keyof Omit<StepDraft, "id" | "durationUnit">;

export type StepErrors = { name?: string; duration?: string };

export type FormErrors = {
  name?: string;
  category?: string;
  steps?: string;
  /** Erros por etapa, indexados pelo `id` da etapa. */
  stepFields?: Record<string, StepErrors>;
};

const DEFAULT_UNIT: DurationUnit = "dias";

/**
 * Estado e validação do formulário de receita. Sem `recipe`, cria uma nova;
 * com `recipe`, abre preenchido e salva por cima dela (PUT).
 */
export function useRecipeForm(onSaved: () => void, recipe?: Recipe) {
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe(recipe?.id ?? "");
  const mutation = recipe ? updateRecipe : createRecipe;

  // Ids locais estáveis para os cards de etapa (usados como `key`).
  const nextId = useRef(1);
  const newStep = (): StepDraft => ({
    id: String(nextId.current++),
    name: "",
    description: "",
    duration: "",
    durationUnit: DEFAULT_UNIT,
  });

  const [name, setName] = useState(recipe?.name ?? "");
  const [category, setCategory] = useState<string | null>(
    recipe?.category ?? null,
  );
  const [description, setDescription] = useState(recipe?.description ?? "");
  const [steps, setSteps] = useState<StepDraft[]>(() =>
    recipe && recipe.steps.length > 0
      ? recipe.steps.map((step) => ({
          ...newStep(),
          name: step.name,
          description: step.description ?? "",
          duration: String(step.duration),
          durationUnit: step.durationUnit,
        }))
      : [newStep()],
  );
  const [errors, setErrors] = useState<FormErrors>({});

  function addStep() {
    setSteps((list) => [...list, newStep()]);
  }

  function updateStep(id: string, field: StepField, value: string) {
    setSteps((list) =>
      list.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  function setStepUnit(id: string, durationUnit: DurationUnit) {
    setSteps((list) =>
      list.map((item) => (item.id === id ? { ...item, durationUnit } : item)),
    );
  }

  function removeStep(id: string) {
    setSteps((list) => list.filter((item) => item.id !== id));
  }

  function moveStep(from: number, to: number) {
    setSteps((list) => {
      if (to < 0 || to >= list.length || from === to) return list;
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function validate(): RecipeInput | null {
    const nextErrors: FormErrors = {};
    const stepFields: Record<string, StepErrors> = {};

    const trimmedName = name.trim();
    if (!trimmedName) nextErrors.name = "Informe o nome da receita.";

    if (!category) nextErrors.category = "Escolha uma categoria.";

    // Cards totalmente vazios são descartados; preenchidos pela metade, não.
    const filledSteps = steps
      .map((item) => ({
        ...item,
        name: item.name.trim(),
        description: item.description.trim(),
        duration: item.duration.trim(),
      }))
      .filter((item) => item.name || item.description || item.duration);

    const validSteps: RecipeInput["steps"] = [];
    for (const item of filledSteps) {
      const fieldErrors: StepErrors = {};
      if (!item.name) fieldErrors.name = "Informe o nome da etapa.";

      const duration = Number(item.duration);
      if (!/^\d+$/.test(item.duration) || duration < 1) {
        fieldErrors.duration = "Informe um número inteiro (mín. 1).";
      }

      if (fieldErrors.name || fieldErrors.duration) {
        stepFields[item.id] = fieldErrors;
      } else {
        validSteps.push({
          name: item.name,
          description: item.description || undefined,
          duration,
          durationUnit: item.durationUnit,
        });
      }
    }

    if (filledSteps.length === 0) {
      nextErrors.steps = "Adicione pelo menos uma etapa de produção.";
    }
    if (Object.keys(stepFields).length > 0) nextErrors.stepFields = stepFields;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return null;

    return {
      name: trimmedName,
      category: category!,
      description: description.trim() || undefined,
      steps: validSteps,
    };
  }

  async function submit() {
    if (mutation.isPending) return false;
    const input = validate();
    if (!input) return false;

    try {
      await mutation.mutateAsync(input);
    } catch {
      // a mensagem aparece via `submitError`
      return false;
    }
    onSaved();
    return true;
  }

  return {
    values: { name, category, description, steps },
    setName,
    setCategory,
    setDescription,
    addStep,
    updateStep,
    setStepUnit,
    removeStep,
    moveStep,
    errors,
    submit,
    saving: mutation.isPending,
    submitError: mutation.error
      ? errorMessage(mutation.error, "Não foi possível salvar a receita.")
      : null,
  };
}
