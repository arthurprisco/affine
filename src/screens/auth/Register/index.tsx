import { Image, Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { KeyboardScrollView } from "../../../components/KeyboardScrollView";
import { SafeAreaView } from "react-native-safe-area-context";
import Title from "../../../components/Title";
import { Input } from "../../../components/Input";
import { useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../../routes/auth.routes";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../../shared/colors";
import { SpanMessage } from "../../../components/SpanMessage";
import { useRegister } from "./useRegister";
import { Button } from "../../../components/Button";

export function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassoword, setShowPassword] = useState(false);

  const { register, loading, error } = useRegister();

  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const toggleShowPassword = (
    <Pressable onPress={() => setShowPassword(!showPassoword)}>
      <Feather
        name={showPassoword ? "eye-off" : "eye"}
        size={20}
        color={colors.ink.placeholder}
      />
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled" // Fecha o teclado ao clicar fora
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-10 w-full items-center p-6">
          <Image
            source={require("../../../assets/logo-1.png")}
            className="mb-10 h-40 w-40"
          />
          <Title label="Cadastrar" />

          <View className="w-full gap-4">
            <Input
              label="Nome"
              placeholder="Digite seu nome..."
              value={name}
              onChangeText={setName}
              rightIcon={
                <Feather name="user" size={20} color={colors.ink.placeholder} />
              }
            />
            <Input
              label="E-mail"
              placeholder="Digite seu e-mail..."
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              rightIcon={
                <Feather name="mail" size={20} color={colors.ink.placeholder} />
              }
            />
            <Input
              label="Senha"
              placeholder="Digite sua senha..."
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassoword}
              rightIcon={toggleShowPassword}
            />
            <Input
              label="Confirmar senha"
              placeholder="Confirme sua senha..."
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassoword}
              rightIcon={toggleShowPassword}
            />

            {error ? <SpanMessage message={error} type="error" /> : null}
          </View>

          <Button
            label={loading ? "Registrando..." : "Registrar"}
            onPress={() => register(name, email, password, confirmPassword)}
            disabled={loading}
          />

          <View className="mb-5 h-0.5 w-full bg-line" />
          <View className="flex-row">
            <Text className="font-body text-sm text-ink">
              Já possui cadastro?{" "}
            </Text>
            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text className="font-body text-sm text-accent-text">
                Fazer login
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardScrollView>
    </SafeAreaView>
  );
}
