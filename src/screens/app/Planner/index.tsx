import { useMemo, useState } from "react";
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
import { useBatches } from "../../../api/batches";
import { errorMessage } from "../../../lib/api";
import { colors } from "../../../shared/colors";
import { daysUntil, startOfToday } from "../../../shared/batch";
import { WEEKDAY_NAMES, fromISODate, toISODate } from "../../../shared/date";
import type { AppStackParamList } from "../../../routes/app.routes";
import { AgendaItem, buildAgenda, overdueItems } from "./agenda";
import { AgendaRow } from "./AgendaRow";
import { WeekStrip } from "./WeekStrip";

const pad = (value: number) => String(value).padStart(2, "0");

/** "Hoje · 26/11", "Amanhã · 27/11", "Sexta · 28/11". */
function dayTitle(iso: string) {
  const date = fromISODate(iso);
  const short = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
  const days = daysUntil(iso);
  const name =
    days === 0
      ? "Hoje"
      : days === 1
        ? "Amanhã"
        : days === -1
          ? "Ontem"
          : WEEKDAY_NAMES[date.getDay()];
  return `${name} · ${short}`;
}

/** Card com as linhas de etapa. */
function AgendaList({
  items,
  showDate,
  onOpenBatch,
}: {
  items: AgendaItem[];
  showDate?: boolean;
  onOpenBatch: (id: string) => void;
}) {
  return (
    <View className="rounded-md border border-line bg-surface px-3">
      {items.map((item, index) => (
        <AgendaRow
          key={item.step.id}
          item={item}
          divider={index < items.length - 1}
          showDate={showDate}
          onPress={() => onOpenBatch(item.batch.id)}
        />
      ))}
    </View>
  );
}

export default function Planner() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {
    data: batches = [],
    isPending,
    error,
    refetch,
    isRefetching,
  } = useBatches();
  const todayISO = toISODate(startOfToday());
  const [selected, setSelected] = useState(todayISO);

  const agenda = useMemo(() => buildAgenda(batches), [batches]);
  const overdue = useMemo(() => overdueItems(agenda), [agenda]);
  const dayItems = agenda.get(selected) ?? [];
  // No dia de hoje, as atrasadas aparecem à parte; a lista do dia mostra só o que é de hoje.
  const showOverdue = selected === todayISO && overdue.length > 0;

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
            {errorMessage(error, "Não foi possível carregar a agenda.")}
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
          <Feather name="calendar" size={28} color={colors.line.DEFAULT} />
          <Text className="text-center font-body text-sm text-ink-muted">
            Você ainda não tem lotes. As etapas deles aparecem aqui.
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
        <View className="rounded-md border border-line bg-surface p-3">
          <WeekStrip
            selected={selected}
            agenda={agenda}
            onSelect={setSelected}
          />
        </View>

        {showOverdue && (
          <View className="mt-8">
            <Title label="Atrasadas" />
            <AgendaList items={overdue} showDate onOpenBatch={openBatch} />
          </View>
        )}

        <View className="mt-8">
          <Title label={dayTitle(selected)} />
          {dayItems.length ? (
            <AgendaList items={dayItems} onOpenBatch={openBatch} />
          ) : (
            <View className="items-center gap-2 rounded-md border border-line bg-surface py-8">
              <Feather name="coffee" size={24} color={colors.line.DEFAULT} />
              <Text className="font-body text-sm text-ink-muted">
                Nenhuma etapa prevista para este dia.
              </Text>
            </View>
          )}
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
        <Title label="Agenda" />
        {renderContent()}
      </ScrollView>
    </View>
  );
}
