import { Pressable, PressableProps, Text } from "react-native";

type ButtonProps = {
  label: string;
} & PressableProps;

export function Button({ label, ...props }: ButtonProps) {
  return (
    <Pressable
      className="bg-primary-orange my-6 w-full items-center justify-center rounded-lg py-3"
      {...props}
    >
      <Text className="text-orange-text text-[16px] font-bold">{label}</Text>
    </Pressable>
  );
}
