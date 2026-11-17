import { ScrollView, Text, View } from "react-native";
import Title from "../../../components/Title";
import { Input } from "../../../components/Input";
import CardProduct from "../../../components/CardProduct";

export default function AllBatches() {
  return (
    <View className="flex-1 items-center bg-background">
      <View className="mb-20 h-full w-full items-center p-6">
        <Title label="Estoque" />
        <View className="mb-6 w-full">
          <Input placeholder="Buscar lote..." />
        </View>
        <ScrollView className="w-full">
          <View className="gap-2">
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
