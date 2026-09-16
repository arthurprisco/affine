import { Button, Pressable, ScrollView, Text, View } from "react-native";
import Title from "../../../components/Title";
import CardProduct from "../../../components/CardProduct";
import { styles } from "./styles";
import { useNavigation } from "@react-navigation/native";
import { CircularProgress } from "../../../components/CircularProgress";
import { themes } from "../../../global/themes";

export default function Home() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Title label="lotes" />
          <View style={styles.mainCard}>
            <CircularProgress
              value="50"
              label="CARNES"
              percentage={50} // Define o tamanho do traço azul
              color={themes.colors.primary}
              trackColor={themes.colors.secondary}
            />
            <CircularProgress
              value="10"
              label="CARNES"
              percentage={10} // Define o tamanho do traço azul
              color={themes.colors.primary}
              trackColor={themes.colors.secondary}
            />
            <CircularProgress
              value="10"
              label="CARNES"
              percentage={10} // Define o tamanho do traço azul
              color={themes.colors.primary}
              trackColor={themes.colors.secondary}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-between",
              marginTop: 16,
              marginBottom: 8,
              paddingHorizontal: 8,
            }}
          >
            <Text>Próximos ao ponto</Text>
            <Pressable
              onPress={() => {
                navigation.navigate("AllBatches");
              }}
            >
              <Text>Ver todos</Text>
            </Pressable>
          </View>
          <View style={{ width: "100%", gap: 8 }}>
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
