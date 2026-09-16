import { ActivityIndicator, Text, View } from "react-native";
import {
  useFonts,
  PurplePurse_400Regular,
} from "@expo-google-fonts/purple-purse";
import { styles } from "./styles";

type TitleProps = {
  label: string;
};

export default function Title({ label }: TitleProps) {
  const [fontsLoaded] = useFonts({ PurplePurse_400Regular });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.line}></View>
      <Text style={styles.title}>{label.toUpperCase()}</Text>
      <View style={styles.line}></View>
    </View>
  );
}
