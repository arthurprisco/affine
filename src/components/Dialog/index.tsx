import { ReactNode } from "react";
import { Modal, Pressable, Text } from "react-native";

type DialogProps = {
  visible: boolean;
  /** Chamado ao tocar fora do diálogo ou no botão voltar do Android. */
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

/** Janela centralizada sobre a tela escurecida (escolha de opção, confirmação). */
export function Dialog({ visible, onClose, title, children }: DialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-overlay px-4"
        onPress={onClose}
        accessibilityLabel="Fechar"
      >
        {/* Pressable interno impede que o toque no diálogo o feche. */}
        <Pressable className="w-full gap-3 rounded-md border border-line bg-background p-4">
          {title && (
            <Text className="font-body-medium text-base text-ink">{title}</Text>
          )}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
