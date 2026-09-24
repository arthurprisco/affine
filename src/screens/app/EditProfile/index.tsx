import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { authClient } from "../../../lib/auth-client";
import { styles } from "./style";

export default function EditProfile() {
  const navigation = useNavigation<any>();
  const { data } = authClient.useSession();
  const user = data?.user;
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Nome obrigatório", "Informe seu nome para continuar.");
      return;
    }

    const nextEmail = email.trim().toLowerCase();
    const emailChanged = nextEmail !== user?.email?.toLowerCase();
    const passwordChanged = Boolean(currentPassword || newPassword || confirmPassword);
    if (emailChanged && (!nextEmail || !nextEmail.includes("@"))) {
      Alert.alert("E-mail inválido", "Informe um e-mail válido.");
      return;
    }
    if (passwordChanged && (!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword)) {
      Alert.alert("Senha inválida", "Informe a senha atual, uma nova senha com pelo menos 8 caracteres e confirme a nova senha.");
      return;
    }

    try {
      setSaving(true);
      const profileResult = await authClient.updateUser({ name: trimmedName });
      if (profileResult.error) throw new Error(profileResult.error.message ?? "Não foi possível salvar o perfil.");
      if (emailChanged) {
        const emailResult = await authClient.changeEmail({ newEmail: nextEmail });
        if (emailResult.error) throw new Error(emailResult.error.message ?? "Não foi possível alterar o e-mail.");
      }
      if (passwordChanged) {
        const passwordResult = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
        if (passwordResult.error) throw new Error(passwordResult.error.message ?? "Não foi possível alterar a senha.");
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Alterações salvas", "Suas informações foram atualizadas com sucesso.");
    } catch {
      Alert.alert("Erro ao salvar", "Verifique sua conexão e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar para o perfil" onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.navTitle}>Editar perfil</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatar}><Text style={styles.avatarText}>{name.trim().split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U"}</Text></View>
        <Text style={styles.helper}>Atualize seus dados pessoais</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Digite seu nome" placeholderTextColor="#8795A5" style={styles.input} autoCapitalize="words" returnKeyType="done" />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <Text style={styles.fieldHint}>Será necessário confirmar o novo endereço por e-mail.</Text>
        </View>
        <View style={styles.securitySection}>
          <Text style={styles.sectionTitle}>Alterar senha</Text>
          <Text style={styles.sectionHint}>Use uma senha forte com pelo menos 8 caracteres.</Text>
          <TextInput value={currentPassword} onChangeText={setCurrentPassword} placeholder="Senha atual" placeholderTextColor="#8795A5" style={styles.input} secureTextEntry autoCapitalize="none" />
          <TextInput value={newPassword} onChangeText={setNewPassword} placeholder="Nova senha" placeholderTextColor="#8795A5" style={styles.inputSpacing} secureTextEntry autoCapitalize="none" />
          <TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirmar nova senha" placeholderTextColor="#8795A5" style={styles.inputSpacing} secureTextEntry autoCapitalize="none" />
        </View>
        <Pressable accessibilityRole="button" onPress={handleSave} disabled={saving} style={[styles.saveButton, saving && styles.disabledButton]}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>Salvar alterações</Text>}
        </Pressable>
      </ScrollView>

    </View>
  );
}
