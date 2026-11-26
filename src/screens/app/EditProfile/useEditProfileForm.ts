import { useState } from "react";
import { authClient } from "../../../lib/auth-client";

export type EditProfileErrors = {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

const MIN_PASSWORD = 8;

/** Estado, validação e envio do formulário de edição de perfil. */
export function useEditProfileForm() {
  const { data } = authClient.useSession();
  const user = data?.user;

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<EditProfileErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function validate() {
    const next: EditProfileErrors = {};
    const trimmedName = name.trim();
    const nextEmail = email.trim().toLowerCase();
    const emailChanged = nextEmail !== (user?.email ?? "").toLowerCase();
    const passwordChanged = Boolean(
      currentPassword || newPassword || confirmPassword,
    );

    if (!trimmedName) next.name = "Informe seu nome.";
    if (emailChanged && !/^\S+@\S+\.\S+$/.test(nextEmail))
      next.email = "Informe um e-mail válido.";

    if (passwordChanged) {
      if (!currentPassword) next.currentPassword = "Informe a senha atual.";
      if (newPassword.length < MIN_PASSWORD)
        next.newPassword = `A nova senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`;
      if (newPassword !== confirmPassword)
        next.confirmPassword = "As senhas não coincidem.";
    }

    setErrors(next);
    if (Object.keys(next).length) return null;
    return { trimmedName, nextEmail, emailChanged, passwordChanged };
  }

  async function submit() {
    setSubmitError(null);
    setSuccess(null);
    const valid = validate();
    if (!valid) return;

    setSaving(true);
    try {
      if (valid.trimmedName !== user?.name) {
        const { error } = await authClient.updateUser({
          name: valid.trimmedName,
        });
        if (error)
          throw new Error(error.message ?? "Não foi possível salvar o perfil.");
      }

      if (valid.emailChanged) {
        const { error } = await authClient.changeEmail({
          newEmail: valid.nextEmail,
        });
        if (error)
          throw new Error(
            error.message ?? "Não foi possível alterar o e-mail.",
          );
      }

      if (valid.passwordChanged) {
        const { error } = await authClient.changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions: true,
        });
        if (error)
          throw new Error(error.message ?? "Não foi possível alterar a senha.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      setSuccess("Alterações salvas com sucesso.");
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : "Verifique sua conexão e tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  }

  return {
    values: { name, email, currentPassword, newPassword, confirmPassword },
    setName,
    setEmail,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    errors,
    submitError,
    success,
    saving,
    submit,
  };
}
