import { Text, View } from "react-native";
import { themes } from "../../global/themes";
import { styles } from "./styles";

export default function CardProduct() {
  const products = [
    { name: "Queijo Canastra", amount: 20, batch: "#2026QJ102", steps: [{}] },
  ];
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
    <View style={styles.container}>
      <View style={styles.cardHeader}>
        <View style={{ alignItems: "flex-start", gap: 6 }}>
          <View>
            <Text style={{ fontSize: 16 }}>Queijo Canastra • 20 unidades</Text>
          </View>
          <View style={styles.badgeBatch}>
            <Text style={{ color: "#4D4D4D", fontSize: 13 }}>
              Lote #2026QJ102
            </Text>
          </View>
        </View>

        <View>
          <View style={styles.remainingDaysBox}>
            <Text style={styles.remainingDaysText}>3 dias</Text>
          </View>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <View style={{ gap: 4 }}>
          <View style={styles.progressBarHeader}>
            <Text style={{ color: "#666666", fontSize: 12 }}>Maturação</Text>
            <Text style={{ color: "#666666", fontSize: 12 }}>42/45 dias</Text>
          </View>
          <View style={{ position: "relative" }}>
            <View style={styles.progressBarPlaceholder}></View>
            <View style={styles.progressBar}></View>
          </View>
        </View>

        <View style={{ gap: 4 }}>
          <Text
            style={{
              textAlign: "right",
              paddingHorizontal: 4,
              color: "#666666",
              fontSize: 12,
            }}
          >{`${getCompletedSteps()}/${steps.length}`}</Text>
          <View style={{ gap: 4, flexDirection: "row" }}>
            {steps.map((step, index) => (
              <View
                style={{
                  height: 4,
                  flex: 1,
                  borderRadius: 8,
                  backgroundColor: step.completed ? "green" : "#D9D9D9",
                }}
                key={index}
              ></View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
