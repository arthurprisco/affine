import { ScrollView, Text, View } from "react-native";
import { styles } from "./styles";
import Title from "../../../components/Title";
import { Input } from "../../../components/Input";
import CardProduct from "../../../components/CardProduct";

export default function AllBatches() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Title label="Estoque" />
        <View style={{ width: "100%", marginBottom: 24 }}>
          <Input placeholder="Buscar lote..." />
        </View>
        <ScrollView style={{ width: "100%" }}>
          <View style={{ gap: 8 }}>
            <CardProduct />
            <CardProduct />
            <CardProduct />
            <CardProduct />
            <CardProduct />
            <CardProduct />
            <CardProduct />
            <CardProduct />
            <CardProduct />
            <CardProduct />
            <CardProduct />
            <CardProduct />
            <CardProduct />
            <CardProduct />
            <CardProduct />
            <CardProduct />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
