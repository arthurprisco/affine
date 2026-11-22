import { Text, View } from "react-native";

export default function CardProduct() {
  const steps = [
    { completed: true },
    { completed: true },
    { completed: true },
    { completed: true },
    { completed: true },
    { completed: true },
    { completed: true },
    { completed: true },
    { completed: false },
    { completed: false },
    { completed: false },
    { completed: false },
  ];
  const getCompletedSteps = () => {
    let completedSteps = 0;

    steps.forEach((step) => {
      if (step.completed) completedSteps++;
    });

    return completedSteps;
  };

  return (
    <View className="w-full gap-[10px] rounded-lg border border-line bg-white p-4">
      <View className="flex-row items-center justify-between">
        <View className="items-start gap-[6px]">
          <View>
            <Text className="text-base">Queijo Canastra • 20 unidades</Text>
          </View>
          <View className="rounded-lg bg-[#ECECEC] px-[6px] py-[2px]">
            <Text className="text-[13px] text-[#4D4D4D]">Lote #2026QJ102</Text>
          </View>
        </View>

        <View>
          <View className="rounded-lg border border-accent-strong bg-accent-soft">
            <Text className="px-[6px] py-1 text-[13px] text-accent-text">
              3 dias
            </Text>
          </View>
        </View>
      </View>

      <View className="gap-[10px]">
        <View className="gap-1">
          <View className="flex-row justify-between px-1">
            <Text className="text-xs text-[#666666]">Maturação</Text>
            <Text className="text-xs text-[#666666]">42/45 dias</Text>
          </View>
          <View className="relative">
            <View className="absolute h-1 w-full rounded-lg bg-[#D9D9D9]" />
            <View className="absolute h-1 w-[90%] rounded-lg bg-primary" />
          </View>
        </View>

        <View className="gap-1">
          <Text className="px-1 text-right text-xs text-[#666666]">{`${getCompletedSteps()}/${steps.length}`}</Text>
          <View className="flex-row gap-1">
            {steps.map((step, index) => (
              <View
                className={`h-1 flex-1 rounded-lg ${step.completed ? "bg-[green]" : "bg-[#D9D9D9]"}`}
                key={index}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
