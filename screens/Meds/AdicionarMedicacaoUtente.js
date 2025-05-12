import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { LarApp_db } from "../../firebaseConfig";
import { Picker } from "@react-native-picker/picker";

export default function AdicionarMedicacaoUtente({ route, navigation }) {
  const { utenteId, numeroUtente, nome, medicamentosAtuais, onUpdate } =
    route.params;
  const [medicamentos, setMedicamentos] = useState([]);
  const [medicamentoSelecionado, setMedicamentoSelecionado] = useState("");
  const [horario, setHorario] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarMedicamentos();
  }, []);

  const carregarMedicamentos = async () => {
    try {
      setLoading(true);
      const medicamentosSnapshot = await getDocs(
        collection(LarApp_db, "medicamentos")
      );
      const medicamentosData = [];
      medicamentosSnapshot.forEach((doc) => {
        medicamentosData.push({ id: doc.id, ...doc.data() });
      });
      setMedicamentos(medicamentosData);
    } catch (error) {
      console.error("Erro ao carregar medicamentos:", error);
      Alert.alert("Erro", "Não foi possível carregar os medicamentos.");
    } finally {
      setLoading(false);
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

  const adicionarMedicamento = async () => {
    if (!medicamentoSelecionado || !horario) {
      Alert.alert(
        "Atenção",
        "Por favor, selecione um medicamento e defina o horário."
      );
      return;
    }

    try {
      const medicamento = medicamentos.find(
        (m) => m.id === medicamentoSelecionado
      );
      const novoMedicamento = {
        id: medicamentoSelecionado,
        nome: medicamento.nome,
        dosagem: medicamento.dosagem,
        horario: horario,
        status: "pendente",
        dataInicio: new Date(),
      };

      const utenteRef = doc(LarApp_db, "utentes", utenteId);
      const novosMedicamentos = [...medicamentosAtuais, novoMedicamento];

      await updateDoc(utenteRef, {
        medicamentos: novosMedicamentos,
      });

      Alert.alert("Sucesso", "Medicamento adicionado com sucesso!");
      onUpdate && onUpdate();
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao adicionar medicamento:", error);
      Alert.alert("Erro", "Não foi possível adicionar o medicamento.");
    }
  };

  const removerMedicamento = async (medicamentoId) => {
    try {
      const utenteRef = doc(LarApp_db, "utentes", utenteId);
      const novosMedicamentos = medicamentosAtuais.filter(
        (med) => med.id !== medicamentoId
      );

      await updateDoc(utenteRef, {
        medicamentos: novosMedicamentos,
      });

      Alert.alert("Sucesso", "Medicamento removido com sucesso!");
      onUpdate && onUpdate();
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao remover medicamento:", error);
      Alert.alert("Erro", "Não foi possível remover o medicamento.");
    }
  };

  const renderMedicamentoAtual = ({ item }) => (
    <View style={styles.medicamentoCard}>
      <View style={styles.medicamentoInfo}>
        <View style={styles.medicamentoHeader}>
          <Text style={styles.medicamentoNome}>{item.nome}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Icon name={getStatusIcon(item.status)} size={16} color="#fff" />
            <Text style={styles.statusText}>{item.status || "Pendente"}</Text>
          </View>
        </View>
        <Text style={styles.medicamentoDetalhes}>
          Horário: {item.horario} | Dosagem: {item.dosagem}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removerMedicamento(item.id)}
      >
        <Icon name="trash-outline" size={24} color="#dc3545" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Adicionar Medicação</Text>
      </View>

      <View style={styles.utenteInfo}>
        <Text style={styles.utenteNome}>{nome}</Text>
        <Text style={styles.utenteNumero}>Nº Utente: {numeroUtente}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Novo Medicamento</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={medicamentoSelecionado}
            onValueChange={(itemValue) => setMedicamentoSelecionado(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Selecione um medicamento" value="" />
            {medicamentos.map((med) => (
              <Picker.Item
                key={med.id}
                label={`${med.nome} - ${med.dosagem}`}
                value={med.id}
              />
            ))}
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Horário (ex: 8h, 12h, 20h)"
          value={horario}
          onChangeText={setHorario}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={adicionarMedicamento}
        >
          <Text style={styles.addButtonText}>Adicionar Medicamento</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.medicamentosAtuais}>
        <Text style={styles.sectionTitle}>Medicamentos Atuais</Text>
        <FlatList
          data={medicamentosAtuais}
          renderItem={renderMedicamentoAtual}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum medicamento cadastrado</Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  utenteInfo: {
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  utenteNome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  utenteNumero: {
    fontSize: 14,
    color: "#666",
  },
  form: {
    padding: 20,
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
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
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  medicamentosAtuais: {
    flex: 1,
    padding: 20,
  },
  medicamentoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
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
  medicamentoInfo: {
    flex: 1,
  },
  medicamentoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  medicamentoNome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  medicamentoDetalhes: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
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
  removeButton: {
    padding: 10,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
});
