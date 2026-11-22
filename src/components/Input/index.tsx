import { ReactNode } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import { colors } from "../../shared/colors";

interface InputProps extends TextInputProps {
  label?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Mensagem de erro exibida abaixo do campo. */
  error?: string;
}

/**
 * Exceção à regra de "só className": `text-sm` sempre traz `lineHeight`, e em
 * TextInput de uma linha isso desloca texto/placeholder (bug do iOS; no
 * Android soma com a métrica alta da Poppins). Anulamos o `lineHeight` e o
 * padding de fonte do Android; a altura fixa (`h-11`) centraliza o conteúdo.
 */
const SINGLE_LINE_FIX = { lineHeight: undefined, includeFontPadding: false };

/** Campo de texto padrão de formulários e buscas. */
export function Input({
  label,
  leftIcon,
  rightIcon,
  error,
  multiline,
  style,
  ...props
}: InputProps) {
  return (
    <View className="gap-1.5">
      {label && <Text className="font-body text-sm text-ink">{label}</Text>}
      <View
        className={`flex-row rounded-sm border border-line-input bg-surface ${multiline ? "items-start" : "items-center"}`}
      >
        {leftIcon && <View className="px-2">{leftIcon}</View>}

        <TextInput
          placeholderTextColor={colors.ink.placeholder}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          {...props}
          style={multiline ? style : [style, SINGLE_LINE_FIX]}
          className={`flex-1 px-3 font-body text-sm text-ink ${multiline ? "min-h-20 py-2.5" : "h-11 py-0"}`}
        />

        {rightIcon && <View className="p-2">{rightIcon}</View>}
      </View>
      {error && <Text className="font-body text-xs text-danger">{error}</Text>}
    </View>
  );
}
