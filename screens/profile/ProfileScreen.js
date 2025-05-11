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
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarCircle}>
          <Icon name="person-circle-outline" size={70} color="#fff" />
        </View>
        <Text style={styles.avatarName}>{userData?.name || 'Nome não disponível'}</Text>
      </View>

      {/* Dados pessoais */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Nome Completo</Text>
        <Text style={styles.visualField}>{userData?.name || 'Nome não disponível'}</Text>

        <Text style={styles.label}>Data de Nascimento</Text>
        <Text style={styles.visualField}>{userData?.nascimento || 'Não informado'}</Text>

        <Text style={styles.label}>Contactos</Text>
        <Text style={styles.visualField}>{user?.email || 'Email não disponível'}</Text>
        <Text style={styles.visualField}>{userData?.phone || 'Telefone não disponível'}</Text>

        <Text style={styles.label}>Morada</Text>
        <Text style={styles.visualField}>{userData?.morada || 'Morada não disponível'}</Text>

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: '#F4F6F9',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',  // Cor vibrante para o avatar
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  avatarName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  fieldGroup: {
    marginTop: 40,
    width: '100%',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  visualField: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 14,
    marginBottom: 15,
    color: '#555',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
