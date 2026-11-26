import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Title from "../../../components/Title";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { SpanMessage } from "../../../components/SpanMessage";
import { KeyboardScrollView } from "../../../components/KeyboardScrollView";
import { colors } from "../../../shared/colors";
import { useEditProfileForm } from "./useEditProfileForm";

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

export default function EditProfile() {
  const form = useEditProfileForm();
  const { values, errors } = form;
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={showPassword ? "Ocultar senhas" : "Mostrar senhas"}
      onPress={() => setShowPassword((value) => !value)}
      hitSlop={8}
    >
      <Feather
        name={showPassword ? "eye-off" : "eye"}
        size={20}
        color={colors.ink.placeholder}
      />
    </Pressable>
  );

  return (
    <View className="flex-1 bg-background">
      <KeyboardScrollView
        contentContainerClassName="px-4 pt-6 pb-10"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Title label="Editar perfil" />

        {/* Identificação */}
        <View className="mb-6 items-center gap-2">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-primary">
            <Text className="font-body-semibold text-lg text-on-primary">
              {getInitials(values.name)}
            </Text>
          </View>
          <Text className="font-body text-xs text-ink-muted">
            Atualize seus dados pessoais
          </Text>
        </View>

        <View className="gap-4">
          <Input
            label="Nome completo"
            placeholder="Ex.: Maria da Silva"
            value={values.name}
            onChangeText={form.setName}
            autoCapitalize="words"
            error={errors.name}
          />

          <View className="gap-1">
            <Input
              label="E-mail"
              placeholder="Ex.: maria@queijaria.com"
              value={values.email}
              onChangeText={form.setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
            />
            <Text className="font-body text-xs text-ink-muted">
              Será necessário confirmar o novo endereço por e-mail.
            </Text>
          </View>
        </View>

        <View className="mt-8">
          <Title label="Alterar senha" />
        </View>

        <View className="gap-4">
          <Text className="font-body text-xs text-ink-muted">
            Preencha só se quiser trocar a senha. Use pelo menos 8 caracteres.
          </Text>

          <Input
            label="Senha atual"
            placeholder="Digite sua senha atual"
            value={values.currentPassword}
            onChangeText={form.setCurrentPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            rightIcon={toggleShowPassword}
            error={errors.currentPassword}
          />
          <Input
            label="Nova senha"
            placeholder="Mínimo de 8 caracteres"
            value={values.newPassword}
            onChangeText={form.setNewPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            rightIcon={toggleShowPassword}
            error={errors.newPassword}
          />
          <Input
            label="Confirmar nova senha"
            placeholder="Repita a nova senha"
            value={values.confirmPassword}
            onChangeText={form.setConfirmPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            rightIcon={toggleShowPassword}
            error={errors.confirmPassword}
          />
        </View>

        {form.submitError && (
          <View className="mt-6">
            <SpanMessage type="error" message={form.submitError} />
          </View>
        )}
        {form.success && (
          <View className="mt-6">
            <SpanMessage type="success" message={form.success} />
          </View>
        )}

        <Button
          label="Salvar alterações"
          onPress={form.submit}
          loading={form.saving}
        />
      </KeyboardScrollView>
    </View>
  );
}
