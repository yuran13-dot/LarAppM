import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useUtentes } from "../../hooks/useUtentes";

const GerenciarUtenteModal = ({ visible, onClose, utente }) => {
  const { inativarUtente, ativarUtente, deletarUtente, loading } = useUtentes();

  const handleInativar = async () => {
    try {
      const success = await inativarUtente(utente.id);
      if (success) {
        Alert.alert("Sucesso", "Utente inativado com sucesso");
        onClose();
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao inativar utente");
    }
  };

  const handleAtivar = async () => {
    try {
      const success = await ativarUtente(utente.id);
      if (success) {
        Alert.alert("Sucesso", "Utente ativado com sucesso");
        onClose();
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao ativar utente");
    }
  };

  const handleDeletar = async () => {
    Alert.alert(
      "Confirmar Deleção",
      "Esta ação não pode ser desfeita. Deseja realmente deletar este utente?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deletarUtente(utente.id);
              if (success) {
                Alert.alert("Sucesso", "Utente deletado com sucesso");
                onClose();
              }
            } catch (error) {
              Alert.alert("Erro", "Erro ao deletar utente");
            }
          },
        },
      ]
    );
  };

  if (!visible || !utente) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Gerenciar Utente</Text>
          <Text style={styles.subtitle}>
            Escolha uma ação para o utente {utente.nome}
          </Text>

          {utente.status === "ativo" ? (
            <TouchableOpacity
              style={[styles.button, styles.inativarButton]}
              onPress={handleInativar}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Inativar Utente</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.ativarButton]}
              onPress={handleAtivar}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Ativar Utente</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.deletarButton]}
            onPress={handleDeletar}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Deletar Permanentemente</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelarButton]}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.cancelarText]}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  inativarButton: {
    backgroundColor: "#f39c12",
  },
  ativarButton: {
    backgroundColor: "#2ecc71",
  },
  deletarButton: {
    backgroundColor: "#e74c3c",
  },
  cancelarButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 10,
  },
  cancelarText: {
    color: "#333",
  },
});

export default GerenciarUtenteModal;
