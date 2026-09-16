import { ReactNode } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { styles } from "./styles";

interface InputProps extends TextInputProps {
  label?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({ label, leftIcon, rightIcon, ...props }: InputProps) {
  return (
    <View>
      {label && (
        <Text style={{ paddingLeft: 8, paddingBottom: 4 }}>{label}</Text>
      )}
      <View style={styles.inputContent}>
        {leftIcon && <View style={{ paddingHorizontal: 8 }}>{leftIcon}</View>}

        <TextInput {...props} style={styles.input} />

        {rightIcon && <View style={{ padding: 8 }}>{rightIcon}</View>}
      </View>
    </View>
  );
}
