import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/home';
import RoomsScreen from '../screens/rooms/RoomsScreen';


const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{headerShown: false  }} />
      <Stack.Screen name="RoomsScreen" component={RoomsScreen} options={{ headerShown: false  }} />
         </Stack.Navigator>
  );
}
