import { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Title from "../../../components/Title";
import { Input } from "../../../components/Input";
import { Select } from "../../../components/Select";
import { Chip } from "../../../components/Chip";
import { Button } from "../../../components/Button";
import { SpanMessage } from "../../../components/SpanMessage";
import { KeyboardScrollView } from "../../../components/KeyboardScrollView";
import { useRecipes } from "../../../api/recipes";
import { useBatches } from "../../../api/batches";
import { errorMessage } from "../../../lib/api";
import { colors } from "../../../shared/colors";
import { formatDateBR, maskDateBR } from "../../../shared/date";
import { DURATION_UNIT_LABELS } from "../../../shared/duration";
import type { AppStackParamList } from "../../../routes/app.routes";
import { BATCH_UNITS, useAddBatchForm } from "./useAddBatchForm";

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

export default function AddBatch() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {
    data: recipes = [],
    isPending,
    error: recipesError,
    refetch,
  } = useRecipes();
  const { data: batches = [] } = useBatches();
  const form = useAddBatchForm(recipes, batches, (batch) =>
    navigation.navigate("BatchDetail", { id: batch.id }),
  );
  const { values, errors } = form;

  function renderRecipeField() {
    if (isPending) {
      return (
        <Field label="Receita">
          <View className="h-11 flex-row items-center gap-2 rounded-sm border border-line-input bg-surface px-3">
            <ActivityIndicator size="small" color={colors.primary} />
            <Text className="font-body text-sm text-ink-placeholder">
              Carregando receitas...
            </Text>
          </View>
        </Field>
      );
    }

    if (recipesError) {
      return (
        <Field label="Receita">
          <View className="items-start gap-1 rounded-sm border border-line bg-surface p-3">
            <Text className="font-body text-sm text-ink-muted">
              {errorMessage(
                recipesError,
                "Não foi possível carregar as receitas.",
              )}
            </Text>
            <Pressable
              onPress={() => refetch()}
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text className="font-body-medium text-sm text-accent-text">
                Tentar novamente
              </Text>
            </Pressable>
          </View>
        </Field>
      );
    }

    if (!recipes.length) {
      return (
        <Field label="Receita" error={errors.recipe}>
          <View className="items-start gap-1 rounded-sm border border-line bg-surface p-3">
            <Text className="font-body text-sm text-ink-muted">
              Você ainda não tem receitas. Todo lote nasce de uma receita.
            </Text>
            <Pressable
              onPress={() => navigation.navigate("NewRecipe")}
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text className="font-body-medium text-sm text-accent-text">
                Cadastrar receita
              </Text>
            </Pressable>
          </View>
        </Field>
      );
    }

    return (
      <Select
        label="Receita"
        title="Escolha a receita"
        placeholder="Selecione a receita"
        value={values.recipeId}
        options={recipes.map((recipe) => ({
          value: recipe.id,
          label: `${recipe.name} · ${recipe.category}`,
        }))}
        onChange={form.selectRecipe}
        error={errors.recipe}
      />
    );
  }

  return (
    <View className="flex-1 bg-background">
      <KeyboardScrollView
        contentContainerClassName="px-4 pt-6 pb-28"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Title label="Novo lote" />

        <View className="gap-4">
          {renderRecipeField()}

          <Input
            label="Código do lote"
            placeholder="Ex.: 2026QJ102"
            value={values.code}
            onChangeText={form.setCode}
            autoCapitalize="characters"
            autoCorrect={false}
            error={errors.code}
          />

          <Input
            label="Quantidade"
            placeholder="Ex.: 20"
            value={values.quantity}
            onChangeText={form.setQuantity}
            keyboardType="decimal-pad"
            error={errors.quantity}
          />

          <Field label="Unidade">
            <View className="flex-row flex-wrap gap-2">
              {BATCH_UNITS.map((item) => (
                <Chip
                  key={item.value}
                  label={item.label}
                  selected={values.unit === item.value}
                  onPress={() => form.setUnit(item.value)}
                />
              ))}
            </View>
          </Field>

          <Input
            label="Início"
            placeholder="DD/MM/AAAA"
            value={values.startDate}
            onChangeText={(text) => form.setStartDate(maskDateBR(text))}
            keyboardType="number-pad"
            maxLength={10}
            error={errors.startDate}
          />

          <Input
            label="Observações (opcional)"
            placeholder="Ex.: Leite da ordenha da manhã, tanque 2"
            value={values.notes}
            onChangeText={form.setNotes}
            multiline
          />
        </View>

        {/* Cronograma previsto a partir das etapas da receita */}
        {form.recipe && (
          <View className="mt-8">
            <Title label="Etapas" />
            <View className="gap-3 rounded-md border border-line bg-surface p-3">
              {form.plannedSteps.length ? (
                form.plannedSteps.map((step) => (
                  <View
                    key={step.position}
                    className="flex-row items-center gap-3"
                  >
                    <View className="h-7 w-7 items-center justify-center rounded-full bg-primary">
                      <Text className="font-body-medium text-xs text-on-primary">
                        {step.position}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-body-medium text-sm text-ink">
                        {step.name}
                      </Text>
                      <Text className="font-body text-xs text-ink-muted">
                        {step.duration}{" "}
                        {DURATION_UNIT_LABELS[step.durationUnit].toLowerCase()}{" "}
                        · até {formatDateBR(step.plannedDate)}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text className="font-body text-xs text-ink-muted">
                  Informe uma data de início válida para ver o cronograma.
                </Text>
              )}

              {form.expectedEnd && (
                <View className="flex-row items-center justify-between border-t border-line pt-3">
                  <Text className="font-body text-xs text-ink-muted">
                    Previsão de término
                  </Text>
                  <Text className="font-body-medium text-sm text-ink">
                    {formatDateBR(form.expectedEnd)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {form.submitError && (
          <View className="mt-6">
            <SpanMessage type="error" message={form.submitError} />
          </View>
        )}

        <Button
          label="Cadastrar lote"
          onPress={form.submit}
          loading={form.saving}
        />
      </KeyboardScrollView>
    </View>
  );
}
