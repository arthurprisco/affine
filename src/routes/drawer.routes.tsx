import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigatorScreenParams } from "@react-navigation/native";
import AppRoutes, { AppTabParamList } from "./app.routes";
import { DrawerContent } from "../components/DrawerContent";

export type DrawerParamList = {
  Tabs: NavigatorScreenParams<AppTabParamList>;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerRoutes() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "slide",
        drawerPosition: "right",
        drawerStyle: { width: 280 },
        overlayColor: "rgba(0,0,0,0.5)",
        swipeEdgeWidth: 40,
      }}
    >
      <Drawer.Screen name="Tabs" component={AppRoutes} />
    </Drawer.Navigator>
  );
}
