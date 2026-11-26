import { useMemo, useState } from "react";
import { Recipe } from "../../../api/recipes";
import { Batch, useCreateBatch } from "../../../api/batches";
import { errorMessage } from "../../../lib/api";
import { toMinutes } from "../../../shared/duration";
import {
  addMinutes,
  formatDateBR,
  parseDateBR,
  toISODate,
} from "../../../shared/date";

export const BATCH_UNITS = [
  { value: "un", label: "Unidades" },
  { value: "kg", label: "Kg" },
  { value: "L", label: "Litros" },
];

/** Prefixo do código do lote por categoria de receita (ex.: 2026QJ001). */
const CODE_PREFIX: Record<string, string> = {
  Queijo: "QJ",
  Vinho: "VN",
  Embutido: "EB",
};

export type BatchFormErrors = {
  recipe?: string;
  code?: string;
  quantity?: string;
  startDate?: string;
};

/**
 * Prévia do cronograma na tela, acumulando as durações a partir do início.
 * As datas gravadas são calculadas pela API (arredondadas para dias inteiros).
 */
export function planSteps(recipe: Recipe, start: Date) {
  let elapsed = 0;
  return [...recipe.steps]
    .sort((a, b) => a.position - b.position)
    .map((step, index) => {
      elapsed += toMinutes(step.duration, step.durationUnit);
      return {
        position: index + 1,
        name: step.name,
        duration: step.duration,
        durationUnit: step.durationUnit,
        plannedDate: addMinutes(start, elapsed),
      };
    });
}

function generateCode(recipe: Recipe, sequence: number) {
  const prefix = CODE_PREFIX[recipe.category] ?? "LT";
  return `${new Date().getFullYear()}${prefix}${String(sequence).padStart(3, "0")}`;
}

/**
 * Estado e validação do formulário de lote. `batches` (lotes já existentes) serve para
 * sugerir o próximo código e avisar código repetido antes de chamar a API.
 */
export function useAddBatchForm(
  recipes: Recipe[],
  batches: Batch[],
  onCreated: (batch: Batch) => void,
) {
  const createBatch = useCreateBatch();

  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [code, setCodeState] = useState("");
  // Enquanto o usuário não mexer no código, ele acompanha a receita escolhida.
  const [codeEdited, setCodeEdited] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState(BATCH_UNITS[0].value);
  const [startDate, setStartDate] = useState(() => formatDateBR(new Date()));
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<BatchFormErrors>({});

  const recipe = recipes.find((item) => item.id === recipeId) ?? null;
  const start = parseDateBR(startDate);

  const plannedSteps = useMemo(() => {
    const parsed = parseDateBR(startDate);
    return recipe && parsed ? planSteps(recipe, parsed) : [];
  }, [recipe, startDate]);
  const expectedEnd = plannedSteps.at(-1)?.plannedDate ?? null;

  function selectRecipe(id: string) {
    setRecipeId(id);
    const selected = recipes.find((item) => item.id === id);
    if (selected && !codeEdited)
      setCodeState(generateCode(selected, batches.length + 1));
  }

  function setCode(value: string) {
    setCodeEdited(true);
    setCodeState(value.toUpperCase());
  }

  function validate() {
    const next: BatchFormErrors = {};
    const parsedQuantity = Number(quantity.replace(",", "."));
    const trimmedCode = code.trim();

    if (!recipe) next.recipe = "Escolha a receita do lote.";
    if (!trimmedCode) next.code = "Informe o código do lote.";
    else if (batches.some((batch) => batch.code === trimmedCode))
      next.code = "Já existe um lote com esse código.";
    if (!quantity.trim() || !(parsedQuantity > 0))
      next.quantity = "Informe uma quantidade maior que zero.";
    if (!start) next.startDate = "Informe uma data válida (DD/MM/AAAA).";

    setErrors(next);
    if (Object.keys(next).length || !recipe || !start) return null;
    return { recipe, start, parsedQuantity, trimmedCode };
  }

  function reset() {
    setRecipeId(null);
    setCodeState("");
    setCodeEdited(false);
    setQuantity("");
    setUnit(BATCH_UNITS[0].value);
    setStartDate(formatDateBR(new Date()));
    setNotes("");
    setErrors({});
  }

  async function submit() {
    if (createBatch.isPending) return;
    const valid = validate();
    if (!valid) return;

    let created: Batch;
    try {
      created = await createBatch.mutateAsync({
        recipeId: valid.recipe.id,
        code: valid.trimmedCode,
        quantity: valid.parsedQuantity,
        unit,
        startDate: toISODate(valid.start),
        notes: notes.trim() || undefined,
      });
    } catch {
      // a mensagem aparece via `submitError`
      return;
    }
    reset();
    createBatch.reset();
    onCreated(created);
  }

  return {
    values: {
      recipeId,
      code,
      quantity,
      unit,
      startDate,
      notes,
    },
    recipe,
    plannedSteps,
    expectedEnd,
    selectRecipe,
    setCode,
    setQuantity,
    setUnit,
    setStartDate,
    setNotes,
    errors,
    submit,
    saving: createBatch.isPending,
    submitError: createBatch.error
      ? errorMessage(createBatch.error, "Não foi possível cadastrar o lote.")
      : null,
  };
}
