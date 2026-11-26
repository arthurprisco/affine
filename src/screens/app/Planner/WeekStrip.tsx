import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../../shared/colors";
import {
  MONTH_NAMES,
  WEEKDAY_NAMES,
  WEEKDAY_SHORT,
  addDays,
  fromISODate,
  startOfWeek,
  toISODate,
} from "../../../shared/date";
import { startOfToday } from "../../../shared/batch";
import { AgendaItem, DayMarker, dayMarker } from "./agenda";

type WeekStripProps = {
  /** Dia selecionado, AAAA-MM-DD. A semana exibida é a dele. */
  selected: string;
  agenda: Map<string, AgendaItem[]>;
  onSelect: (iso: string) => void;
};

const MARKER_CLASS: Record<DayMarker, string> = {
  late: "h-1.5 w-1.5 rounded-full bg-accent-strong",
  pending: "h-1.5 w-1.5 rounded-full bg-primary",
  done: "h-1.5 w-1.5 rounded-full bg-success",
};

/** Botão de ícone para trocar de semana. */
function WeekArrow({
  direction,
  onPress,
}: {
  direction: "left" | "right";
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        direction === "left" ? "Semana anterior" : "Próxima semana"
      }
      hitSlop={8}
      className="h-8 w-8 items-center justify-center rounded-sm border border-line bg-surface active:opacity-70"
    >
      <Feather
        name={direction === "left" ? "chevron-left" : "chevron-right"}
        size={18}
        color={colors.primary}
      />
    </Pressable>
  );
}

/** Calendário de uma semana (segunda a domingo) com marcador nos dias que têm etapas. */
export function WeekStrip({ selected, agenda, onSelect }: WeekStripProps) {
  const selectedDate = fromISODate(selected);
  const monday = startOfWeek(selectedDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const today = startOfToday();
  const todayISO = toISODate(today);
  const showingCurrentWeek =
    toISODate(startOfWeek(today)) === toISODate(monday);

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        <WeekArrow
          direction="left"
          onPress={() => onSelect(toISODate(addDays(selectedDate, -7)))}
        />
        <Text className="flex-1 text-center font-body-medium text-sm text-ink">
          {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </Text>
        <WeekArrow
          direction="right"
          onPress={() => onSelect(toISODate(addDays(selectedDate, 7)))}
        />
      </View>

      <View className="flex-row gap-1">
        {days.map((day) => {
          const iso = toISODate(day);
          const isSelected = iso === selected;
          const isToday = iso === todayISO;
          const items = agenda.get(iso);
          const marker = dayMarker(items);
          const count = items?.length ?? 0;

          return (
            <Pressable
              key={iso}
              onPress={() => onSelect(iso)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${WEEKDAY_NAMES[day.getDay()]}, ${day.getDate()} de ${MONTH_NAMES[day.getMonth()].toLowerCase()}${isToday ? ", hoje" : ""}, ${count} ${count === 1 ? "etapa" : "etapas"}`}
              className={
                isSelected
                  ? "flex-1 items-center gap-1 rounded-sm border border-accent-strong bg-accent-soft py-2"
                  : "flex-1 items-center gap-1 rounded-sm border border-transparent py-2 active:opacity-70"
              }
            >
              <Text
                className={
                  isSelected
                    ? "font-body text-2xs text-accent-text"
                    : "font-body text-2xs text-ink-muted"
                }
              >
                {WEEKDAY_SHORT[day.getDay()]}
              </Text>
              <Text
                className={
                  isSelected
                    ? "font-body-semibold text-sm text-accent-text"
                    : isToday
                      ? "font-body-semibold text-sm text-primary"
                      : "font-body-medium text-sm text-ink"
                }
              >
                {day.getDate()}
              </Text>
              <View className={marker ? MARKER_CLASS[marker] : "h-1.5 w-1.5"} />
            </Pressable>
          );
        })}
      </View>

      {!showingCurrentWeek && (
        <Pressable
          onPress={() => onSelect(todayISO)}
          accessibilityRole="button"
          hitSlop={8}
          className="self-center"
        >
          <Text className="font-body-medium text-sm text-accent-text">
            Voltar para hoje
          </Text>
        </Pressable>
      )}
    </View>
  );
}
