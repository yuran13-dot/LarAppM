import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { LarApp_db } from "../../firebaseConfig";
import { useAuth } from "../../hooks/AuthContext";
import { Picker } from "@react-native-picker/picker";

export default function PerfilUtente({ route, navigation }) {
  const { utenteId } = route.params;
  const [utente, setUtente] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [medicamentoSelecionado, setMedicamentoSelecionado] = useState(null);
  const [novoStatus, setNovoStatus] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [dosagem, setDosagem] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    carregarDadosUtente();
  }, []);

  const carregarDadosUtente = async () => {
    try {
      setLoading(true);
      const utenteRef = doc(LarApp_db, "utentes", utenteId);
      const utenteDoc = await getDoc(utenteRef);

      if (utenteDoc.exists()) {
        setUtente({ id: utenteDoc.id, ...utenteDoc.data() });
      } else {
        Alert.alert("Erro", "Utente não encontrado");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Erro ao carregar dados do utente:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados do utente");
    } finally {
      setLoading(false);
    }
  };

  const abrirModalMedicamento = (medicamento) => {
    setMedicamentoSelecionado(medicamento);
    setNovoStatus(medicamento.status || "pendente");
    setObservacoes("");
    setDosagem(medicamento.dosagem || "");
    setModalVisible(true);
  };

  const atualizarMedicamento = async () => {
    if (!novoStatus) {
      Alert.alert("Erro", "Por favor, selecione um status");
      return;
    }

    try {
      const medicamentosAtualizados = utente.medicamentos.map((med) => {
        if (med.id === medicamentoSelecionado.id) {
          return {
            ...med,
            status: novoStatus,
            observacoes: observacoes,
            dataAdministracao: novoStatus === "tomado" ? Timestamp.now() : null,
            administradoPor:
              novoStatus === "tomado" ? userData?.name || "Funcionário" : null,
          };
        }
        return med;
      });

      const utenteRef = doc(LarApp_db, "utentes", utenteId);
      await updateDoc(utenteRef, {
        medicamentos: medicamentosAtualizados,
      });

      setUtente((prev) => ({
        ...prev,
        medicamentos: medicamentosAtualizados,
      }));

      Alert.alert("Sucesso", "Medicamento atualizado com sucesso");
      setModalVisible(false);
    } catch (error) {
      console.error("Erro ao atualizar medicamento:", error);
      Alert.alert("Erro", "Não foi possível atualizar o medicamento");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "tomado":
        return "#28a745";
      case "pendente":
        return "#ffc107";
      case "atrasado":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "tomado":
        return "checkmark-circle";
      case "pendente":
        return "time";
      case "atrasado":
        return "alert-circle";
      default:
        return "help-circle";
    }
  };

  const marcarAtividadeConcluida = async (atividadeIndex) => {
    try {
      const atividadesAtualizadas = [...utente.atividades];
      atividadesAtualizadas[atividadeIndex] = {
        ...atividadesAtualizadas[atividadeIndex],
        status: "concluída",
        dataConclusao: new Date(),
      };

      const utenteRef = doc(LarApp_db, "utentes", utenteId);
      await updateDoc(utenteRef, {
        atividades: atividadesAtualizadas,
      });

      setUtente((prev) => ({
        ...prev,
        atividades: atividadesAtualizadas,
      }));

      Alert.alert("Sucesso", "Atividade marcada como concluída");
    } catch (error) {
      console.error("Erro ao atualizar atividade:", error);
      Alert.alert("Erro", "Não foi possível atualizar o status da atividade");
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    carregarDadosUtente().then(() => setRefreshing(false));
  }, []);

  if (loading || !utente) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const medicamentosPendentes =
    utente.medicamentos?.filter((med) => med.status !== "tomado") || [];

  const medicamentosTomados =
    utente.medicamentos?.filter((med) => med.status === "tomado") || [];

  const atividadesPendentes =
    utente.atividades?.filter((atv) => atv.status === "pendente") || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil do Utente</Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <View style={styles.avatarContainer}>
            <Icon name="person-circle" size={80} color="#007bff" />
          </View>
          <Text style={styles.nome}>{utente.nome}</Text>
          <View style={styles.infoRow}>
            <Icon name="card" size={20} color="#666" style={styles.infoIcon} />
            <Text style={styles.info}>Nº Utente: {utente.numeroUtente}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon
              name="calendar"
              size={20}
              color="#666"
              style={styles.infoIcon}
            />
            <Text style={styles.info}>
              Data de Nascimento: {utente.dataNascimento}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="bed" size={20} color="#666" style={styles.infoIcon} />
            <Text style={styles.info}>Quarto: {utente.quarto}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="call" size={20} color="#666" style={styles.infoIcon} />
            <Text style={styles.info}>Contacto: {utente.contacto}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="mail" size={20} color="#666" style={styles.infoIcon} />
            <Text style={styles.info}>Email: {utente.email}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollableSection}
        contentContainerStyle={styles.scrollableContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medicamentos Pendentes</Text>
            <Text style={styles.countBadge}>
              {medicamentosPendentes.length}
            </Text>
          </View>
          {medicamentosPendentes.length > 0 ? (
            medicamentosPendentes.map((med, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.itemCard, { marginBottom: 10 }]}
                onPress={() => abrirModalMedicamento(med)}
              >
                <View style={styles.itemInfo}>
                  <View style={styles.medicamentoHeader}>
                    <Text style={styles.itemTitle}>{med.nome}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(med.status) },
                      ]}
                    >
                      <Icon
                        name={getStatusIcon(med.status)}
                        size={16}
                        color="#fff"
                      />
                      <Text style={styles.statusText}>
                        {med.status || "Pendente"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.medicamentoDetails}>
                    <View style={styles.detailRow}>
                      <Icon
                        name="time"
                        size={16}
                        color="#666"
                        style={styles.detailIcon}
                      />
                      <Text style={styles.itemDetails}>
                        Horário: {med.horario}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon
                        name="medical"
                        size={16}
                        color="#666"
                        style={styles.detailIcon}
                      />
                      <Text style={styles.itemDetails}>
                        Dosagem: {med.dosagem}
                      </Text>
                    </View>
                  </View>
                  {med.observacoes && (
                    <View style={styles.observacoesContainer}>
                      <Icon
                        name="document-text"
                        size={16}
                        color="#666"
                        style={styles.detailIcon}
                      />
                      <Text style={styles.observacoes}>{med.observacoes}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="checkmark-circle" size={40} color="#28a745" />
              <Text style={styles.emptyText}>Nenhum medicamento pendente</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medicamentos Tomados</Text>
            <Text style={styles.countBadge}>{medicamentosTomados.length}</Text>
          </View>
          {medicamentosTomados.length > 0 ? (
            medicamentosTomados.map((med, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.itemCard, { marginBottom: 10 }]}
                onPress={() => abrirModalMedicamento(med)}
              >
                <View style={styles.itemInfo}>
                  <View style={styles.medicamentoHeader}>
                    <Text style={styles.itemTitle}>{med.nome}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(med.status) },
                      ]}
                    >
                      <Icon
                        name={getStatusIcon(med.status)}
                        size={16}
                        color="#fff"
                      />
                      <Text style={styles.statusText}>{med.status}</Text>
                    </View>
                  </View>
                  <View style={styles.medicamentoDetails}>
                    <View style={styles.detailRow}>
                      <Icon
                        name="time"
                        size={16}
                        color="#666"
                        style={styles.detailIcon}
                      />
                      <Text style={styles.itemDetails}>
                        Horário: {med.horario}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon
                        name="medical"
                        size={16}
                        color="#666"
                        style={styles.detailIcon}
                      />
                      <Text style={styles.itemDetails}>
                        Dosagem: {med.dosagem}
                      </Text>
                    </View>
                  </View>
                  {med.observacoes && (
                    <View style={styles.observacoesContainer}>
                      <Icon
                        name="document-text"
                        size={16}
                        color="#666"
                        style={styles.detailIcon}
                      />
                      <Text style={styles.observacoes}>{med.observacoes}</Text>
                    </View>
                  )}
                  <View style={styles.adminInfoContainer}>
                    <Icon
                      name="person"
                      size={16}
                      color="#666"
                      style={styles.detailIcon}
                    />
                    <Text style={styles.adminInfo}>
                      Administrado por: {med.administradoPor}
                      {med.dataAdministracao &&
                        ` em ${med.dataAdministracao
                          .toDate()
                          .toLocaleString()}`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="alert-circle" size={40} color="#ffc107" />
              <Text style={styles.emptyText}>Nenhum medicamento tomado</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximas Atividades</Text>
          {atividadesPendentes.length > 0 ? (
            atividadesPendentes.map((atividade, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{atividade.nome}</Text>
                  <Text style={styles.itemDetails}>
                    Horário: {atividade.horario}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => marcarAtividadeConcluida(index)}
                >
                  <Icon name="checkmark-circle" size={24} color="#28a745" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhuma atividade pendente</Text>
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Atualizar Medicamento</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInfoSection}>
              <Text style={styles.modalInfoTitle}>
                {medicamentoSelecionado?.nome}
              </Text>
              <View style={styles.modalInfoRow}>
                <Icon
                  name="medical"
                  size={16}
                  color="#666"
                  style={styles.modalInfoIcon}
                />
                <Text style={styles.modalInfoText}>
                  Dosagem: {medicamentoSelecionado?.dosagem}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Icon
                  name="time"
                  size={16}
                  color="#666"
                  style={styles.modalInfoIcon}
                />
                <Text style={styles.modalInfoText}>
                  Horário: {medicamentoSelecionado?.horario}
                </Text>
              </View>
            </View>

            <View style={styles.modalDivider} />

            <Text style={styles.modalLabel}>Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={novoStatus}
                onValueChange={(itemValue) => setNovoStatus(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Pendente" value="pendente" />
                <Picker.Item label="Tomado" value="tomado" />
                <Picker.Item label="Atrasado" value="atrasado" />
              </Picker>
            </View>

            <Text style={styles.modalLabel}>Observações</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              value={observacoes}
              onChangeText={setObservacoes}
              placeholder="Digite as observações"
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={atualizarMedicamento}
            >
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 2,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  infoSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  scrollableSection: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollableContent: {
    paddingBottom: 20,
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  nome: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoIcon: {
    marginRight: 10,
  },
  info: {
    flex: 1,
    fontSize: 16,
    color: "#666",
  },
  section: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
  },
  countBadge: {
    backgroundColor: "#007bff",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: "bold",
  },
  itemCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  medicamentoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  medicamentoDetails: {
    marginTop: 5,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  detailIcon: {
    marginRight: 8,
  },
  itemDetails: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  observacoesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  observacoes: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  adminInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  adminInfo: {
    flex: 1,
    fontSize: 12,
    color: "#666",
  },
  emptyContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  loadingText: {
    textAlign: "center",
    fontSize: 18,
    color: "#666",
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    marginBottom: 15,
  },
  picker: {
    height: 50,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  actionButton: {
    padding: 10,
  },
  modalInfoSection: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  modalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  modalInfoIcon: {
    marginRight: 8,
  },
  modalInfoText: {
    fontSize: 14,
    color: "#666",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 15,
  },
});
