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
import Title from "../../../components/Title";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { useNavigation } from "@react-navigation/native";
import { KeyboardScrollView } from "../../../components/KeyboardScrollView";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../../../shared/colors";
import { Recipe, useRecipes } from "../../../api/recipes";
import { errorMessage } from "../../../lib/api";
import type { AppStackParamList } from "../../../routes/app.routes";
import { formatTotalDuration, totalMinutes } from "../../../shared/duration";
import { normalize } from "../../../shared/text";

function RecipeCard({
  recipe,
  onPress,
}: {
  recipe: Recipe;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={recipe.name}
      accessibilityHint="Abre os detalhes da receita"
      className="flex-row items-center gap-3 rounded-md border border-line bg-surface p-3 active:opacity-70"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
        <Feather name="book-open" size={18} color={colors.accent.DEFAULT} />
      </View>
      <View className="flex-1">
        <Text className="font-body-medium text-sm text-ink">{recipe.name}</Text>
        <Text className="font-body text-xs text-ink-muted">
          {recipe.category} · {formatTotalDuration(totalMinutes(recipe.steps))}{" "}
          · {recipe.steps.length}{" "}
          {recipe.steps.length === 1 ? "etapa" : "etapas"}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.line.DEFAULT} />
    </Pressable>
  );
}

export default function Recipes() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {
    data: recipes = [],
    isPending,
    error,
    refetch,
    isRefetching,
  } = useRecipes();
  const [search, setSearch] = useState("");

  const filteredRecipes = useMemo(() => {
    const query = normalize(search);
    if (!query) return recipes;

    return recipes.filter(
      (recipe) =>
        normalize(recipe.name).includes(query) ||
        normalize(recipe.category).includes(query),
    );
  }, [recipes, search]);

  function handleNewRecipe() {
    navigation.navigate("NewRecipe");
  }

  return (
    <View className="flex-1 bg-background px-4 pt-6">
      <Title label="Receitas" />

      <Input
        placeholder="Buscar receita..."
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

      <Button label="Nova receita" onPress={handleNewRecipe} />

      <FlatList
        data={filteredRecipes}
        keyExtractor={(recipe) => recipe.id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => navigation.navigate("RecipeDetail", { id: item.id })}
          />
        )}
        contentContainerClassName="gap-2 pb-6"
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
                {errorMessage(error, "Não foi possível carregar as receitas.")}
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
                name={search ? "search" : "book-open"}
                size={28}
                color={colors.line.DEFAULT}
              />
              <Text className="font-body text-sm text-ink-muted">
                {search
                  ? "Nenhuma receita encontrada"
                  : "Você ainda não tem receitas"}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
