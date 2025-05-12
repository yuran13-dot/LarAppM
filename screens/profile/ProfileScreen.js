import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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

  const getRoleLabel = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'Administrador';
      case 'utente':
        return 'Utente';
      case 'funcionario':
        return 'Funcionário';
      default:
        return 'Não definido';
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Usuário não autenticado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Icon name="person-circle-outline" size={80} color="#007bff" />
          </View>
          <Text style={styles.userName}>{userData?.name || 'Nome não disponível'}</Text>
          <Text style={styles.userRole}>{getRoleLabel(userData?.role)}</Text>
        </View>
        
        {userData?.role?.toLowerCase() === 'admin' && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Icon name="create-outline" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Pessoais</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="mail-outline" size={20} color="#007bff" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoText}>{user?.email || 'Email não disponível'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="call-outline" size={20} color="#007bff" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Telefone</Text>
              <Text style={styles.infoText}>{userData?.phone || 'Não informado'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="calendar-outline" size={20} color="#007bff" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Data de Nascimento</Text>
              <Text style={styles.infoText}>{userData?.nascimento || 'Não informado'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="home-outline" size={20} color="#007bff" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Morada</Text>
              <Text style={styles.infoText}>{userData?.morada || 'Não informado'}</Text>
            </View>
          </View>
        </View>
      </View>

      {userData?.role === 'utente' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Médicas</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="fitness-outline" size={20} color="#007bff" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Condições Médicas</Text>
                <Text style={styles.infoText}>{userData?.condicoesMedicas || 'Não informado'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="medical-outline" size={20} color="#007bff" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Medicações</Text>
                <Text style={styles.infoText}>{userData?.medicacoes || 'Não informado'}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
    paddingTop: 30,
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#666',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  error: {
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});
