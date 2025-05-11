import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/AuthContext'; 
import { useNavigation } from '@react-navigation/native';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackButton from '../../components/BackButton';

export default function EditProfileScreen() {
  const { user, userData } = useAuth(); 
  const navigation = useNavigation();
  
  const [name, setName] = useState(userData?.name || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [role, setRole] = useState(userData?.role || '');

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Usuário não autenticado.</Text>
      </View>
    );
  }

  const handleSave = async () => {
    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
        phoneNumber: phone,
      });

      await AsyncStorage.setItem('userData', JSON.stringify({ name, phone, role }));
      navigation.goBack(); // Navega de volta para a tela de perfil
    } catch (error) {
      console.error('Erro ao atualizar o perfil:', error);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={styles.title}>Editar Perfil</Text>
      
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nome"
      />
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Telefone"
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        value={role}
        onChangeText={setRole}
        placeholder="Endereço"
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Salvar</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
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
