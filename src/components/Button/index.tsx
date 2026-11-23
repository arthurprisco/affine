import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
} from "react-native";
import { colors } from "../../shared/colors";

type ButtonProps = {
  label: string;
  /** Mostra um spinner no lugar do texto e bloqueia novos toques. */
  loading?: boolean;
} & PressableProps;

/** Ação principal da tela (largura total, em `accent`). No máximo uma por tela. */
export function Button({
  label,
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={
        loading || disabled
          ? "my-6 w-full items-center justify-center rounded-sm bg-accent py-3 opacity-60"
          : "my-6 w-full items-center justify-center rounded-sm bg-accent py-3"
      }
      disabled={loading || !!disabled}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: loading || !!disabled }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.on.accent} />
      ) : (
        <Text className="font-body-medium text-sm text-on-accent">{label}</Text>
      )}
    </Pressable>
  );
}
