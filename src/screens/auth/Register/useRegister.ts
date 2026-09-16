import { useState } from "react";
import { authClient } from "../../../lib/auth-client";

export function useRegister() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function register(
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) {
    if (!name || !email || !password || !confirmPassword) {
      setError("Preencha todos campos.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas devem ser iguais.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signUpError } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message ?? "Erro ao criar conta.");
    }

    setLoading(false);
  }

  return { register, loading, error };
}
