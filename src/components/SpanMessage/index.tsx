import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ComponentProps } from "react";

type SpanMessageProps = {
  message: string;
  type: "error" | "success";
};

type FeatherIconName = ComponentProps<typeof Feather>["name"];

// Classes completas (não montadas por interpolação) para o Tailwind enxergá-las
const variants: Record<
  SpanMessageProps["type"],
  { box: string; text: string; color: string; icon: FeatherIconName }
> = {
  error: {
    box: "border-[red] bg-[#ffd8d8]",
    text: "text-[red]",
    color: "red",
    icon: "alert-triangle",
  },
  success: {
    box: "border-[green] bg-white",
    text: "text-[green]",
    color: "green",
    icon: "check",
  },
};

export function SpanMessage({ message, type }: SpanMessageProps) {
  const variant = variants[type];

  return (
    <View
      className={`flex-row items-center gap-2 rounded-lg border px-3 py-[6px] ${variant.box}`}
    >
      <Feather name={variant.icon} size={20} color={variant.color} />
      <Text className={variant.text}>{message}</Text>
    </View>
  );
}
