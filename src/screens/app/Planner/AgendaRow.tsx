import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../../shared/colors";
import { stepDueLabel } from "../../../shared/batch";
import { formatDateBR, fromISODate } from "../../../shared/date";
import type { AgendaItem } from "./agenda";

type AgendaRowProps = {
  item: AgendaItem;
  /** Divisória abaixo (todas as linhas do card menos a última). */
  divider: boolean;
  /** Mostra a data prevista (na lista de atrasadas, que junta vários dias). */
  showDate?: boolean;
  onPress: () => void;
};

/** Uma etapa de lote na agenda. Tocar abre o lote. */
export function AgendaRow({
  item,
  divider,
  showDate = false,
  onPress,
}: AgendaRowProps) {
  const { batch, step, late } = item;
  const done = !!step.completedAt;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${step.name}, ${batch.recipe.name}, lote ${batch.code}`}
      accessibilityHint="Abre os detalhes do lote"
      className={
        divider
          ? "flex-row items-center gap-3 border-b border-line py-3 active:opacity-70"
          : "flex-row items-center gap-3 py-3 active:opacity-70"
      }
    >
      <View
        className={
          done
            ? "h-7 w-7 items-center justify-center rounded-full bg-success"
            : "h-7 w-7 items-center justify-center rounded-full bg-primary"
        }
      >
        {done ? (
          <Feather name="check" size={14} color={colors.on.success} />
        ) : (
          <Text className="font-body-medium text-xs text-on-primary">
            {step.position}
          </Text>
        )}
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="font-body-medium text-sm text-ink">{step.name}</Text>
        <Text className="font-body text-xs text-ink-muted">
          {batch.recipe.name} · Lote #{batch.code}
        </Text>
        {done ? (
          <Text className="font-body text-xs text-ink-muted">Concluída</Text>
        ) : late ? (
          <Text className="font-body text-xs text-accent-text">
            {stepDueLabel(step.plannedDate)}
            {showDate
              ? ` · ${formatDateBR(fromISODate(step.plannedDate))}`
              : ""}
          </Text>
        ) : null}
      </View>

      <Feather name="chevron-right" size={20} color={colors.line.DEFAULT} />
    </Pressable>
  );
}
