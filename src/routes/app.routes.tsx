import { TabBar } from "../components/TabBar";
import { NavBar } from "../components/NavBar";
import Home from "../screens/app/Home";
import AllBatches from "../screens/app/AllBatches";
import AddBatch from "../screens/app/AddBatch";
import Planner from "../screens/app/Planner";
import Profile from "../screens/app/Profile";
import EditProfile from "../screens/app/EditProfile";
import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type AppTabParamList = {
  Home: undefined;
  Profile: undefined;
  Planner: undefined;
  AllBatches: undefined;
  AddBatch: undefined;
};

type AppStackParamList = {
  AppTabs: undefined;
  EditProfile: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

function AppTabs() {
  return (
    <Tab.Navigator tabBar={(props) => <TabBar {...props} />} screenOptions={{ header: (props) => <NavBar {...props} /> }}>
      <Tab.Screen name="Home" component={Home} options={{ tabBarLabel: "Início", tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} /> }} />
      <Tab.Screen name="AllBatches" component={AllBatches} options={{ tabBarLabel: "Lotes", tabBarIcon: ({ color, size }) => <Feather name="box" color={color} size={size} /> }} />
      <Tab.Screen name="AddBatch" component={AddBatch} options={{ tabBarLabel: "Adicionar", tabBarIcon: ({ color, size }) => <Feather name="plus-square" color={color} size={size} /> }} />
      <Tab.Screen name="Planner" component={Planner} options={{ tabBarLabel: "Agenda", tabBarIcon: ({ color, size }) => <Feather name="calendar" color={color} size={size} /> }} />
      <Tab.Screen name="Profile" component={Profile} options={{ tabBarLabel: "Perfil", tabBarIcon: ({ color, size }) => <Feather name="user" color={color} size={size} /> }} />
    </Tab.Navigator>
  );
}

export default function AppRoutes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppTabs" component={AppTabs} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
    </Stack.Navigator>
  );
}
