import { StyleSheet } from "react-native";

const COLORS = {
  blue: "#2C3D4F",
  orange: "#FDB068",
  bg: "#F5F4F1",
  text: "#000000",
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 15,
    // Sombra para iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    // Sombra para Android
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.blue,
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 1.5,
    fontFamily: "serif", // Tenta usar uma fonte serifada nativa
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  itemContainer: {
    alignItems: "center",
  },
  svgContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  valueContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
  },
  valueText: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.text,
  },
  labelText: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.text,
    letterSpacing: 1,
  },
});
