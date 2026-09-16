import { useState } from "react";
import { authClient } from "../../../lib/auth-client";

export function useLogin() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message ?? "Erro ao fazer login.");
    }

    setLoading(false);
  }

  return { login, loading, error };
}
