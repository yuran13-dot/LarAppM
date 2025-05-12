import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthProvider, useAuth } from "./hooks/AuthContext";
import LoginScreen from "./screens/login/login";
import HomeScreen from "./screens/home/home";
import ForgotPasswordScreen from "./screens/recuperar/recuperar";
import ProfileScreen from "./screens/profile/ProfileScreen"; // Tela de Perfil
import EditProfileScreen from "./screens/profile/EditProfile"; // Tela de Editar Perfil
import AgendaScreen from "./screens/agenda/AgendaScreen"; // Tela de Agenda
import ChatScreen from "./screens/chat/ChatScreen"; // Tela de Chat
import ProfileStack from "./screens/profile/ProfileStack"; // Stack de Perfil
import { ActivityIndicator, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import RoomsScreen from "./screens/rooms/RoomsScreen";
import HomeStack from "./navigation/HomeStack"; // Stack de Home
import EditUtenteScreen from "./screens/profile/EditProfile";
import LarScreen from "./screens/lar/LarScreen";
import MedsScreen from "./screens/Meds/MedsScreen";
import MedicacaoUtentesScreen from "./screens/Meds/MedicacaoUtentesScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RoomsScreen"
        component={RoomsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditUtente"
        component={EditUtenteScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Stack para a Gestão do Lar
function GestaoStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="GestaoHome"
        component={LarScreen}
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
    </Stack.Navigator>
  );
}

// Tab para quem está logado
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "#a9a9a9",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Gestão"
        component={GestaoStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="business-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return user ? <AppTabs /> : <AuthStack />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}
