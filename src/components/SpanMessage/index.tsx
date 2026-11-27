import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { colors } from "../../shared/colors";

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
    box: "border-danger bg-danger-soft",
    text: "font-body text-sm text-danger",
    color: colors.danger.DEFAULT,
    icon: "alert-triangle",
  },
  success: {
    box: "border-success bg-surface",
    text: "font-body text-sm text-success",
    color: colors.success,
    icon: "check",
  },
};

export function SpanMessage({ message, type }: SpanMessageProps) {
  const variant = variants[type];

  return (
    <View
      className={`flex-row items-center gap-2 rounded-lg border px-3 py-1.5 ${variant.box}`}
    >
      <Feather name={variant.icon} size={20} color={variant.color} />
      <Text className={variant.text}>{message}</Text>
    </View>
  );
}
