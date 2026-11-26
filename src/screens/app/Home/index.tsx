import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Title from "../../../components/Title";
import CardProduct from "../../../components/CardProduct";
import { Batch, BatchStep, useBatches } from "../../../api/batches";
import { errorMessage } from "../../../lib/api";
import { colors } from "../../../shared/colors";
import {
  batchStatus,
  currentStep,
  daysUntil,
  expectedEnd,
  stepDueLabel,
} from "../../../shared/batch";
import type { AppStackParamList } from "../../../routes/app.routes";

const HOME_BATCHES_LIMIT = 4;
/** Janela do contador "Etapas em N dias". */
const UPCOMING_STEPS_DAYS = 7;

type NextStep = { batch: Batch; step: BatchStep };

/** Números do painel e a etapa pendente mais urgente entre os lotes em produção. */
function summarize(batches: Batch[]) {
  let inProduction = 0;
  let ready = 0;
  let late = 0;
  let upcomingSteps = 0;
  let next: NextStep | null = null;

  for (const batch of batches) {
    const status = batchStatus(batch);
    if (status === "em_maturacao" || status === "atrasado") inProduction++;
    if (status === "atrasado") late++;
    if (status === "pronto") ready++;
    for (const step of batch.steps) {
      if (step.completedAt) continue;
      const days = daysUntil(step.plannedDate);
      if (days >= 0 && days <= UPCOMING_STEPS_DAYS) upcomingSteps++;
    }

    const step = currentStep(batch);
    if (step && (!next || step.plannedDate < next.step.plannedDate)) {
      next = { batch, step };
    }
  }

  return { inProduction, ready, late, upcomingSteps, next };
}

/** Lotes ainda em andamento, do que termina antes para o que termina depois. */
function upcomingBatches(batches: Batch[]) {
  const active = batches
    .filter((batch) => batchStatus(batch) !== "pronto")
    .sort((a, b) => expectedEnd(a).localeCompare(expectedEnd(b)));
  return (active.length ? active : batches).slice(0, HOME_BATCHES_LIMIT);
}

/** Contador do painel. Com `attention` e valor > 0, usa o visual de alerta. */
function StatTile({
  value,
  label,
  attention = false,
}: {
  value: number;
  label: string;
  attention?: boolean;
}) {
  const highlighted = attention && value > 0;

  return (
    <View
      className={
        highlighted
          ? "flex-1 gap-0.5 rounded-sm border border-accent-strong bg-accent-soft p-3"
          : "flex-1 gap-0.5 rounded-sm border border-line bg-background p-3"
      }
    >
      <Text
        className={
          highlighted
            ? "font-body-semibold text-lg text-accent-text"
            : "font-body-semibold text-lg text-ink"
        }
      >
        {value}
      </Text>
      <Text
        className={
          highlighted
            ? "font-body text-xs text-accent-text"
            : "font-body text-xs text-ink-muted"
        }
      >
        {label}
      </Text>
    </View>
  );
}

/** Bloco de destaque com os contadores e a próxima etapa a fazer. */
function Overview({
  batches,
  onOpenBatch,
}: {
  batches: Batch[];
  onOpenBatch: (id: string) => void;
}) {
  const summary = useMemo(() => summarize(batches), [batches]);
  const { next } = summary;

  return (
    <View className="gap-3 rounded-lg border border-line bg-surface p-4">
      <View className="flex-row gap-2">
        <StatTile value={summary.inProduction} label="Em produção" />
        <StatTile value={summary.ready} label="Prontos" />
      </View>
      <View className="flex-row gap-2">
        <StatTile value={summary.late} label="Etapas atrasadas" attention />
        <StatTile
          value={summary.upcomingSteps}
          label={`Etapas em ${UPCOMING_STEPS_DAYS} dias`}
        />
      </View>

      <Text className="font-body text-xs text-ink-muted">
        {batches.length} {batches.length === 1 ? "lote" : "lotes"} no total
      </Text>

      <View className="border-t border-line pt-3">
        {next ? (
          <Pressable
            onPress={() => onOpenBatch(next.batch.id)}
            accessibilityRole="button"
            accessibilityHint="Abre os detalhes do lote"
            className="flex-row items-center gap-3 active:opacity-70"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-primary">
              <Feather
                name="clock"
                size={16}
                color={colors.on.primary.DEFAULT}
              />
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="font-body text-xs text-ink-muted">
                Próxima etapa
              </Text>
              <Text className="font-body-medium text-sm text-ink">
                {next.step.name} · {next.batch.recipe.name}
              </Text>
              <Text
                className={
                  daysUntil(next.step.plannedDate) < 0
                    ? "font-body text-xs text-accent-text"
                    : "font-body text-xs text-ink-muted"
                }
              >
                Lote #{next.batch.code} · {stepDueLabel(next.step.plannedDate)}
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={colors.line.DEFAULT}
            />
          </Pressable>
        ) : (
          <Text className="font-body text-xs text-ink-muted">
            Nenhuma etapa pendente nos lotes em produção.
          </Text>
        )}
      </View>
    </View>
  );
}

export default function Home() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {
    data: batches = [],
    isPending,
    error,
    refetch,
    isRefetching,
  } = useBatches();

  const shown = useMemo(() => upcomingBatches(batches), [batches]);
  const openBatch = (id: string) => navigation.navigate("BatchDetail", { id });

  function renderContent() {
    if (isPending) {
      return (
        <View className="items-center py-10">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View className="items-center gap-2 py-10">
          <Feather name="wifi-off" size={28} color={colors.line.DEFAULT} />
          <Text className="text-center font-body text-sm text-ink-muted">
            {errorMessage(error, "Não foi possível carregar os lotes.")}
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
      );
    }

    if (!batches.length) {
      return (
        <View className="items-center gap-2 py-10">
          <Feather name="box" size={28} color={colors.line.DEFAULT} />
          <Text className="font-body text-sm text-ink-muted">
            Você ainda não tem lotes
          </Text>
          <Pressable
            onPress={() =>
              navigation.navigate("AppTabs", { screen: "AddBatch" })
            }
            accessibilityRole="button"
            hitSlop={8}
          >
            <Text className="font-body-medium text-sm text-accent-text">
              Cadastrar lote
            </Text>
          </Pressable>
        </View>
      );
    }

    return (
      <>
        <Overview batches={batches} onOpenBatch={openBatch} />

        <View className="mt-8">
          <Title label="Lotes" />
          <Pressable
            onPress={() =>
              navigation.navigate("AppTabs", { screen: "AllBatches" })
            }
            accessibilityRole="button"
            hitSlop={8}
            className="mb-2 flex-row items-center gap-0.5 self-end"
          >
            <Text className="font-body-medium text-sm text-accent-text">
              Ver todos
            </Text>
            <Feather
              name="chevron-right"
              size={16}
              color={colors.accent.text}
            />
          </Pressable>
          <View className="gap-2">
            {shown.map((batch) => (
              <CardProduct
                key={batch.id}
                batch={batch}
                onPress={() => openBatch(batch.id)}
              />
            ))}
          </View>
        </View>
      </>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        // a TabBar é absoluta: o fim do conteúdo precisa passar por baixo dela
        contentContainerClassName="px-4 pt-6 pb-28"
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
        <Title label="Visão geral" />
        {renderContent()}
      </ScrollView>
    </View>
  );
}
