import { useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { authClient } from "../../../lib/auth-client";

const notificationTypes = [
  { key: "maturation", icon: "◷", title: "Lembretes de maturação", description: "Avisos sobre lotes próximos do ponto ideal." },
  { key: "system", icon: "↻", title: "Atualizações do sistema", description: "Novidades e melhorias importantes do aplicativo." },
  { key: "reports", icon: "▥", title: "Relatórios", description: "Avisos quando novos relatórios estiverem disponíveis." },
  { key: "batches", icon: "□", title: "Atualizações de lotes", description: "Alterações importantes no status dos lotes." },
] as const;

const history = [
  { icon: "◷", title: "Lote pronto para avaliação", description: "O lote Maçãs Fuji atingiu o período ideal de maturação.", date: "Hoje", time: "09:42", read: false },
  { icon: "▥", title: "Relatório disponível", description: "O relatório semanal de maturação já está disponível.", date: "Ontem", time: "16:20", read: true },
  { icon: "□", title: "Atualização de lote", description: "O lote Queijo Serra da Estrela foi atualizado.", date: "12 mar", time: "11:05", read: true },
];

export default function Profile() {
  const { data } = authClient.useSession();
  const navigation = useNavigation<any>();
  const user = data?.user;
  const name = user?.name?.trim() || "Usuário";
  const initials = name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";
  const [frequency, setFrequency] = useState("Diariamente");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ maturation: true, system: true, reports: false, batches: true });

  function handleEditProfile() {
    navigation.navigate("EditProfile");
  }

  return (
    <View className="flex-1 bg-[#F7F8FC]">
      <ScrollView contentContainerClassName="pb-28" showsVerticalScrollIndicator={false}>
        <View className="items-center bg-white px-6 pb-7 pt-[30px]">
          <View className="relative mb-[14px] h-[88px] w-[88px]">
            <View className="h-full w-full items-center justify-center rounded-full bg-[#3E5570] shadow-lg shadow-primary/20">
              <Text className="text-[28px] font-semibold text-white">{initials}</Text>
            </View>
            <View className="absolute bottom-[2px] right-0 h-[18px] w-[18px] rounded-full border-[3px] border-white bg-[#46C88A]" />
          </View>
          <Text className="text-[22px] font-semibold text-[#172033]">{name}</Text>
          <Text className="mt-1 text-[13px] text-[#7C8495]">Membro desde março de 2024</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Editar perfil" onPress={handleEditProfile} className="mt-[17px] h-[42px] flex-row items-center rounded-xl bg-primary px-5">
            <Text className="mr-2 text-base text-white">↗</Text>
            <Text className="text-sm font-semibold text-white">Editar perfil</Text>
          </Pressable>
        </View>

        <View className="px-5 pt-6">
          <Text className="mb-3 text-base font-bold text-[#172033]">Configurações de Notificações</Text>
          <View className="overflow-hidden rounded-[17px] border border-[#E9ECF3] bg-white px-4">
            <Text className="mt-4 text-sm font-bold text-[#30394D]">Notificações de lotes</Text>
            <Text className="mt-[5px] text-xs leading-[18px] text-[#8991A1]">Escolha quando deseja receber alertas sobre seus lotes.</Text>
            <View className="mb-4 mt-[14px] flex-row gap-[7px]">
              {(["Imediatamente", "Diariamente", "Semanalmente"] as const).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setFrequency(item)}
                  className={`min-h-[36px] flex-1 items-center justify-center rounded-[9px] border px-[5px] ${frequency === item ? "border-primary bg-[#E8EDF3]" : "border-[#E3E6EF]"}`}
                >
                  <Text className={`text-center text-[11px] font-semibold ${frequency === item ? "text-primary" : "text-[#7C8495]"}`}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View className="mt-3 overflow-hidden rounded-[17px] border border-[#E9ECF3] bg-white px-4">
            {notificationTypes.map((item, index) => (
              <View key={item.key} className={`min-h-[76px] flex-row items-center py-[13px] ${index < notificationTypes.length - 1 ? "border-b border-[#EEF0F5]" : ""}`}>
                <View className="mr-[11px] h-[38px] w-[38px] items-center justify-center rounded-[11px] bg-[#E8EDF3]">
                  <Text className="text-lg font-bold text-primary">{item.icon}</Text>
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-[13px] font-semibold text-[#30394D]">{item.title}</Text>
                  <Text className="mt-[3px] text-[11px] leading-4 text-[#8B93A3]">{item.description}</Text>
                </View>
                <Switch value={enabled[item.key]} onValueChange={(value) => setEnabled((current) => ({ ...current, [item.key]: value }))} trackColor={{ false: "#DDE1EA", true: "#9AAABD" }} thumbColor={enabled[item.key] ? "#293B51" : "#FFFFFF"} accessibilityLabel={item.title} />
              </View>
            ))}
          </View>
        </View>

        <View className="px-5 pt-6">
          <View className="flex-row items-center justify-between">
            <Text className="mb-3 text-base font-bold text-[#172033]">Histórico de Notificações</Text>
            <Text className="mb-3 rounded-[10px] bg-[#E8EDF3] px-[9px] py-1 text-xs font-bold text-primary">{history.length}</Text>
          </View>
          <View className="overflow-hidden rounded-[17px] border border-[#E9ECF3] bg-white px-4">
            {history.length ? history.map((item, index) => (
              <View key={item.title} className={`min-h-[94px] flex-row items-start py-[14px] ${index < history.length - 1 ? "border-b border-[#EEF0F5]" : ""}`}>
                <View className={`mr-[11px] h-[38px] w-[38px] items-center justify-center rounded-[11px] ${!item.read ? "bg-[#DCE4ED]" : "bg-[#E8EDF3]"}`}>
                  <Text className="text-lg font-bold text-primary">{item.icon}</Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className={`text-[13px] ${!item.read ? "font-bold text-[#172033]" : "font-semibold text-[#30394D]"}`}>{item.title}</Text>
                    {!item.read && <View className="ml-[7px] h-[6px] w-[6px] rounded-full bg-primary" />}
                  </View>
                  <Text className="mt-[3px] text-[11px] leading-4 text-[#8B93A3]">{item.description}</Text>
                  <View className="mt-[7px] flex-row items-center gap-2">
                    <Text className="text-[10px] text-[#A0A7B4]">{item.date}</Text>
                    <Text className="text-[10px] text-[#A0A7B4]">{item.time}</Text>
                    <Text className={`text-[10px] font-semibold ${!item.read ? "text-primary" : "text-[#50A77A]"}`}>{item.read ? "Lida" : "Não lida"}</Text>
                  </View>
                </View>
              </View>
            )) : (
              <View className="items-center px-6 py-8">
                <Text className="mb-[9px] text-[30px] text-[#71859B]">♧</Text>
                <Text className="text-sm font-bold text-[#30394D]">Nenhuma notificação ainda</Text>
                <Text className="mt-[6px] text-center text-xs leading-[18px] text-[#8B93A3]">Quando receber alertas sobre seus lotes, eles aparecerão aqui.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-4 left-4 right-4 min-h-[72px] flex-row items-stretch justify-around rounded-[22px] bg-primary px-2 pb-2 pt-[9px] shadow-xl shadow-[#17283B]/20">
        {[{ icon: "⌂", label: "Início" }, { icon: "◇", label: "Lotes" }, { icon: "+", label: "Adicionar" }, { icon: "□", label: "Agenda" }, { icon: "♙", label: "Perfil" }].map((item) => {
          const active = item.label === "Perfil";
          return (
            <Pressable key={item.label} accessibilityLabel={item.label} className="min-w-[52px] flex-1 items-center justify-center">
              <Text className={`text-[25px] font-light leading-[28px] ${active ? "text-[#F0A45B]" : "text-white"}`}>{item.icon}</Text>
              <Text className={`mt-[2px] text-[11px] font-semibold ${active ? "text-[#F0A45B]" : "text-white"}`}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export { Profile };
