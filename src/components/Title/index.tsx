import { ActivityIndicator, Text, View } from "react-native";
import {
  useFonts,
  PurplePurse_400Regular,
} from "@expo-google-fonts/purple-purse";

type TitleProps = {
  label: string;
};

export default function Title({ label }: TitleProps) {
  const [fontsLoaded] = useFonts({ PurplePurse_400Regular });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View className="mb-3.5 flex-row items-center gap-4">
      <View className="h-0.5 w-full flex-1 bg-ink" />
      <Text className="font-title text-2xl tracking-[1px] text-ink">
        {label.toUpperCase()}
      </Text>
      <View className="h-0.5 w-full flex-1 bg-ink" />
    </View>
  );
}
