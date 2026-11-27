import { ReactNode } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Input } from "../../../components/Input";
import { Select } from "../../../components/Select";
import { colors } from "../../../shared/colors";
import {
  DURATION_UNITS,
  DURATION_UNIT_LABELS,
  DurationUnit,
} from "../../../shared/duration";
import { StepDraft, StepErrors, StepField } from "./useRecipeForm";

const UNIT_OPTIONS = DURATION_UNITS.map((unit) => ({
  value: unit,
  label: DURATION_UNIT_LABELS[unit],
}));

function IconButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      className="h-11 w-8 items-center justify-center"
    >
      <Feather name={icon} size={18} color={colors.ink.muted} />
    </Pressable>
  );
}

type StepCardProps = {
  step: StepDraft;
  index: number;
  errors?: StepErrors;
  expanded: boolean;
  isDragging: boolean;
  dragHandle: ReactNode;
  onToggle: () => void;
  onRemove: () => void;
  onChange: (field: StepField, value: string) => void;
  onUnitChange: (unit: DurationUnit) => void;
  onAutoAdvanceChange: (value: boolean) => void;
};

/** Card de etapa de produção: recolhido mostra só o nome; expandido, os demais campos. */
export function StepCard({
  step,
  index,
  errors,
  expanded,
  isDragging,
  dragHandle,
  onToggle,
  onRemove,
  onChange,
  onUnitChange,
  onAutoAdvanceChange,
}: StepCardProps) {
  const number = index + 1;

  return (
    <View
      className={
        isDragging
          ? "gap-3 rounded-md border border-accent-strong bg-surface p-3"
          : "gap-3 rounded-md border border-line bg-surface p-3"
      }
    >
      <View className="flex-row items-start gap-2">
        <View className="h-11 justify-center">{dragHandle}</View>
        <View className="h-11 justify-center">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-tag">
            <Text className="font-body-medium text-xs text-ink">{number}</Text>
          </View>
        </View>
        <View className="flex-1">
          <Input
            placeholder="Ex.: Aquecer o leite"
            value={step.name}
            onChangeText={(text) => onChange("name", text)}
            autoCapitalize="sentences"
            accessibilityLabel={`Nome da etapa ${number}`}
            error={errors?.name}
          />
        </View>
        <IconButton
          icon={expanded ? "chevron-up" : "chevron-down"}
          label={
            expanded ? `Recolher etapa ${number}` : `Expandir etapa ${number}`
          }
          onPress={onToggle}
        />
        <IconButton
          icon="trash-2"
          label={`Remover etapa ${number}`}
          onPress={onRemove}
        />
      </View>

      {expanded && (
        <>
          <Input
            label="Descrição (opcional)"
            placeholder="Ex.: Aquecer o leite cru a 35 °C, mexendo devagar"
            value={step.description}
            onChangeText={(text) => onChange("description", text)}
            multiline
            accessibilityLabel={`Descrição da etapa ${number}`}
          />

          <View className="flex-row items-start gap-2">
            <View className="flex-1">
              <Input
                label="Duração"
                placeholder="Ex.: 30"
                value={step.duration}
                onChangeText={(text) => onChange("duration", text)}
                keyboardType="number-pad"
                accessibilityLabel={`Duração da etapa ${number}`}
                error={errors?.duration}
              />
            </View>
            <View className="w-32">
              <Select
                label="Unidade"
                title="Unidade da duração"
                value={step.durationUnit}
                options={UNIT_OPTIONS}
                onChange={onUnitChange}
                accessibilityLabel={`Unidade da duração da etapa ${number}`}
              />
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <View className="flex-1 gap-0.5">
              <Text className="font-body text-sm text-ink">Avança sozinha</Text>
              <Text className="font-body text-xs text-ink-muted">
                Conclui na data prevista, sem confirmação (ex.: maturação)
              </Text>
            </View>
            <Switch
              value={step.autoAdvance}
              onValueChange={onAutoAdvanceChange}
              trackColor={{
                false: colors.line.DEFAULT,
                true: colors.accent.DEFAULT,
              }}
              ios_backgroundColor={colors.line.DEFAULT}
              accessibilityLabel={`Etapa ${number} avança sozinha`}
            />
          </View>
        </>
      )}
    </View>
  );
}
