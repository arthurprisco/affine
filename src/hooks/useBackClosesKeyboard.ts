import { useEffect } from "react";
import {
  BackHandler,
  Keyboard,
  NativeEventSubscription,
  Platform,
} from "react-native";

/**
 * Margem após o teclado fechar em que o "voltar" ainda é ignorado. Em alguns
 * Androids (edge-to-edge) o sistema fecha o teclado e repassa o mesmo
 * "voltar" para o app logo em seguida.
 */
const GRACE_MS = 400;

/**
 * Android: com o teclado aberto, o botão/gesto de voltar só fecha o teclado,
 * sem voltar de tela. Usar uma única vez, na raiz do app.
 */
export function useBackClosesKeyboard() {
  useEffect(() => {
    if (Platform.OS !== "android") return;

    let backSub: NativeEventSubscription | null = null;
    let releaseTimer: ReturnType<typeof setTimeout> | null = null;

    // Registrado a cada abertura do teclado para ser o listener mais recente:
    // o BackHandler chama primeiro o último registrado, antes da navegação.
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      if (releaseTimer) clearTimeout(releaseTimer);
      backSub?.remove();
      backSub = BackHandler.addEventListener("hardwareBackPress", () => {
        Keyboard.dismiss();
        return true;
      });
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      if (releaseTimer) clearTimeout(releaseTimer);
      releaseTimer = setTimeout(() => {
        backSub?.remove();
        backSub = null;
      }, GRACE_MS);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
      backSub?.remove();
      if (releaseTimer) clearTimeout(releaseTimer);
    };
  }, []);
}
