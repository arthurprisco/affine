import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator } from "react-native";

import DrawerRoutes from "./drawer.routes";
import AuthRoutes from "./auth.routes";
import { authClient } from "../lib/auth-client";

export function Routes() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? <DrawerRoutes /> : <AuthRoutes />}
    </NavigationContainer>
  );
}
