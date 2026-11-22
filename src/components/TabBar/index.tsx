import { Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../shared/colors";

export function TabBar({ state, descriptors, navigation }: any) {
  return (
    <View className="absolute bottom-[18px] left-3 right-3 h-[70px] flex-row items-center justify-around rounded-[20px] bg-primary shadow-lg shadow-black/30">
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

        // A cor do ícone é passada como valor (prop), não como classe
        const color = isFocused ? colors.accent.DEFAULT : "#fff";

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
            className="flex-1 items-center justify-center"
          >
            {icon}
            <Text
              className={`mt-1 text-xs font-bold ${isFocused ? "text-accent" : "text-white"}`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
