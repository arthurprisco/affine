import { cssInterop } from "nativewind";
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from "react-native-keyboard-controller";

// Habilita `className` e `contentContainerClassName` (NativeWind) neste componente.
cssInterop(KeyboardAwareScrollView, {
  className: "style",
  contentContainerClassName: "contentContainerStyle",
});

/** Espaço entre o campo focado e o topo do teclado. */
const FOCUS_OFFSET = 24;

type KeyboardScrollViewProps = KeyboardAwareScrollViewProps & {
  className?: string;
  contentContainerClassName?: string;
};

/**
 * ScrollView para toda tela com campo de texto: abre espaço para o teclado e
 * rola até o campo focado, acompanhando a animação do teclado quadro a quadro
 * (sem sobra de espaço nem "piscada" ao fechar). Também serve de
 * `renderScrollComponent` para FlatList.
 */
export function KeyboardScrollView(props: KeyboardScrollViewProps) {
  return (
    <KeyboardAwareScrollView
      bottomOffset={FOCUS_OFFSET}
      keyboardShouldPersistTaps="handled"
      {...props}
    />
  );
}
