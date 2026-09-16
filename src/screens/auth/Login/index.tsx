import {
  Image,
  Keyboard,
  Text,
  Pressable,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Title from "../../../components/Title";
import { Input } from "../../../components/Input";
import { useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../../routes/auth.routes";
import { Feather } from "@expo/vector-icons";
import { SpanMessage } from "../../../components/SpanMessage";
import { useLogin } from "./useLogin";
import { Button } from "../../../components/Button";

export function LoginScreen() {
  const [email, setEmal] = useState("");
  const [password, setPassword] = useState("");
  const [showPassoword, setShowPassword] = useState(false);

  const { login, loading, error } = useLogin();

  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="mt-10 h-full w-full items-center p-6">
          <Image
            source={require("../../../assets/logo-1.png")}
            className="mb-10 h-[160px] w-[160px]"
          />
          <Title label="Login" />
          <View className="w-full gap-4">
            <Input
              label="E-mail"
              placeholder="Digite seu e-mail..."
              value={email}
              onChangeText={setEmal}
              keyboardType="email-address"
              rightIcon={<Feather name="mail" size={20} color={"#9A9A9A"} />}
            />
            <Input
              label="Senha"
              value={password}
              placeholder="Digite sua senha..."
              onChangeText={setPassword}
              secureTextEntry={!showPassoword}
              rightIcon={
                <Pressable onPress={() => setShowPassword(!showPassoword)}>
                  <Feather
                    name={showPassoword ? "eye-off" : "eye"}
                    size={20}
                    color={"#9A9A9A"}
                  />
                </Pressable>
              }
            />
            {error ? <SpanMessage message={error} type="error" /> : null}
          </View>

          <Text className="w-full py-1 pl-2 text-left text-orange-text-link">
            Esqueceu sua senha?
          </Text>

          <Button
            label={loading ? "Entrando..." : "Entrar"}
            onPress={() => login(email, password)}
            disabled={loading}
          />

          <View
            className="mb-5 h-[2px] w-full"
            style={{
              backgroundColor: "gray", // AQUI
            }}
          ></View>
          <View className="flex-row">
            <Text>Não possui conta? </Text>
            <Pressable onPress={() => navigation.navigate("Register")}>
              <Text className="text-orange-text-link">Crie sua conta</Text>
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
