import { useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { authClient } from "../../../lib/auth-client";
import Title from "../../../components/Title";
import { colors } from "../../../shared/colors";

type FeatherIconName = ComponentProps<typeof Feather>["name"];

const frequencies = ["Imediatamente", "Diariamente", "Semanalmente"] as const;
type Frequency = (typeof frequencies)[number];

const notificationTypes: {
  key: string;
  icon: FeatherIconName;
  title: string;
  description: string;
}[] = [
  {
    key: "maturation",
    icon: "clock",
    title: "Lembretes de maturação",
    description: "Avisos sobre lotes próximos do ponto ideal.",
  },
  {
    key: "system",
    icon: "refresh-cw",
    title: "Atualizações do sistema",
    description: "Novidades e melhorias importantes do aplicativo.",
  },
  {
    key: "reports",
    icon: "bar-chart-2",
    title: "Relatórios",
    description: "Avisos quando novos relatórios estiverem disponíveis.",
  },
  {
    key: "batches",
    icon: "box",
    title: "Atualizações de lotes",
    description: "Alterações importantes no status dos lotes.",
  },
];

// Mock até existir a camada de notificações no backend
const history: {
  icon: FeatherIconName;
  title: string;
  description: string;
  date: string;
  time: string;
  read: boolean;
}[] = [
  {
    icon: "clock",
    title: "Lote pronto para avaliação",
    description: "O lote Maçãs Fuji atingiu o período ideal de maturação.",
    date: "Hoje",
    time: "09:42",
    read: false,
  },
  {
    icon: "bar-chart-2",
    title: "Relatório disponível",
    description: "O relatório semanal de maturação já está disponível.",
    date: "Ontem",
    time: "16:20",
    read: true,
  },
  {
    icon: "box",
    title: "Atualização de lote",
    description: "O lote Queijo Serra da Estrela foi atualizado.",
    date: "12 mar",
    time: "11:05",
    read: true,
  },
];

const months = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

function formatMemberSince(createdAt?: Date | string) {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  return `Membro desde ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

export default function Profile() {
  const { data } = authClient.useSession();
  const navigation = useNavigation<any>();
  const user = data?.user;
  const name = user?.name?.trim() || "Usuário";
  const memberSince = formatMemberSince(user?.createdAt);

  const [frequency, setFrequency] = useState<Frequency>("Diariamente");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    maturation: true,
    system: true,
    reports: false,
    batches: true,
  });

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="gap-6 px-4 pb-28 pt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Identificação */}
        <View className="items-center gap-3 rounded-md border border-line bg-surface p-4">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-primary">
            <Text className="font-body-semibold text-lg text-on-primary-strong">
              {getInitials(name)}
            </Text>
          </View>

          <View className="items-center gap-1">
            <Text className="font-body-medium text-base text-ink">{name}</Text>
            {user?.email && (
              <Text className="font-body text-xs text-ink-muted">
                {user.email}
              </Text>
            )}
            {memberSince && (
              <Text className="font-body text-xs text-ink-muted">
                {memberSince}
              </Text>
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar perfil"
            onPress={() => navigation.navigate("EditProfile")}
            className="w-full flex-row items-center justify-center gap-2 rounded-sm border border-line bg-surface py-3 active:opacity-70"
          >
            <Feather name="edit-2" size={16} color={colors.ink.DEFAULT} />
            <Text className="font-body-medium text-sm text-ink">
              Editar perfil
            </Text>
          </Pressable>
        </View>

        {/* Configurações de notificação */}
        <View className="gap-2">
          <Title label="Notificações" />

          <View className="gap-3 rounded-md border border-line bg-surface p-3">
            <View className="gap-1">
              <Text className="font-body-medium text-sm text-ink">
                Frequência dos alertas
              </Text>
              <Text className="font-body text-xs text-ink-muted">
                Escolha quando deseja receber alertas sobre seus lotes.
              </Text>
            </View>

            <View className="flex-row gap-2">
              {frequencies.map((item) => {
                const active = frequency === item;
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setFrequency(item)}
                    className={
                      active
                        ? "flex-1 items-center rounded-sm border border-accent-strong bg-accent-soft py-2"
                        : "flex-1 items-center rounded-sm border border-line bg-surface py-2"
                    }
                  >
                    <Text
                      className={
                        active
                          ? "font-body text-xs text-accent-text"
                          : "font-body text-xs text-ink-muted"
                      }
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="rounded-md border border-line bg-surface px-3">
            {notificationTypes.map((item, index) => (
              <View
                key={item.key}
                className={
                  index < notificationTypes.length - 1
                    ? "flex-row items-center gap-3 border-b border-line py-3"
                    : "flex-row items-center gap-3 py-3"
                }
              >
                <View className="h-9 w-9 items-center justify-center rounded-full bg-background">
                  <Feather name={item.icon} size={18} color={colors.primary} />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="font-body-medium text-sm text-ink">
                    {item.title}
                  </Text>
                  <Text className="font-body text-xs text-ink-muted">
                    {item.description}
                  </Text>
                </View>
                <Switch
                  value={enabled[item.key]}
                  onValueChange={(value) =>
                    setEnabled((current) => ({ ...current, [item.key]: value }))
                  }
                  trackColor={{
                    false: colors.line.DEFAULT,
                    true: colors.accent.DEFAULT,
                  }}
                  ios_backgroundColor={colors.line.DEFAULT}
                  accessibilityLabel={item.title}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Histórico */}
        <View className="gap-2">
          <Title label="Histórico" />

          <View className="rounded-md border border-line bg-surface px-3">
            {history.length ? (
              history.map((item, index) => (
                <View
                  key={item.title}
                  className={
                    index < history.length - 1
                      ? "flex-row items-start gap-3 border-b border-line py-3"
                      : "flex-row items-start gap-3 py-3"
                  }
                >
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-background">
                    <Feather
                      name={item.icon}
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <View className="flex-row items-center gap-2">
                      <Text className="flex-1 font-body-medium text-sm text-ink">
                        {item.title}
                      </Text>
                      {!item.read && (
                        <View className="h-2 w-2 rounded-full bg-accent" />
                      )}
                    </View>
                    <Text className="font-body text-xs text-ink-muted">
                      {item.description}
                    </Text>
                    <Text className="mt-1 font-body text-2xs text-ink-muted">
                      {item.date} · {item.time}
                      {item.read ? "" : " · Não lida"}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View className="items-center gap-1 py-8">
                <Feather
                  name="bell-off"
                  size={28}
                  color={colors.line.DEFAULT}
                />
                <Text className="mt-2 font-body-medium text-sm text-ink">
                  Nenhuma notificação ainda
                </Text>
                <Text className="text-center font-body text-xs text-ink-muted">
                  Quando receber alertas sobre seus lotes, eles aparecerão aqui.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
