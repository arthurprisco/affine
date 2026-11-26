import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Title from "../../../components/Title";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { SpanMessage } from "../../../components/SpanMessage";
import { Recipe, useDeleteRecipe, useRecipe } from "../../../api/recipes";
import { ApiError, errorMessage } from "../../../lib/api";
import { colors } from "../../../shared/colors";
import { formatDateBR } from "../../../shared/date";
import {
  DURATION_UNIT_LABELS,
  formatTotalDuration,
  toMinutes,
  totalMinutes,
} from "../../../shared/duration";
import type { AppStackParamList } from "../../../routes/app.routes";

const MINUTES_PER_DAY = 60 * 24;

/** Bloco de destaque com os dados gerais da receita. */
function RecipeSummary({ recipe }: { recipe: Recipe }) {
  const stepsCount = recipe.steps.length;

  return (
    <View className="gap-3 rounded-lg border border-line bg-surface p-4">
      <View className="items-start gap-1.5">
        <Text className="font-body-semibold text-base text-ink">
          {recipe.name}
        </Text>
        <View className="rounded-sm bg-tag px-1.5 py-0.5">
          <Text className="font-body text-xs text-ink">{recipe.category}</Text>
        </View>
      </View>

      <Text
        className={
          recipe.description
            ? "font-body text-sm text-ink"
            : "font-body text-sm text-ink-muted"
        }
      >
        {recipe.description || "Sem descrição."}
      </Text>

      <View className="flex-row items-center gap-1.5">
        <Feather name="clock" size={14} color={colors.ink.muted} />
        <Text className="font-body text-xs text-ink-muted">
          {formatTotalDuration(totalMinutes(recipe.steps))} · {stepsCount}{" "}
          {stepsCount === 1 ? "etapa" : "etapas"}
        </Text>
      </View>

      <View className="border-t border-line pt-3">
        <Text className="font-body text-xs text-ink-muted">
          Criada em {formatDateBR(new Date(recipe.createdAt))}
        </Text>
      </View>
    </View>
  );
}

/** Lista das etapas em ordem, com o dia em que cada uma começa. */
function StepTimeline({ recipe }: { recipe: Recipe }) {
  let elapsed = 0;

  return (
    <View className="rounded-md border border-line bg-surface px-3">
      {recipe.steps.map((step, index) => {
        const startDay = Math.floor(elapsed / MINUTES_PER_DAY) + 1;
        elapsed += toMinutes(step.duration, step.durationUnit);
        const unit = DURATION_UNIT_LABELS[step.durationUnit].toLowerCase();

        return (
          <View
            key={step.id}
            className={
              index < recipe.steps.length - 1
                ? "flex-row items-start gap-3 border-b border-line py-3"
                : "flex-row items-start gap-3 py-3"
            }
          >
            <View className="h-7 w-7 items-center justify-center rounded-full bg-primary">
              <Text className="font-body-medium text-xs text-on-primary">
                {index + 1}
              </Text>
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="font-body-medium text-sm text-ink">
                {step.name}
              </Text>
              <Text className="font-body text-xs text-ink-muted">
                {step.duration} {unit}
              </Text>
              {step.description && (
                <Text className="mt-1 font-body text-xs text-ink">
                  {step.description}
                </Text>
              )}
            </View>
            <Text className="font-body text-2xs text-ink-muted">
              Dia {startDay}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/** Par de ações secundárias da receita: editar e excluir. */
function RecipeActions({
  onEdit,
  onDelete,
  deleting,
}: {
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <View className="flex-row gap-2">
      <Pressable
        onPress={onEdit}
        disabled={deleting}
        accessibilityRole="button"
        className="flex-1 flex-row items-center justify-center gap-2 rounded-sm border border-line-input bg-surface py-3"
      >
        <Feather name="edit-2" size={16} color={colors.ink.DEFAULT} />
        <Text className="font-body-medium text-sm text-ink">Editar</Text>
      </Pressable>
      <Pressable
        onPress={onDelete}
        disabled={deleting}
        accessibilityRole="button"
        accessibilityState={{ busy: deleting, disabled: deleting }}
        className={
          deleting
            ? "flex-1 flex-row items-center justify-center gap-2 rounded-sm border border-danger bg-surface py-3 opacity-60"
            : "flex-1 flex-row items-center justify-center gap-2 rounded-sm border border-danger bg-surface py-3"
        }
      >
        {deleting ? (
          <ActivityIndicator size="small" color={colors.danger} />
        ) : (
          <>
            <Feather name="trash-2" size={16} color={colors.danger} />
            <Text className="font-body-medium text-sm text-danger">
              Excluir
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

export default function RecipeDetail() {
  const { params } = useRoute<RouteProp<AppStackParamList, "RecipeDetail">>();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const deleteRecipe = useDeleteRecipe(params.id);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleDelete() {
    setConfirmingDelete(false);
    try {
      await deleteRecipe.mutateAsync();
    } catch {
      // a mensagem aparece via SpanMessage
      return;
    }
    navigation.goBack();
  }

  const {
    data: recipe,
    isPending,
    error,
    refetch,
    isRefetching,
  } = useRecipe(params.id);

  const notFound = error instanceof ApiError && error.status === 404;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-4 pt-6 pb-10"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <Title label="Receita" />

        {recipe ? (
          <>
            <RecipeSummary recipe={recipe} />
            <View className="mt-8">
              <Title label="Etapas" />
              <StepTimeline recipe={recipe} />
            </View>

            {deleteRecipe.error && (
              <View className="mt-6">
                <SpanMessage
                  type="error"
                  message={errorMessage(
                    deleteRecipe.error,
                    "Não foi possível excluir a receita.",
                  )}
                />
              </View>
            )}

            <View className="mt-6">
              <RecipeActions
                deleting={deleteRecipe.isPending}
                onEdit={() =>
                  navigation.navigate("EditRecipe", { id: recipe.id })
                }
                onDelete={() => setConfirmingDelete(true)}
              />
            </View>

            <ConfirmDialog
              visible={confirmingDelete}
              title="Excluir receita?"
              message={`A receita "${recipe.name}" e suas etapas serão excluídas. Esta ação não pode ser desfeita.`}
              confirmLabel="Excluir"
              destructive
              onConfirm={handleDelete}
              onCancel={() => setConfirmingDelete(false)}
            />
          </>
        ) : isPending ? (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View className="items-center gap-2 py-10">
            <Feather
              name={notFound ? "book-open" : "wifi-off"}
              size={28}
              color={colors.line.DEFAULT}
            />
            <Text className="text-center font-body text-sm text-ink-muted">
              {notFound
                ? "Receita não encontrada."
                : errorMessage(error, "Não foi possível carregar a receita.")}
            </Text>
            {!notFound && (
              <Pressable
                onPress={() => refetch()}
                accessibilityRole="button"
                hitSlop={8}
              >
                <Text className="font-body-medium text-sm text-accent-text">
                  Tentar novamente
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
