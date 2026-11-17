import { ReactNode } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({ label, leftIcon, rightIcon, ...props }: InputProps) {
  return (
    <View>
      {label && <Text className="pb-1 pl-2">{label}</Text>}
      <View className="flex-row items-center rounded-lg border border-[#9A9A9A] bg-[#F9F9F9]">
        {leftIcon && <View className="px-2">{leftIcon}</View>}

        <TextInput {...props} className="flex-1 rounded-lg px-3" />

        {rightIcon && <View className="p-2">{rightIcon}</View>}
      </View>
    </View>
  );
}
