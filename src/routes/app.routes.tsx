import { TabBar } from "../components/TabBar";
import { NavBar } from "../components/NavBar";
import Home from "../screens/app/Home";
import AllBatches from "../screens/app/AllBatches";
import AddBatch from "../screens/app/AddBatch";
import Planner from "../screens/app/Planner";
import Profile from "../screens/app/Profile";
import EditProfile from "../screens/app/EditProfile";
import Recipes from "../screens/app/Recipes";
import NewRecipe from "../screens/app/NewRecipe";
import RecipeDetail from "../screens/app/RecipeDetail";
import EditRecipe from "../screens/app/EditRecipe";
import BatchDetail from "../screens/app/BatchDetail";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigatorScreenParams } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type AppTabParamList = {
  Home: undefined;
  Profile: undefined;
  Planner: undefined;
  AllBatches: undefined;
  AddBatch: undefined;
};

export type AppStackParamList = {
  AppTabs: NavigatorScreenParams<AppTabParamList>;
  EditProfile: undefined;
  Recipes: undefined;
  NewRecipe: undefined;
  RecipeDetail: { id: string };
  EditRecipe: { id: string };
  BatchDetail: { id: string };
};

const Tab = createBottomTabNavigator<AppTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

function AppTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ header: (props) => <NavBar {...props} /> }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: "Início",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AllBatches"
        component={AllBatches}
        options={{
          tabBarLabel: "Lotes",
          tabBarIcon: ({ color, size }) => (
            <Feather name="box" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AddBatch"
        component={AddBatch}
        options={{
          tabBarLabel: "Adicionar",
          tabBarIcon: ({ color, size }) => (
            <Feather name="plus-square" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Planner"
        component={Planner}
        options={{
          tabBarLabel: "Agenda",
          tabBarIcon: ({ color, size }) => (
            <Feather name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppRoutes() {
  // Cliente criado aqui (só na árvore logada): ao sair da conta ele é desmontado
  // junto com o cache, e o próximo usuário nunca vê dados do anterior.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AppTabs" component={AppTabs} />
        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{
            headerShown: true,
            header: (props) => <NavBar {...props} />,
          }}
        />
        <Stack.Screen
          name="Recipes"
          component={Recipes}
          options={{
            headerShown: true,
            header: (props) => <NavBar {...props} />,
          }}
        />
        <Stack.Screen
          name="NewRecipe"
          component={NewRecipe}
          options={{
            headerShown: true,
            header: (props) => <NavBar {...props} />,
          }}
        />
        <Stack.Screen
          name="RecipeDetail"
          component={RecipeDetail}
          options={{
            headerShown: true,
            header: (props) => <NavBar {...props} />,
          }}
        />
        <Stack.Screen
          name="EditRecipe"
          component={EditRecipe}
          options={{
            headerShown: true,
            header: (props) => <NavBar {...props} />,
          }}
        />
        <Stack.Screen
          name="BatchDetail"
          component={BatchDetail}
          options={{
            headerShown: true,
            header: (props) => <NavBar {...props} />,
          }}
        />
      </Stack.Navigator>
    </QueryClientProvider>
  );
}
