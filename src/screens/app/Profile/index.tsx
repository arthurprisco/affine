import { useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { authClient } from "../../../lib/auth-client";
import { styles } from "./style";

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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarWrap}><View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View><View style={styles.onlineDot} /></View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.memberSince}>Membro desde março de 2024</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Editar perfil" onPress={handleEditProfile} style={styles.editButton}><Text style={styles.editIcon}>↗</Text><Text style={styles.editButtonText}>Editar perfil</Text></Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações de Notificações</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notificações de lotes</Text>
            <Text style={styles.cardDescription}>Escolha quando deseja receber alertas sobre seus lotes.</Text>
            <View style={styles.frequencyRow}>
              {(["Imediatamente", "Diariamente", "Semanalmente"] as const).map((item) => (
                <Pressable key={item} onPress={() => setFrequency(item)} style={[styles.frequencyOption, frequency === item && styles.frequencyOptionActive]}><Text style={[styles.frequencyText, frequency === item && styles.frequencyTextActive]}>{item}</Text></Pressable>
              ))}
            </View>
          </View>
          <View style={styles.card}>
            {notificationTypes.map((item, index) => (
              <View key={item.key} style={[styles.notificationRow, index < notificationTypes.length - 1 && styles.notificationDivider]}>
                <View style={styles.notificationIcon}><Text style={styles.notificationIconText}>{item.icon}</Text></View>
                <View style={styles.notificationCopy}><Text style={styles.notificationTitle}>{item.title}</Text><Text style={styles.notificationDescription}>{item.description}</Text></View>
                <Switch value={enabled[item.key]} onValueChange={(value) => setEnabled((current) => ({ ...current, [item.key]: value }))} trackColor={{ false: "#DDE1EA", true: "#9AAABD" }} thumbColor={enabled[item.key] ? "#293B51" : "#FFFFFF"} accessibilityLabel={item.title} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.historyHeader}><Text style={styles.sectionTitle}>Histórico de Notificações</Text><Text style={styles.historyCount}>{history.length}</Text></View>
          <View style={styles.card}>
            {history.length ? history.map((item, index) => (
              <View key={item.title} style={[styles.historyRow, index < history.length - 1 && styles.notificationDivider]}>
                <View style={[styles.notificationIcon, !item.read && styles.unreadIcon]}><Text style={styles.notificationIconText}>{item.icon}</Text></View>
                <View style={styles.historyCopy}><View style={styles.historyTitleRow}><Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]}>{item.title}</Text>{!item.read && <View style={styles.unreadDot} />}</View><Text style={styles.notificationDescription}>{item.description}</Text><View style={styles.historyMeta}><Text style={styles.historyDate}>{item.date}</Text><Text style={styles.historyTime}>{item.time}</Text><Text style={[styles.readStatus, !item.read && styles.unreadStatus]}>{item.read ? "Lida" : "Não lida"}</Text></View></View>
              </View>
            )) : <View style={styles.emptyState}><Text style={styles.emptyIcon}>♧</Text><Text style={styles.emptyTitle}>Nenhuma notificação ainda</Text><Text style={styles.emptyDescription}>Quando receber alertas sobre seus lotes, eles aparecerão aqui.</Text></View>}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        {[{ icon: "⌂", label: "Início" }, { icon: "◇", label: "Lotes" }, { icon: "+", label: "Adicionar" }, { icon: "□", label: "Agenda" }, { icon: "♙", label: "Perfil" }].map((item) => (
          <Pressable key={item.label} accessibilityLabel={item.label} style={styles.navItem}>
            <Text style={[styles.navIcon, item.label === "Perfil" && styles.navIconActive]}>{item.icon}</Text>
            <Text style={[styles.navLabel, item.label === "Perfil" && styles.navLabelActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export { Profile };
