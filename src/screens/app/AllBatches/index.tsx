import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Title from "../../../components/Title";
import { Input } from "../../../components/Input";
import CardProduct from "../../../components/CardProduct";
import { KeyboardScrollView } from "../../../components/KeyboardScrollView";
import { useBatches } from "../../../api/batches";
import { errorMessage } from "../../../lib/api";
import { colors } from "../../../shared/colors";
import { normalize } from "../../../shared/text";
import type { AppStackParamList } from "../../../routes/app.routes";

export default function AllBatches() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {
    data: batches = [],
    isPending,
    error,
    refetch,
    isRefetching,
  } = useBatches();
  const [search, setSearch] = useState("");

  const filteredBatches = useMemo(() => {
    const query = normalize(search);
    if (!query) return batches;

    return batches.filter(
      (batch) =>
        normalize(batch.code).includes(query) ||
        normalize(batch.recipe.name).includes(query) ||
        normalize(batch.recipe.category).includes(query),
    );
  }, [batches, search]);

  return (
    <View className="flex-1 bg-background px-4 pt-6">
      <Title label="Estoque" />

      <View className="mb-4">
        <Input
          placeholder="Buscar lote..."
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          returnKeyType="search"
          leftIcon={
            <Feather name="search" size={18} color={colors.ink.DEFAULT} />
          }
          rightIcon={
            search ? (
              <Feather
                name="x"
                size={18}
                color={colors.ink.DEFAULT}
                onPress={() => setSearch("")}
                accessibilityLabel="Limpar busca"
              />
            ) : undefined
          }
        />
      </View>

      <FlatList
        data={filteredBatches}
        keyExtractor={(batch) => batch.id}
        renderItem={({ item }) => (
          <CardProduct
            batch={item}
            onPress={() => navigation.navigate("BatchDetail", { id: item.id })}
          />
        )}
        // a TabBar é absoluta: o fim da lista precisa passar por baixo dela
        contentContainerClassName="gap-2 pb-28"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderScrollComponent={(props) => <KeyboardScrollView {...props} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          isPending ? (
            <View className="items-center py-10">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : error ? (
            <View className="items-center gap-2 py-10">
              <Feather name="wifi-off" size={28} color={colors.line.DEFAULT} />
              <Text className="text-center font-body text-sm text-ink-muted">
                {errorMessage(error, "Não foi possível carregar os lotes.")}
              </Text>
              <Pressable
                onPress={() => refetch()}
                accessibilityRole="button"
                hitSlop={8}
              >
                <Text className="font-body-medium text-sm text-accent-text">
                  Tentar novamente
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="items-center gap-2 py-10">
              <Feather
                name={search ? "search" : "box"}
                size={28}
                color={colors.line.DEFAULT}
              />
              <Text className="font-body text-sm text-ink-muted">
                {search ? "Nenhum lote encontrado" : "Você ainda não tem lotes"}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
