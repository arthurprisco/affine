import { StyleSheet } from "react-native";
import { themes } from "../../global/themes";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: themes.colors.border,
    borderRadius: 8,
    width: "100%",
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgeBatch: {
    backgroundColor: "#ECECEC",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  remainingDaysBox: {
    borderWidth: 1,
    borderColor: themes.colors.secondary,
    borderRadius: 8,
    backgroundColor: "#F8E1CD",
  },
  remainingDaysText: {
    color: themes.colors.secondary,
    fontSize: 13,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  progressBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  progressBarPlaceholder: {
    position: "absolute",
    width: "100%",
    height: 4,
    backgroundColor: "#D9D9D9",
    borderRadius: 8,
  },
  progressBar: {
    position: "absolute",
    width: "90%",
    height: 4,
    backgroundColor: themes.colors.primary,
    borderRadius: 8,
  },
});
