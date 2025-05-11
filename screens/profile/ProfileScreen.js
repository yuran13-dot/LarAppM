// screens/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/AuthContext'; // Importando o hook para acessar os dados do contexto
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function ProfileScreen() {
  const { user, userData } = useAuth(); // Consumindo os dados do contexto
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('userData'); 
     
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Usuário não autenticado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      
      <Text style={styles.name}>{userData?.name || 'Nome não disponível'}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Editar Perfil</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>

     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f6f6f6',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#777',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  settingsIcon: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  error: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
