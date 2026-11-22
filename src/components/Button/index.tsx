import { Pressable, PressableProps, Text } from "react-native";

type ButtonProps = {
  label: string;
} & PressableProps;

/** Ação principal da tela (largura total, em `accent`). No máximo uma por tela. */
export function Button({ label, ...props }: ButtonProps) {
  return (
    <Pressable
      className="my-6 w-full items-center justify-center rounded-sm bg-accent py-3"
      {...props}
    >
      <Text className="font-body-medium text-sm text-on-accent">{label}</Text>
    </Pressable>
  );
}
