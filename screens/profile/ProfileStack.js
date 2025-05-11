// navigation/ProfileStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from './ProfileScreen';
import EditProfileScreen from './EditProfile';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}
