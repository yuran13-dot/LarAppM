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
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { doc, getDoc, updateDoc, Timestamp, collection, query, where, getDocs } from "firebase/firestore";
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
  const [vitalSignsModalVisible, setVitalSignsModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [systolicBP, setSystolicBP] = useState("");
  const [diastolicBP, setDiastolicBP] = useState("");
  const [temperature, setTemperature] = useState("");
  const [heartRate, setHeartRate] = useState("");

  const fetchUtenteData = async () => {
    try {
      const utentesRef = collection(LarApp_db, 'utentes');
      const q = query(utentesRef, where('id', '==', utenteId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const utenteDoc = querySnapshot.docs[0];
        setUtente({ id: utenteDoc.id, ...utenteDoc.data() });
      } else {
        Alert.alert('Erro', 'Utente não encontrado');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erro ao carregar dados do utente:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do utente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUtenteData();
  }, [utenteId]);

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

      // Primeiro, buscar o documento do utente
      const utenteQuery = query(
        collection(LarApp_db, "utentes"),
        where("id", "==", utenteId)
      );
      const utenteSnapshot = await getDocs(utenteQuery);

      if (utenteSnapshot.empty) {
        Alert.alert("Erro", "Utente não encontrado");
        return;
      }

      const utenteDoc = utenteSnapshot.docs[0];
      const utenteRef = doc(LarApp_db, "utentes", utenteDoc.id);

      // Atualizar o documento
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
    fetchUtenteData().then(() => {
      setRefreshing(false);
    });
  }, []);

  const atualizarVitalSigns = async () => {
    try {
      if (!systolicBP || !diastolicBP || !temperature || !heartRate) {
        Alert.alert("Erro", "Por favor, preencha todos os campos");
        return;
      }

      const newVitalSigns = {
        data: Timestamp.now(),
        pressao: `${systolicBP}/${diastolicBP}`,
        temperatura: parseFloat(temperature),
        frequenciaCardiaca: parseInt(heartRate),
        registradoPor: userData?.name || "Funcionário"
      };

      const utenteQuery = query(
        collection(LarApp_db, "utentes"),
        where("id", "==", utenteId)
      );
      const utenteSnapshot = await getDocs(utenteQuery);

      if (utenteSnapshot.empty) {
        Alert.alert("Erro", "Utente não encontrado");
        return;
      }

      const utenteDoc = utenteSnapshot.docs[0];
      const utenteRef = doc(LarApp_db, "utentes", utenteDoc.id);

      const updatedDadosVitais = [...(utente.dadosVitais || []), newVitalSigns];

      await updateDoc(utenteRef, {
        dadosVitais: updatedDadosVitais
      });

      setUtente(prev => ({
        ...prev,
        dadosVitais: updatedDadosVitais
      }));

      setVitalSignsModalVisible(false);
      setSystolicBP("");
      setDiastolicBP("");
      setTemperature("");
      setHeartRate("");
      Alert.alert("Sucesso", "Sinais vitais registrados com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar sinais vitais:", error);
      Alert.alert("Erro", "Não foi possível registrar os sinais vitais");
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!utente) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.loadingText}>Utente não encontrado</Text>
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

  // Ordenar dados vitais por data, do mais recente para o mais antigo
  const dadosVitaisOrdenados = [...(utente.dadosVitais || [])].sort((a, b) => {
    return new Date(b.data) - new Date(a.data);
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{utente?.nome || utente?.name || "Perfil do Utente"}</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <View style={styles.avatarContainer}>
            <Icon name="person-circle" size={80} color="#007bff" />
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
            <Text style={styles.sectionTitle}>Sinais Vitais</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setVitalSignsModalVisible(true)}
            >
              <Icon name="add-circle-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {utente.dadosVitais && utente.dadosVitais.length > 0 ? (
            <View style={styles.vitalSignsContainer}>
              <View style={styles.mainVitalSignsCard}>
                <View style={styles.vitalSignsHeader}>
                  <Icon name="pulse-outline" size={24} color="#007bff" />
                  <Text style={styles.vitalSignsTitle}>Sinais Vitais</Text>
                  <TouchableOpacity 
                    style={styles.historyButton}
                    onPress={() => setHistoryModalVisible(true)}
                  >
                    <Icon name="time-outline" size={24} color="#007bff" />
                  </TouchableOpacity>
                </View>
                <View style={styles.vitalSignsGrid}>
                  <View style={[styles.vitalSignCard, { backgroundColor: '#e3f2fd' }]}>
                    <Icon name="pulse" size={24} color="#1976d2" style={styles.vitalSignIcon} />
                    <Text style={styles.vitalSignLabel}>Pressão Arterial</Text>
                    <Text style={styles.vitalSignValue}>
                      {utente.dadosVitais[utente.dadosVitais.length - 1].pressao}
                    </Text>
                    <Text style={styles.vitalSignUnit}>mmHg</Text>
                  </View>

                  <View style={[styles.vitalSignCard, { backgroundColor: '#fff9c4' }]}>
                    <Icon name="thermometer" size={24} color="#f57f17" style={styles.vitalSignIcon} />
                    <Text style={styles.vitalSignLabel}>Temperatura</Text>
                    <Text style={styles.vitalSignValue}>
                      {utente.dadosVitais[utente.dadosVitais.length - 1].temperatura}
                    </Text>
                    <Text style={styles.vitalSignUnit}>°C</Text>
                  </View>

                  <View style={[styles.vitalSignCard, { backgroundColor: '#e8f5e9' }]}>
                    <Icon name="heart" size={24} color="#2e7d32" style={styles.vitalSignIcon} />
                    <Text style={styles.vitalSignLabel}>Freq. Cardíaca</Text>
                    <Text style={styles.vitalSignValue}>
                      {utente.dadosVitais[utente.dadosVitais.length - 1].frequenciaCardiaca}
                    </Text>
                    <Text style={styles.vitalSignUnit}>bpm</Text>
                  </View>
                </View>
                <Text style={styles.vitalSignsTimestamp}>
                  Última atualização: {new Date(utente.dadosVitais[utente.dadosVitais.length - 1].data.toDate()).toLocaleString()}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noDataText}>Nenhum registro de sinais vitais</Text>
          )}
        </View>

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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Atividades do Utente</Text>
            <Text style={styles.countBadge}>{utente.atividades?.length || 0}</Text>
          </View>
          {utente.atividades && utente.atividades.length > 0 ? (
            utente.atividades.map((atividade, index) => (
              <TouchableOpacity
                key={`atividade-${index}`}
                style={[styles.itemCard, { marginBottom: 10 }]}
              >
                <View style={styles.itemInfo}>
                  <View style={styles.medicamentoHeader}>
                    <Text style={styles.itemTitle}>{atividade.nome || atividade.titulo || "Atividade sem nome"}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: atividade.status === "concluída" ? "#28a745" : "#ffc107" },
                      ]}
                    >
                      <Icon
                        name={atividade.status === "concluída" ? "checkmark-circle" : "time"}
                        size={16}
                        color="#fff"
                      />
                      <Text style={styles.statusText}>
                        {atividade.status === "concluída" ? "Concluída" : "Pendente"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.medicamentoDetails}>
                    <View style={styles.detailRow}>
                      <Icon name="time" size={16} color="#666" style={styles.detailIcon} />
                      <Text style={styles.itemDetails}>Horário: {atividade.horario}</Text>
                    </View>
                    {atividade.descricao && (
                      <View style={styles.detailRow}>
                        <Icon name="document-text" size={16} color="#666" style={styles.detailIcon} />
                        <Text style={styles.itemDetails}>Descrição: {atividade.descricao}</Text>
                      </View>
                    )}
                    {atividade.local && (
                      <View style={styles.detailRow}>
                        <Icon name="location" size={16} color="#666" style={styles.detailIcon} />
                        <Text style={styles.itemDetails}>Local: {atividade.local}</Text>
                      </View>
                    )}
                  </View>
                  {atividade.status === "concluída" && atividade.dataConclusao && (
                    <View style={styles.adminInfoContainer}>
                      <Icon name="calendar" size={16} color="#666" style={styles.detailIcon} />
                      <Text style={styles.adminInfo}>
                        Concluída em: {new Date(atividade.dataConclusao).toLocaleString()}
                      </Text>
                    </View>
                  )}
                  {atividade.observacoes && (
                    <View style={styles.observacoesContainer}>
                      <Icon name="document-text" size={16} color="#666" style={styles.detailIcon} />
                      <Text style={styles.observacoes}>{atividade.observacoes}</Text>
                    </View>
                  )}
                </View>
                {atividade.status !== "concluída" && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => marcarAtividadeConcluida(index)}
                  >
                    <Icon name="checkmark-circle" size={24} color="#28a745" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="list" size={40} color="#6c757d" />
              <Text style={styles.emptyText}>Nenhuma atividade registrada</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
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
                    style={[styles.picker, { color: '#333' }]}
                    itemStyle={Platform.OS === 'ios' ? { 
                      height: 50,
                      color: '#333',
                      fontSize: 16
                    } : undefined}
                    mode={Platform.OS === 'ios' ? 'dropdown' : 'dialog'}
                  >
                    <Picker.Item label="Pendente" value="pendente" color="#333" />
                    <Picker.Item label="Tomado" value="tomado" color="#333" />
                    <Picker.Item label="Atrasado" value="atrasado" color="#333" />
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={vitalSignsModalVisible}
        onRequestClose={() => setVitalSignsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Registrar Sinais Vitais</Text>
              
              <Text style={styles.inputLabel}>Pressão Arterial Sistólica (mmHg)</Text>
              <TextInput
                style={styles.input}
                value={systolicBP}
                onChangeText={setSystolicBP}
                keyboardType="numeric"
                placeholder="Ex: 120"
              />

              <Text style={styles.inputLabel}>Pressão Arterial Diastólica (mmHg)</Text>
              <TextInput
                style={styles.input}
                value={diastolicBP}
                onChangeText={setDiastolicBP}
                keyboardType="numeric"
                placeholder="Ex: 80"
              />

              <Text style={styles.inputLabel}>Temperatura (°C)</Text>
              <TextInput
                style={styles.input}
                value={temperature}
                onChangeText={setTemperature}
                keyboardType="numeric"
                placeholder="Ex: 36.5"
              />

              <Text style={styles.inputLabel}>Frequência Cardíaca (bpm)</Text>
              <TextInput
                style={styles.input}
                value={heartRate}
                onChangeText={setHeartRate}
                keyboardType="numeric"
                placeholder="Ex: 75"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setVitalSignsModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={atualizarVitalSigns}
                >
                  <Text style={styles.buttonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={historyModalVisible}
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Histórico de Sinais Vitais</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setHistoryModalVisible(false)}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.historyList}>
              {utente.dadosVitais && utente.dadosVitais.length > 0 ? (
                utente.dadosVitais.slice().reverse().map((record, index) => (
                  <View key={index} style={styles.historyItem}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyDate}>
                        {new Date(record.data.toDate()).toLocaleString()}
                      </Text>
                      <Text style={styles.historyRecordedBy}>
                        Registrado por: {record.registradoPor}
                      </Text>
                    </View>
                    <View style={styles.historyGrid}>
                      <View style={[styles.historyValueCard, { backgroundColor: '#e3f2fd' }]}>
                        <Text style={styles.historyLabel}>Pressão Arterial</Text>
                        <Text style={styles.historyValue}>
                          {record.pressao}
                        </Text>
                        <Text style={styles.historyUnit}>mmHg</Text>
                      </View>

                      <View style={[styles.historyValueCard, { backgroundColor: '#fff9c4' }]}>
                        <Text style={styles.historyLabel}>Temperatura</Text>
                        <Text style={styles.historyValue}>
                          {record.temperatura}
                        </Text>
                        <Text style={styles.historyUnit}>°C</Text>
                      </View>

                      <View style={[styles.historyValueCard, { backgroundColor: '#e8f5e9' }]}>
                        <Text style={styles.historyLabel}>Freq. Cardíaca</Text>
                        <Text style={styles.historyValue}>
                          {record.frequenciaCardiaca}
                        </Text>
                        <Text style={styles.historyUnit}>bpm</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>Nenhum registro de sinais vitais</Text>
              )}
            </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
    width: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  headerRight: {
    width: 40,
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
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 10,
      },
      android: {
        height: 50,
      },
    }),
  },
  picker: {
    ...Platform.select({
      ios: {
        height: 50,
        width: '100%',
        color: '#333',
      },
      android: {
        height: 50,
      },
    }),
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
  addButton: {
    padding: 5,
  },
  vitalSignsContainer: {
    padding: 10,
  },
  mainVitalSignsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  vitalSignsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
    justifyContent: 'center',
  },
  vitalSignsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    marginLeft: 8,
  },
  vitalSignsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  vitalSignCard: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  vitalSignIcon: {
    marginBottom: 8,
  },
  vitalSignLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  vitalSignValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  vitalSignUnit: {
    fontSize: 12,
    color: '#666',
  },
  vitalSignsTimestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#007bff",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  historyButton: {
    marginLeft: 'auto',
    padding: 5,
  },
  historyList: {
    maxHeight: '80%',
  },
  historyItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyHeader: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  historyRecordedBy: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  historyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  historyValueCard: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  historyLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  historyValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  historyUnit: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
  },
});
