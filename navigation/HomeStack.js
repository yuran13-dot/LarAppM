import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/home/home";
import RoomsScreen from "../screens/rooms/RoomsScreen";
import UtentesScreen from "../screens/utentes/UtentesScreen";
import FuncionarioScreen from "../screens/funcionarios/FuncionarioScreen";
import RelatorioScreen from "../screens/relatorio/RelatoeioScreen";
import MedsScreen from "../screens/Meds/MedsScreen";
import MedicacaoUtentesScreen from "../screens/Meds/MedicacaoUtentesScreen";
import AdicionarMedicacaoUtente from "../screens/Meds/AdicionarMedicacaoUtente";
import PerfilUtente from "../screens/utentes/PerfilUtente";
import AtividadesScreen from "../screens/atividades/AtividadesScreen";
import DetalhesAtividadeScreen from "../screens/atividades/DetalhesAtividadeScreen";
import UtenteActivities from "../screens/utentes/UtenteActivities";
import UtenteMedicalInfo from "../screens/utentes/UtenteMedicalInfo";

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
        name="UtenteActivities"
        component={UtenteActivities}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UtenteMedicalInfo"
        component={UtenteMedicalInfo}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MedsScreen"
        component={MedsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MedicacaoUtentesScreen"
        component={MedicacaoUtentesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdicionarMedicacaoUtente"
        component={AdicionarMedicacaoUtente}
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
      <Stack.Screen
        name="AtividadesScreen"
        component={AtividadesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DetalhesAtividade"
        component={DetalhesAtividadeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PerfilUtente"
        component={PerfilUtente}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
