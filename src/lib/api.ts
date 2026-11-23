import { authClient } from "./auth-client";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

/** Erro de uma resposta não-2xx da API. `message` já vem em pt-BR do backend. */
export class ApiError extends Error {
  status: number;
  code?: string;
  issues?: { path: string; message: string }[];

  constructor(
    status: number,
    message: string,
    code?: string,
    issues?: ApiError["issues"],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.issues = issues;
  }
}

/** Mensagem amigável para qualquer erro vindo de `api()` (inclusive falta de rede). */
export function errorMessage(error: unknown, fallback = "Algo deu errado.") {
  if (error instanceof ApiError) return error.message;
  if (error instanceof TypeError) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão.";
  }
  return fallback;
}

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

/**
 * Chama a API de domínio (`/api/...`) já autenticada com o cookie de sessão do
 * Better Auth. Para rotas de auth, use o `authClient`, nunca esta função.
 */
export async function api<T>(path: string, options: ApiOptions = {}) {
  const cookie = await authClient.getCookie();

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(options.body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    // o cookie vai no header acima; o RN não deve mandar cookies próprios
    credentials: "omit",
  });

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error ?? "Erro inesperado no servidor.",
      data?.code,
      data?.issues,
    );
  }

  return data as T;
}
