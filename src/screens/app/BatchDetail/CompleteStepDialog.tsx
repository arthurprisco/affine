import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Dialog } from "../../../components/Dialog";
import { Input } from "../../../components/Input";
import { SpanMessage } from "../../../components/SpanMessage";
import type { BatchStep } from "../../../api/batches";
import { colors } from "../../../shared/colors";
import { formatDateBR } from "../../../shared/date";

type CompleteStepDialogProps = {
  /** Etapa a concluir; `null` fecha o diálogo. */
  step: BatchStep | null;
  loading: boolean;
  error: string | null;
  onConfirm: (notes: string) => void;
  onCancel: () => void;
};

/** Confirma a conclusão da etapa atual (sempre com a data de hoje), com observação opcional. */
export function CompleteStepDialog({
  step,
  loading,
  error,
  onConfirm,
  onCancel,
}: CompleteStepDialogProps) {
  const [notes, setNotes] = useState("");

  // Reabre com a observação já registrada (se a etapa foi desfeita antes).
  useEffect(() => {
    if (step) setNotes(step.notes ?? "");
  }, [step]);

  return (
    <Dialog
      visible={step !== null}
      onClose={loading ? () => {} : onCancel}
      title={step ? `Concluir ${step.name}?` : undefined}
    >
      <Text className="font-body text-sm text-ink-muted">
        Será registrada como concluída hoje ({formatDateBR(new Date())}). As
        datas das etapas seguintes são recalculadas a partir daí.
      </Text>

      <Input
        label="Observação (opcional)"
        placeholder="Ex.: pH 5,2, salga com 2% de sal"
        value={notes}
        onChangeText={setNotes}
        multiline
        maxLength={500}
      />

      {error && <SpanMessage type="error" message={error} />}

      <View className="mt-1 flex-row gap-2">
        <Pressable
          onPress={onCancel}
          disabled={loading}
          accessibilityRole="button"
          className="flex-1 items-center rounded-sm border border-line-input bg-surface py-3"
        >
          <Text className="font-body-medium text-sm text-ink">Cancelar</Text>
        </Pressable>
        <Pressable
          onPress={() => onConfirm(notes)}
          disabled={loading}
          accessibilityRole="button"
          accessibilityState={{ busy: loading }}
          className="flex-1 items-center rounded-sm border border-line-input bg-surface py-3"
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text className="font-body-medium text-sm text-ink">
              Concluir etapa
            </Text>
          )}
        </Pressable>
      </View>
    </Dialog>
  );
}
