import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import Title from "../../../components/Title";
import { useRecipe } from "../../../api/recipes";
import { errorMessage } from "../../../lib/api";
import { colors } from "../../../shared/colors";
import type { AppStackParamList } from "../../../routes/app.routes";
import { RecipeForm } from "../NewRecipe/RecipeForm";

export default function EditRecipe() {
  const { params } = useRoute<RouteProp<AppStackParamList, "EditRecipe">>();
  const { data: recipe, isPending, error, refetch } = useRecipe(params.id);

  // O formulário só monta com a receita em mãos: os campos são iniciados uma vez.
  if (recipe) return <RecipeForm title="Editar receita" recipe={recipe} />;

  return (
    <View className="flex-1 bg-background px-4 pt-6">
      <Title label="Editar receita" />
      {isPending ? (
        <View className="items-center py-10">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View className="items-center gap-2 py-10">
          <Text className="text-center font-body text-sm text-ink-muted">
            {errorMessage(error, "Não foi possível carregar a receita.")}
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
      )}
    </View>
  );
}
