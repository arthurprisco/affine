import { Text, View } from "react-native";
import { styles } from "./styles";
import { authClient } from "../../../lib/auth-client";

export default function Profile() {
  const { data } = authClient.useSession();

  const user = data?.user;

  return (
    <View style={styles.container}>
      <Text>Meu perfil: {user?.name}</Text>
    </View>
  );
}
