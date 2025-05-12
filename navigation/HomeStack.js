import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/home/home";
import RoomsScreen from "../screens/rooms/RoomsScreen";
import UtentesScreen from "../screens/utentes/UtentesScreen";
import FuncionarioScreen from "../screens/funcionarios/FuncionarioScreen";
import RelatorioScreen from "../screens/relatorio/RelatoeioScreen";
import MedsScreen from "../screens/Meds/MedsScreen";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator initialRouteName="HomeScreen">
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MedsScreen"
        component={MedsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RoomsScreen"
        component={RoomsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UtentesScreen"
        component={UtentesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FuncionarioScreen"
        component={FuncionarioScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RelatorioScreen"
        component={RelatorioScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
