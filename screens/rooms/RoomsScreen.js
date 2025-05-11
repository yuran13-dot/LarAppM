// screens/rooms/RoomsScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import styles from "./styles";
import BackButton from "../../components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

export default function RoomsScreen() {
  //variaveis do search bar
  const [pesquisa, setPesquisa] = useState("");
  const [modoEdicao, setModoEdicao] = useState(false);

  // variaveis do modal
  const [modalVisible, setModalVisible] = useState(false);
  const [detalhesModalVisible, setDetalhesModalVisible] = useState(false);
  const [quartoSelecionado, setQuartoSelecionado] = useState(null);

  // var do formulário
  const [form, setForm] = useState({
    numero: "",
    andar: "",
    capacidade: "Individual",
    utente1: "",
    utente2: "",
    entrada: "",
    manutencao: "",
    nota: "",
  });

  const handleSalvar = () => {
    const associado1 = form.utente1 !== "";
    const associado2 = form.capacidade === "Duplo" && form.utente2 !== "";
    const estado = associado1 || associado2 ? "Ocupado" : "Livre";

    const novoQuarto = {
      id: modoEdicao && quartoSelecionado ? quartoSelecionado.id : Date.now(),
      numero: form.numero,
      tipo: form.capacidade,
      estado: estado,
      andar: form.andar,
      entrada: form.entrada,
      nota: form.nota,
      utente:
        form.capacidade === "Duplo"
          ? [form.utente1, form.utente2].filter(Boolean)
          : form.utente1 || "",
    };

    if (modoEdicao) {
      setQuartos(quartos.map((q) => (q.id === novoQuarto.id ? novoQuarto : q)));
    } else {
      setQuartos([...quartos, novoQuarto]);
    }

    setModalVisible(true);
    setModoEdicao(true);
    setForm({
      numero: "",
      andar: "",
      capacidade: "Individual",
      utente1: "",
      utente2: "",
      entrada: "",
      manutencao: "",
      nota: "",
    });
  };
  const handleRemover = (id) => {
    setQuartos(quartos.filter((q) => q.id !== id));
  };

  // variaveis do status do Quarto
  const [quartos, setQuartos] = useState([]);
  const filtrados = quartos.filter((q) =>
    q.numero.toLowerCase().includes(pesquisa.toLowerCase())
  );
  const total = quartos.length;
  const ocupados = quartos.filter((q) => q.estado === "Ocupado").length;
  const livres = quartos.filter((q) => q.estado === "Livre").length;
  const numerosQuarto = Array.from({ length: 10 }, (_, i) =>
    (i + 1).toString()
  );
  const pacientes = ["João Paulo", "Maria Lopes", "Carlos Dias"];

  return (
    <>
      <BackButton />
      <View style={styles.container}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.container_scroll}
        >
          <Text style={styles.title}>Gestão de Quartos </Text>
          <Text style={styles.subtitle}>Lista e detalhe de Quarto</Text>

          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={16}
                color="#1D4ED8"
                style={{ marginRight: 6 }}
              />
              <TextInput
                placeholder="pesquisar quartos..."
                value={pesquisa}
                onChangeText={setPesquisa}
                style={{ flex: 1 }}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(true);
                setModoEdicao(false);
              }}
              style={styles.addButton}
            >
              <Ionicons name="bed-outline" size={20} color="#1D4ED8" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statBox}>
              Total{"\n"}
              {total}
            </Text>
            <Text style={styles.statBox}>
              Ocupados{"\n"}
              {ocupados}
            </Text>
            <Text style={styles.statBox}>
              Livres{"\n"}
              {livres}
            </Text>
          </View>

          {filtrados.map((q) => (
            <View key={q.id} style={styles.card}>
              <Text style={styles.cardTitle}>Quarto {q.numero}</Text>
              <Text>{q.tipo}</Text>
              <Text
                style={[
                  styles.estado,
                  q.estado === "Ocupado" ? styles.ocupado : styles.livre,
                ]}
              >
                {q.estado}
              </Text>
              {Array.isArray(q.utente) ? (
                q.utente.map((u, i) => <Text key={i}>👤 {u}</Text>)
              ) : (
                <Text>👤 {q.utente}</Text>
              )}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() => {
                    setQuartoSelecionado(q);
                    setDetalhesModalVisible(true);
                  }}
                >
                  <Ionicons name="reader-outline" size={20} color="#1D4ED8" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() => handleEditar(q)}
                >
                  <Ionicons name="pencil" size={20} color="#1D4ED8" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() => handleRemover(q.id)}
                >
                  <Ionicons name="trash" size={20} color="#1D4ED8" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {/* Modal de Adição/Edição do Quarto */}
          <Modal visible={modalVisible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {modoEdicao ? "Editar Quarto" : "Adicionar Quarto"}
                </Text>
                <Text style={styles.label}>Número do Quarto</Text>
                <View style={styles.pickerBox}>
                  <Picker
                    selectedValue={form.numero}
                    onValueChange={(val) => setForm({ ...form, numero: val })}
                  >
                    <Picker.Item label="Seleciona o número" value="" />
                    {numerosQuarto.map((n) => (
                      <Picker.Item key={n} label={`Quarto ${n}`} value={n} />
                    ))}
                  </Picker>
                </View>
                <Text style={styles.label}>Piso (Andar)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Andar"
                  value={form.andar}
                  onChangeText={(t) => setForm({ ...form, andar: t })}
                />
                <Text style={styles.label}>Capacidade</Text>
                <View style={styles.pickerBox}>
                  <Picker
                    selectedValue={form.capacidade}
                    onValueChange={(val) =>
                      setForm({ ...form, capacidade: val })
                    }
                  >
                    <Picker.Item label="Individual" value="Individual" />
                    <Picker.Item label="Duplo" value="Duplo" />
                  </Picker>
                </View>
                <Text style={styles.label}>Paciente 1</Text>
                <View style={styles.pickerBox}>
                  <Picker
                    selectedValue={form.utente1}
                    onValueChange={(val) => setForm({ ...form, utente1: val })}
                  >
                    <Picker.Item label="Seleciona paciente" value="" />
                    {pacientes.map((p) => (
                      <Picker.Item key={p} label={p} value={p} />
                    ))}
                  </Picker>
                </View>
                {form.capacidade === "Duplo" && (
                  <>
                    <Text style={styles.label}>Paciente 2</Text>
                    <View style={styles.pickerBox}>
                      <Picker
                        selectedValue={form.utente2}
                        onValueChange={(val) =>
                          setForm({ ...form, utente2: val })
                        }
                      >
                        <Picker.Item
                          label="Seleciona segundo paciente"
                          value=""
                        />
                        {pacientes.map((p) => (
                          <Picker.Item key={p} label={p} value={p} />
                        ))}
                      </Picker>
                    </View>
                  </>
                )}
                <Text style={styles.label}>Data de Entrada</Text>
                <TextInput
                  style={styles.input}
                  placeholder="dd/mm/aaaa"
                  value={form.entrada}
                  onChangeText={(t) => setForm({ ...form, entrada: t })}
                />
                <Text style={styles.label}>Notas/Observações</Text>
                <TextInput
                  style={[styles.input, { height: 60 }]}
                  multiline
                  placeholder="Observações..."
                  value={form.nota}
                  onChangeText={(t) => setForm({ ...form, nota: t })}
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSalvar}
                  >
                    <Text style={styles.buttonText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Modal de Detalhes */}
          <Modal
            visible={detalhesModalVisible}
            animationType="slide"
            transparent
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Detalhes do Quarto</Text>
                {quartoSelecionado && (
                  <>
                    <Text style={{ marginBottom: 6 }}>
                      Paciente(s):{" "}
                      {Array.isArray(quartoSelecionado.utente)
                        ? quartoSelecionado.utente.join(", ")
                        : quartoSelecionado.utente}
                    </Text>
                    <Text style={{ marginBottom: 6 }}>
                      Nota: {quartoSelecionado.nota}
                    </Text>
                    <Text style={{ marginBottom: 6 }}>
                      Data de entrada: {quartoSelecionado.entrada}
                    </Text>
                    <Text style={{ marginBottom: 6 }}>
                      Piso: {quartoSelecionado.andar}
                    </Text>
                  </>
                )}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setDetalhesModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </View>
    </>
  );
}
