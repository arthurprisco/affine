import { Pressable, Text, View } from "react-native";
import { Dialog } from "../Dialog";

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Usa a cor de perigo no botão de confirmar (ex.: excluir). */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Pede confirmação antes de uma ação irreversível (ex.: excluir uma etapa). */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog visible={visible} onClose={onCancel} title={title}>
      {message && (
        <Text className="font-body text-sm text-ink-muted">{message}</Text>
      )}

      <View className="mt-1 flex-row gap-2">
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          className="flex-1 items-center rounded-sm border border-line-input bg-surface py-3"
        >
          <Text className="font-body-medium text-sm text-ink">
            {cancelLabel}
          </Text>
        </Pressable>
        <Pressable
          onPress={onConfirm}
          accessibilityRole="button"
          className={
            destructive
              ? "flex-1 items-center rounded-sm border border-danger bg-surface py-3"
              : "flex-1 items-center rounded-sm border border-line-input bg-surface py-3"
          }
        >
          <Text
            className={
              destructive
                ? "font-body-medium text-sm text-danger"
                : "font-body-medium text-sm text-ink"
            }
          >
            {confirmLabel}
          </Text>
        </Pressable>
      </View>
    </Dialog>
  );
}
