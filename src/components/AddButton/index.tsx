import { Pressable, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../shared/colors";

type AddButtonProps = {
  label: string;
  onPress: () => void;
};

/** Área tracejada para adicionar um item a uma lista (ex.: etapa de produção). */
export function AddButton({ label, onPress }: AddButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center justify-center gap-2 rounded-md border border-dashed border-line py-3"
    >
      <Feather name="plus" size={18} color={colors.ink.muted} />
      <Text className="font-body-medium text-sm text-ink-muted">{label}</Text>
    </Pressable>
  );
}
