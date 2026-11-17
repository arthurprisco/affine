import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";

type CircularProgressProps = {
  value: string;
  label: string;
  percentage: number;
  color: string;
  trackColor: string;
};

export const CircularProgress = ({
  value,
  label,
  percentage,
  color,
  trackColor,
}: CircularProgressProps) => {
  const size = 90; // Tamanho total do anel
  const strokeWidth = 10; // Espessura da linha
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Calcula o quanto o círculo deve ser preenchido
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View className="items-center">
      <View className="relative items-center justify-center">
        <Svg width={size} height={size}>
          {/* Círculo de Fundo (Trilha) */}
          <Circle
            stroke={trackColor}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {/* Círculo de Progresso */}
          <Circle
            stroke={color}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </Svg>
        {/* Número centralizado */}
        <View className="absolute inset-0 items-center justify-center">
          <Text className="text-[26px] font-black text-black">{value}</Text>
        </View>
      </View>
      <Text className="mt-3 text-xs font-bold tracking-[1px] text-black">
        {label}
      </Text>
    </View>
  );
};
