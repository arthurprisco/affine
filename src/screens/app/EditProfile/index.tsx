import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { authClient } from "../../../lib/auth-client";

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

  const inputClass =
    "min-h-[52px] rounded-[14px] border border-[#D5DDE7] bg-white px-4 text-base text-primary";

  return (
    <View className="flex-1 bg-[#F7F9FC]">
      <View className="min-h-[92px] flex-row items-center justify-center bg-primary px-5 pt-[38px]">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar para o perfil"
          onPress={() => navigation.goBack()}
          className="absolute bottom-2 left-4 h-10 w-10 items-center justify-center"
        >
          <Text className="text-[34px] font-light leading-[36px] text-white">‹</Text>
        </Pressable>
        <Text className="text-lg font-bold text-white">Editar perfil</Text>
      </View>
      <ScrollView
        contentContainerClassName="items-stretch p-6 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mt-3 h-[104px] w-[104px] items-center justify-center self-center rounded-full bg-[#3E5570]">
          <Text className="text-[32px] font-bold text-white">
            {name.trim().split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U"}
          </Text>
        </View>
        <Text className="mb-8 mt-[14px] text-center text-sm text-[#718095]">
          Atualize seus dados pessoais
        </Text>
        <View className="mb-[22px]">
          <Text className="mb-2 text-sm font-bold text-primary">Nome completo</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Digite seu nome" placeholderTextColor="#8795A5" className={inputClass} autoCapitalize="words" returnKeyType="done" />
        </View>
        <View className="mb-[22px]">
          <Text className="mb-2 text-sm font-bold text-primary">E-mail</Text>
          <TextInput value={email} onChangeText={setEmail} className={inputClass} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <Text className="mt-[7px] text-xs leading-[17px] text-[#8795A5]">
            Será necessário confirmar o novo endereço por e-mail.
          </Text>
        </View>
        <View className="mb-[10px] mt-[6px] border-t border-[#E1E7EE] pt-[22px]">
          <Text className="mb-[6px] text-lg font-bold text-primary">Alterar senha</Text>
          <Text className="mb-[14px] text-[13px] leading-[18px] text-[#718095]">
            Use uma senha forte com pelo menos 8 caracteres.
          </Text>
          <TextInput value={currentPassword} onChangeText={setCurrentPassword} placeholder="Senha atual" placeholderTextColor="#8795A5" className={inputClass} secureTextEntry autoCapitalize="none" />
          <TextInput value={newPassword} onChangeText={setNewPassword} placeholder="Nova senha" placeholderTextColor="#8795A5" className={`${inputClass} mt-[10px]`} secureTextEntry autoCapitalize="none" />
          <TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirmar nova senha" placeholderTextColor="#8795A5" className={`${inputClass} mt-[10px]`} secureTextEntry autoCapitalize="none" />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={handleSave}
          disabled={saving}
          className={`mt-[10px] min-h-[54px] items-center justify-center rounded-[14px] bg-primary ${saving ? "opacity-65" : ""}`}
        >
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-base font-bold text-white">Salvar alterações</Text>}
        </Pressable>
      </ScrollView>
    </View>
  );
}
