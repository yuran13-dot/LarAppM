import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function QuartoDetalhesModal({ visible, onClose, quarto }) {
  if (!quarto) return null;

  const { numero, estado, tipo } = quarto;
  const isOcupado = estado.toLowerCase() === 'ocupado';

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

          <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
            <Text style={styles.closeModalText}>Fechar</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 25, width: '85%', elevation: 5 },
  closeButton: { position: 'absolute', top: 10, right: 10 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  icon: { marginRight: 10 },
  label: { fontSize: 16, color: '#666', width: 70 },
  value: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  closeModalButton: { marginTop: 25, backgroundColor: '#007bff', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  closeModalText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
