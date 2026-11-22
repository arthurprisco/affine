import { ReactNode, useState } from "react";
import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Title from "../../../components/Title";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { Chip } from "../../../components/Chip";
import { AddButton } from "../../../components/AddButton";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { SortableList } from "../../../components/SortableList";
import { RECIPE_CATEGORIES } from "../../../contexts/RecipesContext";
import { KeyboardScrollView } from "../../../components/KeyboardScrollView";
import { useNewRecipeForm } from "./useNewRecipeForm";
import { StepCard } from "./StepCard";

/** Bloco de formulário com label acima e erro abaixo. */
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-1.5">
      <Text className="font-body text-sm text-ink">{label}</Text>
      {children}
      {error && <Text className="font-body text-xs text-danger">{error}</Text>}
    </View>
  );
}

export default function NewRecipe() {
  const navigation = useNavigation();
  const form = useNewRecipeForm(() => navigation.goBack());
  const { values, errors } = form;
  // Travado enquanto o usuário arrasta uma etapa, para o scroll não competir.
  const [scrollEnabled, setScrollEnabled] = useState(true);
  // Cards de etapa começam recolhidos (só o nome); o usuário expande.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [stepToDelete, setStepToDelete] = useState<{
    id: string;
    index: number;
  } | null>(null);

  function toggleExpanded(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmDeleteStep() {
    if (!stepToDelete) return;
    form.removeStep(stepToDelete.id);
    setStepToDelete(null);
  }

  const stepToDeleteName = stepToDelete
    ? values.steps.find((step) => step.id === stepToDelete.id)?.name.trim()
    : undefined;

  return (
    <View className="flex-1 bg-background">
      <KeyboardScrollView
        contentContainerClassName="px-4 pt-6 pb-10"
        keyboardShouldPersistTaps="handled"
        scrollEnabled={scrollEnabled}
      >
        <Title label="Nova receita" />

        <View className="gap-4">
          <Input
            label="Nome"
            placeholder="Ex.: Queijo Canastra"
            value={values.name}
            onChangeText={form.setName}
            autoCapitalize="sentences"
            error={errors.name}
          />

          <Field label="Categoria" error={errors.category}>
            <View className="flex-row flex-wrap gap-2">
              {RECIPE_CATEGORIES.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  selected={values.category === category}
                  onPress={() => form.setCategory(category)}
                />
              ))}
            </View>
          </Field>

          <Input
            label="Descrição (opcional)"
            placeholder="Ex.: Queijo de leite cru, casca amarelada e massa macia"
            value={values.description}
            onChangeText={form.setDescription}
            multiline
          />

          <Field label="Etapas de produção" error={errors.steps}>
            <View className="gap-2">
              <SortableList
                data={values.steps}
                keyExtractor={(step) => step.id}
                onReorder={form.moveStep}
                onDragStateChange={(dragging) => setScrollEnabled(!dragging)}
                renderItem={({ item: step, index, dragHandle, isDragging }) => {
                  const stepErrors = errors.stepFields?.[step.id];
                  return (
                    <StepCard
                      step={step}
                      index={index}
                      errors={stepErrors}
                      // Abre sozinho se houver erro num campo escondido.
                      expanded={expanded.has(step.id) || !!stepErrors?.duration}
                      isDragging={isDragging}
                      dragHandle={dragHandle}
                      onToggle={() => toggleExpanded(step.id)}
                      onRemove={() => setStepToDelete({ id: step.id, index })}
                      onChange={(field, value) =>
                        form.updateStep(step.id, field, value)
                      }
                      onUnitChange={(unit) => form.setStepUnit(step.id, unit)}
                    />
                  );
                }}
              />
              <AddButton label="Adicionar etapa" onPress={form.addStep} />
            </View>
          </Field>
        </View>

        <Button label="Salvar receita" onPress={form.submit} />

        <ConfirmDialog
          visible={stepToDelete !== null}
          title={`Excluir etapa ${(stepToDelete?.index ?? 0) + 1}?`}
          message={
            stepToDeleteName
              ? `A etapa "${stepToDeleteName}" será removida desta receita.`
              : "Esta etapa será removida desta receita."
          }
          confirmLabel="Excluir"
          destructive
          onConfirm={confirmDeleteStep}
          onCancel={() => setStepToDelete(null)}
        />
      </KeyboardScrollView>
    </View>
  );
}
