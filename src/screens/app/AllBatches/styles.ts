import { StyleSheet } from "react-native";
import { themes } from "../../../global/themes";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themes.colors.background,
    alignItems: "center",
  },
  content: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    padding: 24,
    marginBottom: 80,
  },
});
