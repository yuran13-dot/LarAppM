import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import BackButton from "../../components/BackButton";
import { useAuth } from "../../hooks/AuthContext";
import { collection, query, getDocs, where, updateDoc, doc, Timestamp } from "firebase/firestore";
import { LarApp_db } from "../../firebaseConfig";

export default function TarefasRealizadas() {
  const navigation = useNavigation();
  const { userData } = useAuth();
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    concluidas: 0,
    pendentes: 0
  });
  
  // Estado para controle do modal de registro de sinais vitais
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUtente, setSelectedUtente] = useState(null);
  const [systolicBP, setSystolicBP] = useState("");
  const [diastolicBP, setDiastolicBP] = useState("");
  const [temperature, setTemperature] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [utentesLista, setUtentesLista] = useState([]);

  // Buscar todas as tarefas de medicamentos e dados vitais dos utentes
  useEffect(() => {
    const buscarTarefas = async () => {
      if (!userData || !userData.name) {
        console.log("Dados do funcionário não disponíveis");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const tarefasEncontradas = [];
        const utentesEncontrados = [];
        
        // Buscar todos os utentes
        const utentesRef = collection(LarApp_db, "utentes");
        const utentesSnapshot = await getDocs(utentesRef);
        
        // Processar cada utente
        utentesSnapshot.forEach((utenteDoc) => {
          const utenteData = utenteDoc.data();
          const utenteName = utenteData.name || "Utente sem nome";
          const utenteId = utenteDoc.id;
          const quartoInfo = utenteData.quarto || "Sem quarto";
          
          // Adicionar à lista de utentes para uso posterior
          utentesEncontrados.push({
            id: utenteDoc.id,
            name: utenteName,
            quarto: quartoInfo
          });
          
          // Verificar se o utente tem medicamentos
          if (utenteData.medicamentos && Array.isArray(utenteData.medicamentos)) {
            // Filtrar medicamentos associados ao funcionário atual ou sem funcionário designado
            utenteData.medicamentos.forEach(med => {
              // Incluir medicamentos tomados por este funcionário
              if (med.administradoPor === userData.name) {
                tarefasEncontradas.push({
                  id: `${utenteId}-med-${med.id}`,
                  title: `Medicação: ${med.nome} - ${quartoInfo}`,
                  time: med.horario || "Hora não definida",
                  date: med.dataAdministracao ? new Date(med.dataAdministracao.seconds * 1000).toLocaleDateString() : "Data não definida",
                  status: "concluido",
                  paciente: utenteName,
                  medicamento: med,
                  utenteId: utenteId,
                  tipo: "medicamento"
                });
              } 
              // Incluir medicamentos pendentes (sem funcionário designado)
              else if (med.status === "pendente" && !med.administradoPor) {
                tarefasEncontradas.push({
                  id: `${utenteId}-med-${med.id}`,
                  title: `Medicação: ${med.nome} - ${quartoInfo}`,
                  time: med.horario || "Hora não definida",
                  date: new Date().toLocaleDateString(),
                  status: "pendente",
                  paciente: utenteName,
                  medicamento: med,
                  utenteId: utenteId,
                  tipo: "medicamento"
                });
              }
            });
          }
          
          // Verificar se o utente tem dados vitais registrados por este funcionário
          if (utenteData.dadosVitais && Array.isArray(utenteData.dadosVitais)) {
            utenteData.dadosVitais.forEach((dadoVital, index) => {
              if (dadoVital.registradoPor === userData.name) {
                const dataRegistro = dadoVital.data && dadoVital.data.seconds ? 
                  new Date(dadoVital.data.seconds * 1000).toLocaleDateString() : 
                  "Data não definida";
                
                tarefasEncontradas.push({
                  id: `${utenteId}-vital-${index}`,
                  title: `Dados Vitais - ${quartoInfo}`,
                  time: dadoVital.data && dadoVital.data.seconds ? 
                    new Date(dadoVital.data.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                    "Hora não definida",
                  date: dataRegistro,
                  status: "concluido",
                  paciente: utenteName,
                  dadosVitais: dadoVital,
                  utenteId: utenteId,
                  tipo: "vital"
                });
              }
            });
          }
        });
        
        // Atualizar estatísticas
        const concluidas = tarefasEncontradas.filter(t => t.status === "concluido").length;
        const pendentes = tarefasEncontradas.filter(t => t.status === "pendente").length;
        
        setStats({
          total: tarefasEncontradas.length,
          concluidas: concluidas,
          pendentes: pendentes
        });
        
        // Ordenar por data/hora, com os mais recentes primeiro
        tarefasEncontradas.sort((a, b) => {
          // Se as datas são iguais, ordenar por hora
          if (a.date === b.date) {
            return b.time.localeCompare(a.time);
          }
          // Ordenar por data
          return new Date(b.date) - new Date(a.date);
        });

        setTarefas(tarefasEncontradas);
        setUtentesLista(utentesEncontrados);
      } catch (error) {
        console.error("Erro ao buscar tarefas:", error);
        Alert.alert("Erro", "Não foi possível carregar as tarefas.");
      } finally {
        setLoading(false);
      }
    };

    buscarTarefas();
  }, [userData]);

  // Função para marcar uma medicação como administrada
  const marcarComoAdministrado = async (tarefa) => {
    if (!userData || !userData.name) {
      Alert.alert("Erro", "Informações do funcionário não disponíveis.");
      return;
    }

    try {
      setLoading(true);
      
      // Buscar o documento do utente
      const utenteQuery = query(
        collection(LarApp_db, "utentes"),
        where("id", "==", tarefa.utenteId)
      );
      const utenteSnapshot = await getDocs(utenteQuery);

      if (utenteSnapshot.empty) {
        Alert.alert("Erro", "Utente não encontrado");
        setLoading(false);
        return;
      }

      const utenteDoc = utenteSnapshot.docs[0];
      const utenteRef = doc(LarApp_db, "utentes", utenteDoc.id);
      const utenteDados = utenteDoc.data();

      // Atualizar o medicamento
      const medicamentosAtualizados = utenteDados.medicamentos.map(med => {
        if (med.id === tarefa.medicamento.id) {
          return {
            ...med,
            status: "tomado",
            dataAdministracao: new Date(),
            administradoPor: userData.name
          };
        }
        return med;
      });

      // Atualizar no Firestore
      await updateDoc(utenteRef, {
        medicamentos: medicamentosAtualizados
      });

      // Atualizar lista local de tarefas
      setTarefas(prevTarefas => {
        return prevTarefas.map(t => {
          if (t.id === tarefa.id) {
            return {
              ...t,
              status: "concluido",
              date: new Date().toLocaleDateString()
            };
          }
          return t;
        });
      });

      // Atualizar estatísticas
      setStats(prevStats => ({
        ...prevStats,
        concluidas: prevStats.concluidas + 1,
        pendentes: prevStats.pendentes - 1
      }));

      Alert.alert("Sucesso", "Medicamento administrado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar medicamento:", error);
      Alert.alert("Erro", "Não foi possível atualizar o status do medicamento.");
    } finally {
      setLoading(false);
    }
  };

  // Função para registrar novos sinais vitais
  const registrarSinaisVitais = async () => {
    if (!selectedUtente) {
      Alert.alert("Erro", "Selecione um utente.");
      return;
    }

    if (!systolicBP || !diastolicBP || !temperature || !heartRate) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);

      // Buscar o documento do utente
      const utenteQuery = query(
        collection(LarApp_db, "utentes"),
        where("id", "==", selectedUtente.id)
      );
      const utenteSnapshot = await getDocs(utenteQuery);

      if (utenteSnapshot.empty) {
        Alert.alert("Erro", "Utente não encontrado");
        setLoading(false);
        return;
      }

      const utenteDoc = utenteSnapshot.docs[0];
      const utenteRef = doc(LarApp_db, "utentes", utenteDoc.id);
      const utenteDados = utenteDoc.data();

      // Criar novo registro de sinais vitais
      const novoSinalVital = {
        data: Timestamp.now(),
        pressao: `${systolicBP}/${diastolicBP}`,
        temperatura: parseFloat(temperature),
        frequenciaCardiaca: parseInt(heartRate),
        registradoPor: userData?.name || "Funcionário"
      };

      // Adicionar aos dados vitais do utente
      const dadosVitaisAtualizados = [...(utenteDados.dadosVitais || []), novoSinalVital];

      // Atualizar no Firestore
      await updateDoc(utenteRef, {
        dadosVitais: dadosVitaisAtualizados
      });

      // Adicionar à lista de tarefas
      const novaTarefa = {
        id: `${selectedUtente.id}-vital-${Date.now()}`,
        title: `Dados Vitais - ${selectedUtente.quarto}`,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        date: new Date().toLocaleDateString(),
        status: "concluido",
        paciente: selectedUtente.name,
        dadosVitais: novoSinalVital,
        utenteId: selectedUtente.id,
        tipo: "vital"
      };

      setTarefas(prevTarefas => [novaTarefa, ...prevTarefas]);

      // Atualizar estatísticas
      setStats(prevStats => ({
        ...prevStats,
        total: prevStats.total + 1,
        concluidas: prevStats.concluidas + 1
      }));

      // Limpar campos e fechar modal
      setSystolicBP("");
      setDiastolicBP("");
      setTemperature("");
      setHeartRate("");
      setModalVisible(false);
      setSelectedUtente(null);

      Alert.alert("Sucesso", "Sinais vitais registrados com sucesso!");
    } catch (error) {
      console.error("Erro ao registrar sinais vitais:", error);
      Alert.alert("Erro", "Não foi possível registrar os sinais vitais.");
    } finally {
      setLoading(false);
    }
  };

  // Mostrar detalhes dos sinais vitais em um formato mais visual
  const mostrarDetalhesSinaisVitais = (dadosVitais, paciente) => {
    Alert.alert(
      `Sinais Vitais - ${paciente}`,
      "",
      [
        {
          text: "Fechar",
          style: "cancel"
        }
      ],
      { cancelable: true }
    );

    // Aqui estamos usando uma técnica específica para mostrar um layout mais complexo em um Alert
    // Em uma implementação mais avançada, poderíamos usar um modal personalizado
    setTimeout(() => {
      Alert.alert(
        "Pressão Arterial",
        `${dadosVitais.pressao} mmHg`,
        [
          {
            text: "Próximo",
            onPress: () => {
              Alert.alert(
                "Temperatura",
                `${dadosVitais.temperatura}°C`,
                [
                  {
                    text: "Próximo",
                    onPress: () => {
                      Alert.alert(
                        "Frequência Cardíaca",
                        `${dadosVitais.frequenciaCardiaca} bpm`,
                        [
                          {
                            text: "Concluir",
                            style: "cancel"
                          }
                        ]
                      );
                    }
                  }
                ]
              );
            }
          }
        ]
      );
    }, 300);
  };

  const renderTarefa = ({ item }) => {
    const statusColor = item.status === 'concluido' ? "#28a745" : "#ffc107";
    let statusIcon = item.status === 'concluido' ? "checkmark-circle-outline" : "time-outline";
    
    // Para dados vitais, usar outro ícone
    if (item.tipo === "vital") {
      statusIcon = "heart-outline";
    }
    
    return (
      <TouchableOpacity 
        style={styles.tarefaCard}
        onPress={() => {
          if (item.status !== 'concluido' && item.tipo === "medicamento") {
            Alert.alert(
              "Confirmar administração",
              `Confirmar administração de ${item.title} para ${item.paciente}?`,
              [
                { text: "Cancelar", style: "cancel" },
                { text: "Confirmar", onPress: () => marcarComoAdministrado(item) }
              ]
            );
          } else if (item.tipo === "vital") {
            // Mostrar detalhes dos dados vitais de forma mais visual
            mostrarDetalhesSinaisVitais(item.dadosVitais, item.paciente);
          }
        }}
      >
        <Icon 
          name={statusIcon} 
          size={24} 
          color={item.tipo === "vital" ? "#007bff" : statusColor} 
          style={styles.tarefaIcon}
        />
        <View style={styles.tarefaInfo}>
          <Text style={styles.tarefaTitle}>{item.title}</Text>
          <Text style={styles.tarefaTime}>{item.time} - {item.status === 'concluido' ? 'Concluído' : 'Pendente'}</Text>
          <Text style={styles.tarefaPaciente}>Paciente: {item.paciente}</Text>
          <Text style={styles.tarefaDate}>Data: {item.date}</Text>
          
          {item.tipo === "vital" && (
            <View style={styles.vitalSignsContainer}>
              <View style={styles.vitalSignBadge}>
                <Icon name="pulse" size={14} color="#fff" />
                <Text style={styles.vitalSignText}>{item.dadosVitais.pressao} mmHg</Text>
              </View>
              <View style={[styles.vitalSignBadge, { backgroundColor: "#ff9800" }]}>
                <Icon name="thermometer" size={14} color="#fff" />
                <Text style={styles.vitalSignText}>{item.dadosVitais.temperatura}°C</Text>
              </View>
              <View style={[styles.vitalSignBadge, { backgroundColor: "#e91e63" }]}>
                <Icon name="heart" size={14} color="#fff" />
                <Text style={styles.vitalSignText}>{item.dadosVitais.frequenciaCardiaca} bpm</Text>
              </View>
            </View>
          )}
        </View>
        
        {/* Indicador visual para o tipo da tarefa */}
        <View 
          style={[
            styles.tarefaTipo, 
            { backgroundColor: item.tipo === "vital" ? "#007bff" : "#28a745" }
          ]} 
        />
      </TouchableOpacity>
    );
  };

  // Renderizar a lista de utentes para seleção no modal
  const renderUtenteItem = (utente, index) => {
    const isSelected = selectedUtente && selectedUtente.id === utente.id;
    
    return (
      <TouchableOpacity
        key={index}
        style={[styles.utenteItem, isSelected && styles.utenteItemSelected]}
        onPress={() => setSelectedUtente(utente)}
      >
        <Icon name="person" size={20} color={isSelected ? "#fff" : "#007bff"} />
        <Text style={[styles.utenteItemText, isSelected && styles.utenteItemTextSelected]}>
          {utente.name} - {utente.quarto}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Tarefas Medicação</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate("MedsScreen")}
          >
            <Icon name="medkit" size={24} color="#fff" />
            <Text style={styles.actionText}>Adicionar Medicação</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: "#6c757d" }]}
            onPress={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
          >
            <Icon name="refresh" size={24} color="#fff" />
            <Text style={styles.actionText}>Atualizar Lista</Text>
          </TouchableOpacity>
        </View>

        {/* Botão para registrar sinais vitais */}
        <TouchableOpacity 
          style={styles.vitalSignsButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="pulse" size={24} color="#fff" />
          <Text style={styles.vitalSignsButtonText}>Registrar Sinais Vitais</Text>
        </TouchableOpacity>

        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.concluidas}</Text>
            <Text style={styles.statLabel}>Concluídas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.pendentes}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Carregando tarefas...</Text>
          </View>
        ) : tarefas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="document-text-outline" size={64} color="#6c757d" />
            <Text style={styles.emptyText}>Nenhuma tarefa encontrada</Text>
            <Text style={styles.emptySubtext}>As medicações e registros de sinais vitais realizados por você serão exibidos aqui</Text>
          </View>
        ) : (
          <FlatList
            data={tarefas}
            renderItem={renderTarefa}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.tarefasList}
          />
        )}
      </View>

      {/* Modal para registrar sinais vitais */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Registrar Sinais Vitais</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Selecione o Utente:</Text>
              <View style={styles.utentesListContainer}>
                <FlatList
                  data={utentesLista}
                  renderItem={({item, index}) => renderUtenteItem(item, index)}
                  keyExtractor={item => item.id}
                  style={styles.utentesList}
                />
              </View>

              <Text style={styles.modalLabel}>Pressão Arterial Sistólica (mmHg):</Text>
              <TextInput
                style={styles.modalInput}
                value={systolicBP}
                onChangeText={setSystolicBP}
                placeholder="Ex: 120"
                keyboardType="numeric"
              />

              <Text style={styles.modalLabel}>Pressão Arterial Diastólica (mmHg):</Text>
              <TextInput
                style={styles.modalInput}
                value={diastolicBP}
                onChangeText={setDiastolicBP}
                placeholder="Ex: 80"
                keyboardType="numeric"
              />

              <Text style={styles.modalLabel}>Temperatura (°C):</Text>
              <TextInput
                style={styles.modalInput}
                value={temperature}
                onChangeText={setTemperature}
                placeholder="Ex: 36.5"
                keyboardType="numeric"
              />

              <Text style={styles.modalLabel}>Frequência Cardíaca (bpm):</Text>
              <TextInput
                style={styles.modalInput}
                value={heartRate}
                onChangeText={setHeartRate}
                placeholder="Ex: 75"
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={styles.modalButton}
                onPress={registrarSinaisVitais}
              >
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#007bff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 15,
    backgroundColor: "#007bff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 15,
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: "#007bff",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    width: "48%",
    justifyContent: "center",
  },
  actionText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
  vitalSignsButton: {
    backgroundColor: "#4caf50",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    justifyContent: "center",
  },
  vitalSignsButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
  },
  statLabel: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 5,
  },
  tarefasList: {
    paddingBottom: 20,
  },
  tarefaCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
  },
  tarefaIcon: {
    marginRight: 5,
  },
  tarefaInfo: {
    marginLeft: 10,
    flex: 1,
  },
  tarefaTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  tarefaTime: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  tarefaPaciente: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
    fontStyle: "italic",
  },
  tarefaDate: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  vitalSignsContainer: {
    flexDirection: "row",
    marginTop: 8,
    flexWrap: "wrap",
  },
  vitalSignBadge: {
    backgroundColor: "#1976d2",
    borderRadius: 15,
    paddingVertical: 3,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 5,
    marginBottom: 5,
  },
  vitalSignText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "bold",
  },
  tarefaTipo: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  modalLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    fontWeight: "500",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  utentesListContainer: {
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
  },
  utentesList: {
    padding: 5,
  },
  utenteItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  utenteItemSelected: {
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  utenteItemText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
  },
  utenteItemTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  }
});