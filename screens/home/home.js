import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../../hooks/AuthContext";
import AdminHome from "./AdminHome";
import UtenteHome from "./UtenteHome";
import FuncionarioHome from "./FuncionarioHome";

export default function HomeScreen() {
  const { user, userData } = useAuth();

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  // Log the role for debugging purposes
  console.log("Current user role:", userData.role);

  switch (userData.role?.toLowerCase()) {
    case 'admin':
      return <AdminHome />;
    case 'utente':
      return <UtenteHome />;
    case 'funcionario':
      return <FuncionarioHome />;
    default:
      console.warn('Role não reconhecida:', userData.role);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Tipo de usuário não reconhecido.</Text>
          <Text style={styles.errorSubtext}>Por favor, contacte o administrador.</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
