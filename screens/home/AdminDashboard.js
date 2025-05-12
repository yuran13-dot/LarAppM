import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAdmin } from "../../hooks/useAdmin";
import {
  showConfirmation,
  showError,
  showSuccess,
} from "../../utils/errorHandler";
import Icon from "react-native-vector-icons/Ionicons";

export default function AdminDashboard({ navigation }) {
  const {
    loading,
    error,
    getAllUtentes,
    getAllQuartos,
    deleteUtente,
    deleteQuarto,
    alocarUtenteQuarto,
    gerarRelatorioUtentes,
  } = useAdmin();

  const [utentes, setUtentes] = useState([]);
  const [quartos, setQuartos] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [utentesData, quartosData, relatorioData] = await Promise.all([
        getAllUtentes(),
        getAllQuartos(),
        gerarRelatorioUtentes(),
      ]);

      setUtentes(utentesData);
      setQuartos(quartosData);
      setEstatisticas(relatorioData);
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteUtente = (utenteId) => {
    showConfirmation(
      "Tem certeza que deseja desativar este utente?",
      async () => {
        const success = await deleteUtente(utenteId);
        if (success) {
          showSuccess("Utente desativado com sucesso");
          carregarDados();
        }
      }
    );
  };

  const handleDeleteQuarto = (quartoId) => {
    showConfirmation(
      "Tem certeza que deseja remover este quarto?",
      async () => {
        const success = await deleteQuarto(quartoId);
        if (success) {
          showSuccess("Quarto removido com sucesso");
          carregarDados();
        }
      }
    );
  };

  const handleAlocarQuarto = (utenteId, quartoId, quartoAntigo) => {
    showConfirmation("Confirmar alocação do utente neste quarto?", async () => {
      const success = await alocarUtenteQuarto(
        utenteId,
        quartoId,
        quartoAntigo
      );
      if (success) {
        showSuccess("Utente alocado com sucesso");
        carregarDados();
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Estatísticas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estatísticas</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="people" size={24} color="#007bff" />
            <Text style={styles.statNumber}>
              {estatisticas?.totalUtentes || 0}
            </Text>
            <Text style={styles.statLabel}>Total Utentes</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="bed" size={24} color="#28a745" />
            <Text style={styles.statNumber}>
              {quartos.filter((q) => q.status === "disponível").length}
            </Text>
            <Text style={styles.statLabel}>Quartos Disponíveis</Text>
          </View>
        </View>
      </View>

      {/* Ações Rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("AddUtente")}
          >
            <Icon name="person-add" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Novo Utente</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("AddQuarto")}
          >
            <Icon name="add-circle" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Novo Quarto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Relatorios")}
          >
            <Icon name="document-text" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Relatórios</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Utentes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Utentes Recentes</Text>
        {utentes.slice(0, 5).map((utente) => (
          <TouchableOpacity
            key={utente.id}
            style={styles.listItem}
            onPress={() => navigation.navigate("EditUtente", { utente })}
          >
            <View style={styles.listItemContent}>
              <Text style={styles.listItemTitle}>{utente.name}</Text>
              <Text style={styles.listItemSubtitle}>
                Quarto: {utente.quartoId || "Não alocado"}
              </Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate("ListaUtentes")}
        >
          <Text style={styles.viewAllText}>Ver Todos</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Quartos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status dos Quartos</Text>
        {quartos.slice(0, 5).map((quarto) => (
          <TouchableOpacity
            key={quarto.id}
            style={styles.listItem}
            onPress={() => navigation.navigate("EditQuarto", { quarto })}
          >
            <View style={styles.listItemContent}>
              <Text style={styles.listItemTitle}>Quarto {quarto.numero}</Text>
              <Text
                style={[
                  styles.listItemStatus,
                  {
                    color:
                      quarto.status === "disponível" ? "#28a745" : "#dc3545",
                  },
                ]}
              >
                {quarto.status}
              </Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate("ListaQuartos")}
        >
          <Text style={styles.viewAllText}>Ver Todos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    width: "45%",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: "#fff",
    marginTop: 5,
    fontSize: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    color: "#333",
  },
  listItemSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  listItemStatus: {
    fontSize: 14,
    fontWeight: "bold",
  },
  viewAllButton: {
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 10,
  },
  viewAllText: {
    color: "#007bff",
    fontSize: 16,
  },
});
