import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: "25%", // Ajuste para um valor percentual válido
  },
  container_scroll: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  addButton: {
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#3B82F6",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    textAlign: "center",
    fontWeight: "bold",
    width: 100,
    fontSize: 14,
    color: "#1D4ED8",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  estado: {
    position: "absolute",
    right: 16,
    top: 16,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    fontWeight: "bold",
    fontSize: 12,
  },
  ocupado: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  livre: {
    backgroundColor: "#fef9c3",
    color: "#92400e",
  },
  detailButton: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 14,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  label: {
    fontWeight: "600",
    marginBottom: 4,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 6,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#1D4ED8",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#9ca3af",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // Estilo para o BackButton fora do container
  backButton: {
    position: "absolute",
    top: 40,
    left: 10,
    zIndex: 1, // Garante que o botão esteja sobre os outros componentes
  },
});

export default styles;
