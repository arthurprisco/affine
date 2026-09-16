import { Text, TouchableOpacity, View } from "react-native";
import { themes } from "../../global/themes";
import { styles } from "./styles";

export function TabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.container}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];

        // Pega o nome da rota ou o label definido
        const label =
          options.tabBarLabel !== undefined ? options.tabBarLabel : route.name;

        // Verifica se esta aba é a que está ativa no momento
        const isFocused = state.index === index;

        // Função para navegar ao clicar
        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Define as cores baseadas no foco
        const color = isFocused ? themes.colors.secondary : "#fff";

        const icon = options.tabBarIcon?.({
          color,
          size: 24,
          focused: isFocused,
        });

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={styles.button}
          >
            {icon}
            <Text style={[styles.label, { color }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
