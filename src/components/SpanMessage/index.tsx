import { Text, View } from "react-native";
import { styles } from "./styles";
import { Feather } from "@expo/vector-icons";
import { ComponentProps } from "react";

type SpanMessageProps = {
  message: string;
  type: "error" | "success";
};

type FeatherIconName = ComponentProps<typeof Feather>["name"];

export function SpanMessage({ message, type }: SpanMessageProps) {
  function getTypeSpan(): [string, string, FeatherIconName] {
    switch (type) {
      case "error":
        return ["red", "#ffd8d8", "alert-triangle"];
      case "success":
        return ["green", "#fff", "check"];
    }
  }

  const [color, background, iconName] = getTypeSpan();

  return (
    <View
      style={[
        {
          backgroundColor: background,
          borderColor: color,
        },
        styles.container,
      ]}
    >
      <Feather name={iconName} size={20} color={color} />
      <Text style={{ color: color }}>{message}</Text>
    </View>
  );
}
