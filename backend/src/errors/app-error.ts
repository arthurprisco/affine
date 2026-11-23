/** Erro esperado de regra de negócio; o error handler o converte na resposta HTTP. */
export class AppError extends Error {
  status: number;
  code: string | undefined;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export const notFound = (message = "Recurso não encontrado.") =>
  new AppError(404, message, "NOT_FOUND");
