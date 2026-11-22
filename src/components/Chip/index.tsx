import { Pressable, Text } from "react-native";

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

/** Opção selecionável curta (filtro, categoria). Usa o padrão de estado selecionado. */
export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={
        selected
          ? "rounded-sm border border-accent-strong bg-accent-soft px-3 py-1.5"
          : "rounded-sm border border-line-input bg-surface px-3 py-1.5"
      }
    >
      <Text
        className={
          selected
            ? "font-body text-xs text-accent-text"
            : "font-body text-xs text-ink"
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}
