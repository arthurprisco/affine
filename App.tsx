import "./src/styles/global.css";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { PurplePurse_400Regular } from "@expo-google-fonts/purple-purse";
import { Routes } from "./src/routes";
import { useBackClosesKeyboard } from "./src/hooks/useBackClosesKeyboard";

export default function App() {
  // Android: "voltar" com teclado aberto fecha só o teclado.
  useBackClosesKeyboard();

  // Os nomes das chaves precisam bater com `fontFamily` do tailwind.config.js.
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    PurplePurse_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Necessário para os gestos do react-native-gesture-handler (ex.: arrastar etapas).
  return (
    <GestureHandlerRootView>
      {/* Necessário para o KeyboardScrollView acompanhar o teclado. */}
      <KeyboardProvider>
        <Routes />
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
