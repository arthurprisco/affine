import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import Title from "../../../components/Title";
import { Button } from "../../../components/Button";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { SpanMessage } from "../../../components/SpanMessage";
import {
  Batch,
  BatchStep,
  useBatch,
  useSetStepCompleted,
} from "../../../api/batches";
import { ApiError, errorMessage } from "../../../lib/api";
import { colors } from "../../../shared/colors";
import { formatDateBR, fromISODate } from "../../../shared/date";
import { DURATION_UNIT_LABELS } from "../../../shared/duration";
import {
  BATCH_STATUS_LABELS,
  BATCH_UNIT_LABELS,
  batchStatus,
  completedCount,
  currentStep,
  daysUntil,
  expectedEnd,
  batchDeadlineLabel,
  lastCompletedStep,
  maturationProgress,
} from "../../../shared/batch";
import type { AppStackParamList } from "../../../routes/app.routes";
import { CompleteStepDialog } from "./CompleteStepDialog";

const formatISO = (iso: string) => formatDateBR(fromISODate(iso));

/** Linha "rótulo ............ valor" do bloco de datas. */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-body text-xs text-ink-muted">{label}</Text>
      <Text className="font-body-medium text-sm text-ink">{value}</Text>
    </View>
  );
}

/** Bloco de destaque com identificação, prazo e progresso do lote. */
function BatchSummary({ batch }: { batch: Batch }) {
  const status = batchStatus(batch);
  const maturation = maturationProgress(batch);
  const done = completedCount(batch);
  const pending = currentStep(batch);
  const unit = BATCH_UNIT_LABELS[batch.unit] ?? batch.unit;
  const late = status === "atrasado";

  return (
    <View className="gap-4 rounded-lg border border-line bg-surface p-4">
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1 items-start gap-1.5">
          <Text className="font-body-semibold text-base text-ink">
            {batch.recipe.name} · {batch.quantity} {unit}
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="rounded-sm bg-tag px-1.5 py-0.5">
              <Text className="font-body text-xs text-ink">
                Lote #{batch.code}
              </Text>
            </View>
            <Text className="font-body text-xs text-ink-muted">
              {batch.recipe.category}
            </Text>
          </View>
        </View>
        <View
          className={
            late
              ? "rounded-sm border border-accent-strong bg-accent-soft px-1.5 py-1"
              : "rounded-sm border border-line bg-surface px-1.5 py-1"
          }
        >
          <Text
            className={
              late
                ? "font-body text-xs text-accent-text"
                : "font-body text-xs text-ink-muted"
            }
          >
            {batchDeadlineLabel(batch)}
          </Text>
        </View>
      </View>

      <View className="gap-0.5">
        <Text className="font-body-medium text-sm text-ink">
          {BATCH_STATUS_LABELS[status]}
        </Text>
        <Text className="font-body text-xs text-ink-muted">
          {pending
            ? `Etapa atual: ${pending.name}`
            : "Todas as etapas concluídas."}
        </Text>
      </View>

      <View className="gap-1">
        <View className="flex-row justify-between">
          <Text className="font-body text-xs text-ink-muted">Maturação</Text>
          <Text className="font-body text-xs text-ink-muted">
            {maturation.elapsed}/{maturation.total} dias
          </Text>
        </View>
        <View className="h-1 w-full overflow-hidden rounded-sm bg-track">
          <View
            className="h-1 rounded-sm bg-primary"
            style={{ width: `${maturation.ratio * 100}%` }}
          />
        </View>
      </View>

      <View className="gap-1">
        <View className="flex-row justify-between">
          <Text className="font-body text-xs text-ink-muted">Etapas</Text>
          <Text className="font-body text-xs text-ink-muted">
            {done}/{batch.steps.length}
          </Text>
        </View>
        <View className="flex-row gap-1">
          {batch.steps.map((step) => (
            <View
              key={step.id}
              className={
                step.completedAt
                  ? "h-1 flex-1 rounded-sm bg-success"
                  : "h-1 flex-1 rounded-sm bg-track"
              }
            />
          ))}
        </View>
      </View>

      <View className="gap-2 border-t border-line pt-3">
        <InfoRow label="Início" value={formatISO(batch.startDate)} />
        <InfoRow
          label="Previsão de término"
          value={formatISO(expectedEnd(batch))}
        />
      </View>

      {batch.notes && (
        <View className="gap-1 border-t border-line pt-3">
          <Text className="font-body text-xs text-ink-muted">Observações</Text>
          <Text className="font-body text-sm text-ink">{batch.notes}</Text>
        </View>
      )}
    </View>
  );
}

