import { StyleSheet } from "react-native";
import { themes } from "../../global/themes";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 14
  },
  title: {
    fontSize: 24,
    fontFamily: "PurplePurse_400Regular",
    color: themes.colors.gray,
    letterSpacing: 1,
  },
  line: { height: 2, width: "100%", backgroundColor: "gray", flex: 1 },
});
