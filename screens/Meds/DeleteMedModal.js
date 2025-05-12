import React from "react";
import { Modal, Text, TouchableOpacity, Alert, View } from "react-native";
import { doc, deleteDoc } from "firebase/firestore";
import { LarApp_db } from "../../firebaseConfig";
import styles from "./styles";

export default function DeleteMedModal({
  visible,
  onClose,
  med,
  onDeleteSuccess,
}) {
  const handleDelete = async () => {
    try {
      const medRef = doc(LarApp_db, "medicamentos", med.id);
      await deleteDoc(medRef);
      Alert.alert("Sucesso", "Medicamento deletado com sucesso!");
      onDeleteSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao deletar medicamento:", error);
      Alert.alert("Erro", "Ocorreu um erro ao deletar o medicamento.");
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.deleteModalOverlay} onPress={onClose}>
        <TouchableOpacity style={styles.deleteModalContainer} activeOpacity={1}>
          <Text style={styles.deleteTitle}>
            Tem certeza que deseja excluir?
          </Text>
          <Text style={styles.deleteMessage}>
            A exclusão é permanente e não pode ser desfeita.
          </Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.buttonText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
