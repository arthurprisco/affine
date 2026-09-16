import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../shared/colors";

type DrawerItemProps = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  /** Destaca o item como a rota atual. */
  active?: boolean;
  /** `menu` para a navegação principal, `footer` para as ações secundárias. */
  variant?: "menu" | "footer";
  /** Troca o ícone por um spinner e bloqueia o toque. */
  loading?: boolean;
  disabled?: boolean;
};

/**
 * Cor de texto e de ícone são escolhidas por ternário (nunca empilhadas): em
 * NativeWind a precedência entre utilitários do mesmo tipo vem da ordem do CSS
 * gerado, não da ordem das classes na string.
 */
const VARIANTS = {
  menu: {
    container: "flex-row items-center gap-4 rounded-[10px] px-2 py-3.5",
    label: "text-[15px]",
    labelColor: "text-on-primary",
    iconBox: "w-5",
    iconSize: 20,
    iconColor: colors["on-primary"],
  },
  footer: {
    container: "flex-row items-center gap-4 px-2 py-3",
    label: "text-[14px]",
    labelColor: "text-on-primary-subtle",
    iconBox: "w-[18px]",
    iconSize: 18,
    iconColor: colors["on-primary-subtle"],
  },
} as const;

const ACTIVE_LABEL = "text-primary-orange font-semibold";

export function DrawerItem({
  label,
  icon,
  onPress,
  active = false,
  variant = "menu",
  loading = false,
  disabled = false,
}: DrawerItemProps) {
  const variantStyles = VARIANTS[variant];
  const isDisabled = disabled || loading;
  const iconColor = active ? colors["primary-orange"] : variantStyles.iconColor;

  return (
    <TouchableOpacity
      className={`${variantStyles.container} ${active ? "bg-primary-orange/15" : ""}`}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{
        selected: active,
        disabled: isDisabled,
        busy: loading,
      }}
    >
      {/* Largura fixa para o spinner não deslocar o label */}
      <View className={`${variantStyles.iconBox} items-center justify-center`}>
        {loading ? (
          <ActivityIndicator size="small" color={iconColor} />
        ) : (
          <Feather
            name={icon}
            size={variantStyles.iconSize}
            color={iconColor}
          />
        )}
      </View>

      <Text
        className={`${variantStyles.label} ${active ? ACTIVE_LABEL : variantStyles.labelColor}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
