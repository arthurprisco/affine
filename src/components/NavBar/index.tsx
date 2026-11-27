import { View, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../shared/colors";

export function NavBar({ navigation, back }: any) {
  const insets = useSafeAreaInsets();

  function openDrawer() {
    navigation.getParent()?.openDrawer();
  }

  return (
    <View
      className="flex-row items-center justify-between bg-primary px-5 pb-4 shadow-md shadow-black/20"
      style={{ paddingTop: insets.top + 10 }}
    >
      {back ? (
        // Área de clique maior; margem negativa compensa o padding
        <TouchableOpacity className="-ml-2 p-2" onPress={navigation.goBack}>
          <Feather
            name="chevron-left"
            size={28}
            color={colors.on.primary.strong}
          />
        </TouchableOpacity>
      ) : (
        // Mantém o layout equilibrado quando não houver botão de voltar
        <View className="w-10" />
      )}

      <TouchableOpacity className="-ml-2 p-2" onPress={openDrawer}>
        <Feather name="menu" size={24} color={colors.on.primary.strong} />
      </TouchableOpacity>
    </View>
  );
}
