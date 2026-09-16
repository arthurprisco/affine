import { View, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./styles";

export function NavBar({ navigation, back }: any) {
  const insets = useSafeAreaInsets();

  function openDrawer() {
    navigation.getParent()?.openDrawer();
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      {back ? (
        <TouchableOpacity style={styles.iconButton} onPress={navigation.goBack}>
          <Feather name="chevron-left" size={28} color="#00BFFF" />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}

      <TouchableOpacity style={styles.iconButton} onPress={openDrawer}>
        <Feather name="menu" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
