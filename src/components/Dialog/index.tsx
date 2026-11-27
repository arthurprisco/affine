import { ReactNode, useEffect, useRef, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

// O `fade` nativo do Modal é lento e não tem duração configurável, então a
// animação é feita aqui: entrada um pouco mais longa que a saída.
const ENTER = { duration: 180, easing: Easing.out(Easing.cubic) };
const EXIT = { duration: 140, easing: Easing.in(Easing.cubic) };

type DialogProps = {
  visible: boolean;
  /** Chamado ao tocar fora do diálogo ou no botão voltar do Android. */
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

/** Janela centralizada sobre a tela escurecida (escolha de opção, confirmação). */
export function Dialog({ visible, onClose, title, children }: DialogProps) {
  // Mantém o Modal montado até a animação de saída terminar.
  const [mounted, setMounted] = useState(visible);
  const mountedRef = useRef(mounted);
  mountedRef.current = mounted;
  const progress = useSharedValue(0);

  // Quem usa o Dialog costuma limpar os dados ao fechar (ex.: `step = null`).
  // Sem congelar o conteúdo, o card esvaziaria durante a saída e "pularia".
  const content = useRef({ title, children });
  if (visible) content.current = { title, children };

  useEffect(() => {
    if (visible) {
      // Na primeira abertura a animação começa no `onShow`, quando a janela
      // nativa já está na tela; se reabriu durante a saída, retoma daqui.
      if (mountedRef.current) progress.value = withTiming(1, ENTER);
      else setMounted(true);
    } else {
      progress.value = withTiming(0, EXIT, (finished) => {
        if (finished) scheduleOnRN(setMounted, false);
      });
    }
  }, [visible, progress]);

  function handleShow() {
    progress.value = withTiming(1, ENTER);
  }

  // O NativeWind descarta o className de um Animated.View que também recebe
  // estilo animado (o diálogo colapsava no topo da tela). Por isso o layout
  // fica em Views comuns e o Animated.View só leva o estilo do worklet.
  // Fundo e card animam separados: opacidade num pai comum deixaria o fundo
  // escuro aparecer através do card no meio da transição (Android).
  const backdropStyle = useAnimatedStyle(() => ({
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: progress.value,
  }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.96 + progress.value * 0.04 }],
  }));

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onShow={handleShow}
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center px-4">
        <Animated.View style={backdropStyle}>
          <Pressable
            className="flex-1 bg-overlay"
            onPress={onClose}
            accessibilityLabel="Fechar"
          />
        </Animated.View>

        <View className="w-full">
          <Animated.View style={cardStyle}>
            <View className="w-full gap-3 rounded-md border border-line bg-background p-4">
              {content.current.title && (
                <Text className="font-body-medium text-base text-ink">
                  {content.current.title}
                </Text>
              )}
              {content.current.children}
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