/** Etapas do lote em ordem, com data prevista ou de conclusão. Só a última concluída pode ser desfeita. */
function BatchTimeline({
  batch,
  onUndo,
}: {
  batch: Batch;
  onUndo: (step: BatchStep) => void;
}) {
  const current = currentStep(batch);
  const lastDone = lastCompletedStep(batch);

  return (
    <View className="rounded-md border border-line bg-surface px-3">
      {batch.steps.map((step, index) => {
        const unit = DURATION_UNIT_LABELS[step.durationUnit].toLowerCase();
        // automáticas não atrasam: a API as conclui sozinhas na data prevista
        const late =
          !step.completedAt &&
          !step.autoAdvance &&
          daysUntil(step.plannedDate) < 0;
        const isCurrent = step.id === current?.id;

        return (
          <View
            key={step.id}
            className={
              index < batch.steps.length - 1
                ? "flex-row items-start gap-3 border-b border-line py-3"
                : "flex-row items-start gap-3 py-3"
            }
          >
            <View
              className={
                step.completedAt
                  ? "h-7 w-7 items-center justify-center rounded-full bg-success"
                  : "h-7 w-7 items-center justify-center rounded-full bg-primary"
              }
            >
              {step.completedAt ? (
                <Feather name="check" size={14} color={colors.on.success} />
              ) : (
                <Text className="font-body-medium text-xs text-on-primary">
                  {step.position}
                </Text>
              )}
            </View>
            <View className="flex-1 gap-0.5">
              <View className="flex-row items-center gap-1.5">
                <Text className="shrink font-body-medium text-sm text-ink">
                  {step.name}
                </Text>
                {step.autoAdvance && (
                  <Feather name="clock" size={12} color={colors.ink.muted} />
                )}
              </View>
              {isCurrent && (
                <Text className="font-body-medium text-xs text-accent-text">
                  Etapa atual
                </Text>
              )}
              <Text className="font-body text-xs text-ink-muted">
                {step.duration} {unit}
                {step.autoAdvance ? " · avança sozinha" : ""} ·{" "}
                {step.completedAt
                  ? `concluída em ${formatISO(step.completedAt)}`
                  : `prevista para ${formatISO(step.plannedDate)}`}
              </Text>
              {step.notes && (
                <Text className="mt-1 font-body text-xs text-ink">
                  {step.notes}
                </Text>
              )}
            </View>
            {late && (
              <View className="rounded-sm border border-accent-strong bg-accent-soft px-1.5 py-0.5">
                <Text className="font-body text-2xs text-accent-text">
                  Atrasada
                </Text>
              </View>
            )}
            {step.id === lastDone?.id && (
              <Pressable
                onPress={() => onUndo(step)}
                accessibilityRole="button"
                accessibilityLabel={`Desfazer ${step.name}`}
                hitSlop={8}
              >
                <Text className="font-body-medium text-xs text-accent-text">
                  Desfazer
                </Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
}

/** Ação principal: concluir a etapa atual. Sem botão para lote pronto ou que ainda não começou. */
function StepAction({
  batch,
  onComplete,
}: {
  batch: Batch;
  onComplete: (step: BatchStep) => void;
}) {
  const current = currentStep(batch);
  if (!current) return null;

  if (daysUntil(batch.startDate) > 0) {
    return (
      <Text className="mt-6 text-center font-body text-sm text-ink-muted">
        O lote começa em {formatISO(batch.startDate)}.
      </Text>
    );
  }

  return (
    <View>
      {current.autoAdvance && (
        <Text className="mt-6 text-center font-body text-xs text-ink-muted">
          {current.name} avança sozinha em {formatISO(current.plannedDate)}.
        </Text>
      )}
      <Button
        label={
          current.autoAdvance
            ? `Concluir agora: ${current.name}`
            : `Concluir etapa: ${current.name}`
        }
        onPress={() => onComplete(current)}
      />
    </View>
  );
}

export default function BatchDetail() {
  const { params } = useRoute<RouteProp<AppStackParamList, "BatchDetail">>();
  const {
    data: batch,
    isPending,
    error,
    refetch,
    isRefetching,
  } = useBatch(params.id);
  const setStepCompleted = useSetStepCompleted(params.id);
  const [stepToComplete, setStepToComplete] = useState<BatchStep | null>(null);
  const [stepToUndo, setStepToUndo] = useState<BatchStep | null>(null);
  const mutationError = setStepCompleted.error
    ? errorMessage(
        setStepCompleted.error,
        "Não foi possível atualizar a etapa.",
      )
    : null;

  function openComplete(step: BatchStep) {
    setStepCompleted.reset();
    setStepToComplete(step);
  }

  async function confirmComplete(notes: string) {
    if (!stepToComplete) return;
    try {
      await setStepCompleted.mutateAsync({
        stepId: stepToComplete.id,
        completed: true,
        notes: notes.trim() || undefined,
      });
      setStepToComplete(null);
    } catch {
      // o erro aparece dentro do diálogo
    }
  }

  async function confirmUndo() {
    const step = stepToUndo;
    setStepToUndo(null);
    if (!step) return;
    setStepCompleted.reset();
    try {
      await setStepCompleted.mutateAsync({ stepId: step.id, completed: false });
    } catch {
      // o erro aparece abaixo do resumo
    }
  }

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
        <Title label="Lote" />

        {batch ? (
          <>
            <BatchSummary batch={batch} />
            {mutationError && !stepToComplete && (
              <View className="mt-6">
                <SpanMessage type="error" message={mutationError} />
              </View>
            )}
            <StepAction batch={batch} onComplete={openComplete} />
            <View className="mt-8">
              <Title label="Etapas" />
              <BatchTimeline batch={batch} onUndo={setStepToUndo} />
            </View>

            <CompleteStepDialog
              step={stepToComplete}
              loading={setStepCompleted.isPending}
              error={mutationError}
              onConfirm={confirmComplete}
              onCancel={() => setStepToComplete(null)}
            />
            <ConfirmDialog
              visible={stepToUndo !== null}
              title={`Desfazer ${stepToUndo?.name ?? "etapa"}?`}
              message={
                stepToUndo?.autoAdvance
                  ? "As datas das etapas seguintes serão recalculadas. Ela passará a exigir confirmação neste lote."
                  : "As datas das etapas seguintes serão recalculadas."
              }
              confirmLabel="Desfazer"
              onConfirm={confirmUndo}
              onCancel={() => setStepToUndo(null)}
            />
          </>
        ) : isPending ? (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View className="items-center gap-2 py-10">
            <Feather
              name={notFound ? "box" : "wifi-off"}
              size={28}
              color={colors.line.DEFAULT}
            />
            <Text className="text-center font-body text-sm text-ink-muted">
              {notFound
                ? "Lote não encontrado."
                : errorMessage(error, "Não foi possível carregar o lote.")}
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
