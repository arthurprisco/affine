import { View, Text, Alert } from "react-native";
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
  DrawerNavigationProp,
} from "@react-navigation/drawer";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cssInterop } from "nativewind";
import { colors } from "../../shared/colors";
import type { AppTabParamList } from "../../routes/app.routes";
import type { DrawerParamList } from "../../routes/drawer.routes";
import { DrawerItem } from "./DrawerItem";
import { menuItems } from "./menuItems";
import { useSignOut } from "./useSignOut";

// Componente de terceiros: precisa ser registrado para aceitar className.
const DrawerScrollView = cssInterop(DrawerContentScrollView, {
  className: "style",
  contentContainerClassName: "contentContainerStyle",
});

/**
 * O estado do drawer contém apenas a rota "Tabs" — o nome da tab ativa está no
 * estado aninhado do bottom-tabs, que só existe depois da primeira navegação.
 */
function getActiveTabRoute(
  state: DrawerContentComponentProps["state"],
): keyof AppTabParamList {
  const nestedState = state.routes[state.index]?.state;
  const activeName = nestedState?.routes[nestedState.index ?? 0]?.name;

  return (activeName as keyof AppTabParamList) ?? "Home";
}

export function DrawerContent(props: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();

  // `props.navigation` é tipado com ParamListBase; o cast habilita o
  // autocomplete de `navigate("Tabs", { screen: ... })`.
  const navigation =
    props.navigation as unknown as DrawerNavigationProp<DrawerParamList>;

  const activeRoute = getActiveTabRoute(props.state);
  const { isSigningOut, confirmSignOut } = useSignOut(navigation.closeDrawer);

  function navigate(route: keyof AppTabParamList) {
    navigation.navigate("Tabs", { screen: route });
    navigation.closeDrawer();
  }

  function handleComingSoon() {
    Alert.alert("Configurações", "Em breve");
  }

  return (
    <DrawerScrollView
      {...props}
      className="bg-primary"
      contentContainerClassName="grow"
    >
      <View
        className="flex-1 bg-primary px-6 pb-8"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="mb-6 border-b border-on-primary-faint pb-8 pt-4">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-primary-orange">
            <Feather name="layers" size={24} color={colors["orange-text"]} />
          </View>
          <Text className="text-[22px] font-bold tracking-[1px] text-white">
            Affine
          </Text>
          <Text className="mt-0.5 text-[13px] text-on-primary-subtle">
            Gestão de produção artesanal
          </Text>
        </View>

        {menuItems.map((item) => (
          <DrawerItem
            key={item.route}
            label={item.label}
            icon={item.icon}
            active={item.route === activeRoute}
            onPress={() => navigate(item.route)}
          />
        ))}

        <View className="mt-auto border-t border-on-primary-faint pt-6">
          <DrawerItem
            label="Configurações"
            icon="settings"
            variant="footer"
            onPress={handleComingSoon}
          />

          <DrawerItem
            label={isSigningOut ? "Saindo..." : "Sair"}
            icon="log-out"
            variant="footer"
            loading={isSigningOut}
            onPress={confirmSignOut}
          />
        </View>
      </View>
    </DrawerScrollView>
  );
}
