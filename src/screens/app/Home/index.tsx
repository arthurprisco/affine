import { Button, Pressable, ScrollView, Text, View } from "react-native";
import Title from "../../../components/Title";
import CardProduct from "../../../components/CardProduct";
import { useNavigation } from "@react-navigation/native";
import { CircularProgress } from "../../../components/CircularProgress";
import { colors } from "../../../shared/colors";

export default function Home() {
  const navigation = useNavigation();
  return (
    <View className="flex-1 items-center bg-background">
      <ScrollView>
        <View className="mb-20 h-full w-full items-center p-6">
          <Title label="lotes" />
          <View className="h-48 w-full flex-row items-center justify-evenly rounded-xl border border-line bg-white">
            <CircularProgress
              value="50"
              label="CARNES"
              percentage={50} // Define o tamanho do traço azul
              color={colors.primary}
              trackColor={colors.accent.DEFAULT}
            />
            <CircularProgress
              value="10"
              label="CARNES"
              percentage={10} // Define o tamanho do traço azul
              color={colors.primary}
              trackColor={colors.accent.DEFAULT}
            />
            <CircularProgress
              value="10"
              label="CARNES"
              percentage={10} // Define o tamanho do traço azul
              color={colors.primary}
              trackColor={colors.accent.DEFAULT}
            />
          </View>
          <View className="mb-2 mt-4 w-full flex-row justify-between px-2">
            <Text>Próximos ao ponto</Text>
            <Pressable
              onPress={() => {
                navigation.navigate("AllBatches");
              }}
            >
              <Text>Ver todos</Text>
            </Pressable>
          </View>
          <View className="w-full gap-2">
            <CardProduct />
            <CardProduct />
            <CardProduct />
            <CardProduct />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
