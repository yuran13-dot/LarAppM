import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { doc, deleteDoc } from 'firebase/firestore';
import { LarApp_db } from '../../firebaseConfig';

export default function QuartoDetalhesModal({ visible, onClose, quarto }) {
  if (!quarto) return null;

  const { id, numero, estado, tipo } = quarto;
  const isOcupado = estado.toLowerCase() === 'ocupado';

  const handleDelete = () => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja apagar o quarto ${numero}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isOcupado) {
                Alert.alert('Erro', 'Não é possível deletar um quarto ocupado.');
                return;
              }

              if (!id) {
                console.error('ID do quarto não encontrado:', quarto);
                Alert.alert('Erro', 'ID do quarto não encontrado.');
                return;
              }

              console.log('Tentando deletar quarto com ID:', id);
              const quartoRef = doc(LarApp_db, 'quartos', id);
              await deleteDoc(quartoRef);
              
              console.log('Quarto deletado com sucesso');
              Alert.alert('Sucesso', 'Quarto apagado com sucesso!');
              onClose();
            } catch (error) {
              console.error('Erro ao apagar quarto:', error);
              Alert.alert('Erro', `Ocorreu um erro ao apagar o quarto: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close-circle" size={30} color="#ff4d4d" />
          </TouchableOpacity>

          <Text style={styles.title}>Detalhes do Quarto</Text>

          <View style={styles.infoRow}>
            <Icon name="bed" size={22} color="#007bff" style={styles.icon} />
            <Text style={styles.label}>Número:</Text>
            <Text style={styles.value}>{numero}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name={isOcupado ? 'person' : 'person-outline'} size={22} color={isOcupado ? '#28a745' : '#ffc107'} style={styles.icon} />
            <Text style={styles.label}>Estado:</Text>
            <Text style={[styles.value, { color: isOcupado ? '#28a745' : '#ffc107' }]}>
              {isOcupado ? 'Ocupado' : 'Livre'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="people" size={22} color="#6c757d" style={styles.icon} />
            <Text style={styles.label}>Tipo:</Text>
            <Text style={styles.value}>{tipo}</Text>
          </View>

          <TouchableOpacity 
            style={[styles.deleteButton, isOcupado && styles.deleteButtonDisabled]} 
            onPress={handleDelete}
            disabled={isOcupado}
          >
            <Icon name="trash-bin" size={20} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.deleteButtonText}>
              {isOcupado ? 'Quarto Ocupado' : 'Apagar Quarto'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
            <Text style={styles.closeModalText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  value: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  deleteButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.7,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeModalButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  closeModalText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
});
