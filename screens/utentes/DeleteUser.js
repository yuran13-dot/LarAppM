import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, StyleSheet, Alert,View } from 'react-native';
import { doc, deleteDoc } from 'firebase/firestore';
import { LarApp_db } from '../../firebaseConfig';

export default function DeleteUtenteModal({ visible, onClose, utente, onDeleteSuccess }) {
  const handleDelete = async () => {
    try {
      const utenteRef = doc(LarApp_db, 'utentes', utente.id);
      await deleteDoc(utenteRef);
      Alert.alert('Sucesso', 'Utente deletado com sucesso!');
      onDeleteSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao deletar utente:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao deletar o utente.');
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} onPress={onClose}>
        <TouchableOpacity style={styles.modalContainer} activeOpacity={1}>
          <Text style={styles.title}>Tem certeza que deseja excluir?</Text>
          <Text style={styles.message}>
            A exclusão é permanente e não pode ser desfeita.
          </Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.buttonText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: 120,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
    width: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
