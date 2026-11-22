import { Text, View } from "react-native";
import Title from "../../../components/Title";
import { Input } from "../../../components/Input";
import CardProduct from "../../../components/CardProduct";
import { KeyboardScrollView } from "../../../components/KeyboardScrollView";

export default function AllBatches() {
  return (
    <View className="flex-1 items-center bg-background">
      <View className="mb-20 h-full w-full items-center p-6">
        <Title label="Estoque" />
        <View className="mb-6 w-full">
          <Input placeholder="Buscar lote..." />
        </View>
        <KeyboardScrollView
          className="w-full"
          keyboardShouldPersistTaps="handled"
        >
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
        </KeyboardScrollView>
      </View>
    </View>
  );
}
