// navigation/ProfileStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../../hooks/AuthContext';
import ProfileScreen from './ProfileScreen';
import EditProfileScreen from './EditProfile';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  const { userData } = useAuth();
  
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ headerShown: false }} 
      />
      {userData?.role?.toLowerCase() === 'admin' && (
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen} 
          options={{ headerShown: false }} 
        />
      )}
    </Stack.Navigator>
  );
}
