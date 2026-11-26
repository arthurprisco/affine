import { Pressable, Text, View } from "react-native";
import type { Batch } from "../../api/batches";
import {
  BATCH_STATUS_LABELS,
  BATCH_UNIT_LABELS,
  batchStatus,
  completedCount,
  batchDeadlineLabel,
  maturationProgress,
} from "../../shared/batch";

type CardProductProps = {
  batch: Batch;
  onPress?: () => void;
};

/** Card de lote nas listas: receita, quantidade, prazo, maturação e etapas. */
export default function CardProduct({ batch, onPress }: CardProductProps) {
  const status = batchStatus(batch);
  const maturation = maturationProgress(batch);
  const done = completedCount(batch);
  const unit = BATCH_UNIT_LABELS[batch.unit] ?? batch.unit;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${batch.recipe.name}, lote ${batch.code}`}
      accessibilityHint="Abre os detalhes do lote"
      className="w-full gap-3 rounded-md border border-line bg-surface p-4 active:opacity-70"
    >
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1 items-start gap-1.5">
          <Text className="font-body-medium text-sm text-ink">
            {batch.recipe.name} · {batch.quantity} {unit}
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="rounded-sm bg-tag px-1.5 py-0.5">
              <Text className="font-body text-xs text-ink">
                Lote #{batch.code}
              </Text>
            </View>
            <Text className="font-body text-xs text-ink-muted">
              {BATCH_STATUS_LABELS[status]}
            </Text>
          </View>
        </View>

        {status === "atrasado" && (
          <View className="rounded-sm border border-accent-strong bg-accent-soft px-1.5 py-1">
            <Text className="font-body text-xs text-accent-text">
              {batchDeadlineLabel(batch)}
            </Text>
          </View>
        )}
      </View>

      <View className="gap-1">
        <View className="flex-row justify-between px-1">
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
        <Text className="px-1 text-right font-body text-xs text-ink-muted">
          {done}/{batch.steps.length} etapas
        </Text>
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
    </Pressable>
  );
}
