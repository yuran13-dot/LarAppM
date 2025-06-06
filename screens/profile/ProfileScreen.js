import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, StatusBar, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/AuthContext'; // Importando o hook para acessar os dados do contexto
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth, LarApp_db } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default function ProfileScreen() {
  const { user, userData, fetchUserData } = useAuth(); // Consumindo os dados do contexto
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Primeiro buscar dados do usuário
      const userQuery = query(
        collection(LarApp_db, "users"),
        where("uid", "==", user.uid)
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        setProfileData(userData);

        // Se for utente, buscar dados adicionais da coleção utentes
        if (userData.role === "utente") {
          const utenteQuery = query(
            collection(LarApp_db, "utentes"),
            where("id", "==", user.uid)
          );
          const utenteSnapshot = await getDocs(utenteQuery);

          if (!utenteSnapshot.empty) {
            const utenteData = utenteSnapshot.docs[0].data();
            // Atualizar o estado com os dados do utente
            setProfileData(prevData => ({
              ...prevData,
              ...utenteData
            }));
          }
        }
        
        // Se for funcionario, buscar dados adicionais da coleção funcionarios
        if (userData.role === "funcionario") {
          const funcionarioQuery = query(
            collection(LarApp_db, "funcionarios"),
            where("id", "==", user.uid)
          );
          const funcionarioSnapshot = await getDocs(funcionarioQuery);

          if (!funcionarioSnapshot.empty) {
            const funcionarioData = funcionarioSnapshot.docs[0].data();
            // Atualizar o estado com os dados do funcionário
            setProfileData(prevData => ({
              ...prevData,
              ...funcionarioData
            }));
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar os dados do usuário.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Usar useFocusEffect para recarregar os dados quando a tela receber foco
  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [user])
  );

  const handleLogout = async () => {
    Alert.alert(
      "Sair da Conta",
      "Tem certeza que deseja sair?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              await AsyncStorage.removeItem('userData'); 
            } catch (error) {
              console.error('Erro ao sair:', error);
            }
          }
        }
      ]
    );
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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft} />
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Icon name="person-circle-outline" size={70} color="#fff" />
          </View>
          <Text style={styles.userName}>{profileData?.name || 'Nome não disponível'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.userRole}>{getRoleLabel(profileData?.role)}</Text>
          </View>
        </View>
        
        {profileData?.role?.toLowerCase() === 'admin' && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Icon name="create-outline" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Icon name="mail-outline" size={24} color="#007bff" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoText}>{user?.email || 'Email não disponível'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Icon name="call-outline" size={24} color="#007bff" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Telefone</Text>
                  <Text style={styles.infoText}>{profileData?.contacto || 'Não informado'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Icon name="calendar-outline" size={24} color="#007bff" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Data de Nascimento</Text>
                  <Text style={styles.infoText}>{profileData?.dataNascimento || 'Não informado'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Icon name="home-outline" size={24} color="#007bff" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Morada</Text>
                  <Text style={styles.infoText}>{profileData?.morada || 'Não informado'}</Text>
                </View>
              </View>
            </View>
          </View>

          {profileData?.role === 'utente' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações Médicas</Text>
              <View style={styles.infoCard}>
               

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Icon name="medical-outline" size={24} color="#007bff" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Medicações</Text>
                    <Text style={styles.infoText}>
                      {profileData?.medicamentos?.length > 0 
                        ? profileData.medicamentos.map(med => med.nome).join(', ')
                        : 'Não informado'}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Icon name="pulse-outline" size={24} color="#007bff" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Sinais Vitais</Text>
                    <Text style={styles.infoText}>
                      {profileData?.dadosVitais?.length > 0 
                        ? `Última medição: ${new Date(profileData.dadosVitais[profileData.dadosVitais.length - 1].data.toDate()).toLocaleString()}`
                        : 'Não informado'}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Icon name="calendar-outline" size={24} color="#007bff" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Atividades</Text>
                    <Text style={styles.infoText}>
                      {profileData?.atividades?.length > 0 
                        ? `${profileData.atividades.length} atividades agendadas`
                        : 'Nenhuma atividade agendada'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          
          {profileData?.role === 'funcionario' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações Profissionais</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Icon name="briefcase-outline" size={24} color="#007bff" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Função</Text>
                    <Text style={styles.infoText}>{profileData?.funcao || 'Não informado'}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

            
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Icon name="people-outline" size={24} color="#007bff" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Utentes Responsáveis</Text>
                    <Text style={styles.infoText}>
                      {profileData?.utentesResponsaveis?.length > 0 
                        ? `${profileData.utentesResponsaveis.length} utentes`
                        : 'Nenhum utente atribuído'}
                    </Text>
                  </View>
                </View>
                
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#007bff',
    padding: 15,
    alignItems: 'center',
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  headerLeft: {
    width: 24,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  userRole: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});
