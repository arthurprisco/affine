import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../shared/colors";
import { Dialog } from "../Dialog";

export type SelectOption<T extends string> = { label: string; value: T };

type SelectProps<T extends string> = {
  label?: string;
  /** Título da lista de opções; usa o `label` quando omitido. */
  title?: string;
  placeholder?: string;
  value: T | null;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  error?: string;
  accessibilityLabel?: string;
};

/** Campo de escolha única que abre as opções num diálogo centralizado (ex.: unidade de duração). */
export function Select<T extends string>({
  label,
  title,
  placeholder = "Selecione",
  value,
  options,
  onChange,
  error,
  accessibilityLabel,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const sheetTitle = title ?? label;

  function handleSelect(option: T) {
    onChange(option);
    setOpen(false);
  }

  return (
    <View className="gap-1.5">
      {label && <Text className="font-body text-sm text-ink">{label}</Text>}

      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityValue={{ text: selected?.label }}
        className="h-11 flex-row items-center justify-between gap-1 rounded-sm border border-line-input bg-surface px-3"
      >
        <Text
          numberOfLines={1}
          className={
            selected
              ? "flex-1 font-body text-sm text-ink"
              : "flex-1 font-body text-sm text-ink-placeholder"
          }
        >
          {selected?.label ?? placeholder}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.ink.muted} />
      </Pressable>

      {error && <Text className="font-body text-xs text-danger">{error}</Text>}

      <Dialog visible={open} onClose={() => setOpen(false)} title={sheetTitle}>
        <View className="gap-2">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => handleSelect(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                className={
                  isSelected
                    ? "flex-row items-center justify-between rounded-sm border border-accent-strong bg-accent-soft px-3 py-3"
                    : "flex-row items-center justify-between rounded-sm border border-line bg-surface px-3 py-3"
                }
              >
                <Text
                  className={
                    isSelected
                      ? "font-body text-sm text-accent-text"
                      : "font-body text-sm text-ink"
                  }
                >
                  {option.label}
                </Text>
                {isSelected && (
                  <Feather name="check" size={16} color={colors.accent.text} />
                )}
              </Pressable>
            );
          })}
        </View>
      </Dialog>
    </View>
  );
}
