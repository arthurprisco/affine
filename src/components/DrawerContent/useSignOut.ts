import { useState } from "react";
import { Alert } from "react-native";
import { authClient } from "../../lib/auth-client";

export function useSignOut(onStart?: () => void) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [confirming, setConfirming] = useState(false);

  async function handleSignOut() {
    setConfirming(false);
    setIsSigningOut(true);
    onStart?.();

    // As ações do authClient devolvem o erro no resultado em vez de lançar.
    const { error } = await authClient.signOut();

    if (error) {
      setIsSigningOut(false);
      Alert.alert(
        "Sair",
        "Não foi possível encerrar a sessão. Tente novamente.",
      );
    }
    // Em caso de sucesso o componente é desmontado com a troca de rotas,
    // então não há estado para restaurar.
  }

  function confirmSignOut() {
    if (isSigningOut) return;

    setConfirming(true);
  }

  function cancelSignOut() {
    setConfirming(false);
  }

  return {
    isSigningOut,
    confirming,
    confirmSignOut,
    cancelSignOut,
    handleSignOut,
  };
}
