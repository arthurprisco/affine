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
import type { DrawerParamList } from "../../routes/drawer.routes";
import { DrawerItem } from "./DrawerItem";
import { isTabRoute, menuItems, MenuRoute } from "./menuItems";
import { useSignOut } from "./useSignOut";
import { ConfirmDialog } from "../ConfirmDialog";

// Componente de terceiros: precisa ser registrado para aceitar className.
const DrawerScrollView = cssInterop(DrawerContentScrollView, {
  className: "style",
  contentContainerClassName: "contentContainerStyle",
});

/**
 * Estado aninhado: Drawer ("Tabs") → Stack (AppTabs | Recipes | ...) →
 * bottom-tabs. Os estados aninhados só existem depois da primeira navegação,
 * por isso os fallbacks apontam para a rota inicial ("Home").
 */
function getActiveRoute(state: DrawerContentComponentProps["state"]): string {
  const stackState = state.routes[state.index]?.state;
  const stackRoute = stackState?.routes[stackState.index ?? 0];

  if (!stackRoute || stackRoute.name === "AppTabs") {
    const tabState = stackRoute?.state;
    return tabState?.routes[tabState.index ?? 0]?.name ?? "Home";
  }

  return stackRoute.name;
}

export function DrawerContent(props: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();

  // `props.navigation` é tipado com ParamListBase; o cast habilita o
  // autocomplete de `navigate("Tabs", { screen: ... })`.
  const navigation =
    props.navigation as unknown as DrawerNavigationProp<DrawerParamList>;

  const activeRoute = getActiveRoute(props.state);
  const {
    isSigningOut,
    confirming,
    confirmSignOut,
    cancelSignOut,
    handleSignOut,
  } = useSignOut(navigation.closeDrawer);

  function navigate(route: MenuRoute) {
    if (isTabRoute(route)) {
      navigation.navigate("Tabs", {
        screen: "AppTabs",
        params: { screen: route },
      });
    } else {
      navigation.navigate("Tabs", { screen: route });
    }
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
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-accent">
            <Feather name="layers" size={24} color={colors.on.accent} />
          </View>
          <Text className="font-body-semibold text-lg tracking-[1px] text-on-primary-strong">
            Affine
          </Text>
          <Text className="mt-0.5 font-body text-xs text-on-primary-subtle">
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

      <ConfirmDialog
        visible={confirming}
        title="Sair da conta?"
        message="Você precisará entrar novamente para acessar seus lotes e receitas."
        confirmLabel="Sair"
        destructive
        onConfirm={handleSignOut}
        onCancel={cancelSignOut}
      />
    </DrawerScrollView>
  );
}
