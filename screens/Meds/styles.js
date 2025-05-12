import { StyleSheet } from "react-native";

export default StyleSheet.create({
  // Estilos do Container Principal e Header
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: "25%",
    backgroundColor: "#f5f9ff",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },

  // Estilos da Barra de Pesquisa
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    height: 45,
    backgroundColor: "#fff",
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 15,
  },
  addButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 10,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  // Estilos dos Items da Lista
  medItem: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  medInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  medNome: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  medDosagem: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  icon: {
    marginRight: 12,
  },
  iconAction: {
    marginLeft: 12,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#999",
  },

  // Estilos dos Modais (Add e Edit)
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingLeft: 15,
    justifyContent: "center",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  pickerContainer: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
  },
  picker: {
    height: 50,
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  // Estilos do Modal de Deleção
  deleteModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  deleteModalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: "center",
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  deleteMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    width: 120,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 5,
    width: 120,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // Estilos Adicionais para Formulários
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    marginTop: 5,
  },
  helpText: {
    color: "#666",
    fontSize: 12,
    marginTop: 5,
  },

  // Estilos para Feedback Visual
  successText: {
    color: "#28a745",
    fontSize: 14,
    marginTop: 5,
  },
  warningText: {
    color: "#ffc107",
    fontSize: 14,
    marginTop: 5,
  },

  // Estilos para Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#007bff",
  },

  // Estilos para Animações
  fadeIn: {
    opacity: 1,
  },
  fadeOut: {
    opacity: 0,
  },
  slideUp: {
    transform: [{ translateY: 0 }],
  },
  slideDown: {
    transform: [{ translateY: 100 }],
  },

  // Estilos Responsivos
  containerLandscape: {
    paddingTop: "15%",
  },
  modalContainerLandscape: {
    maxHeight: "80%",
  },

  // Estilos para Tablets
  containerTablet: {
    paddingHorizontal: 40,
  },
  medItemTablet: {
    padding: 16,
    marginBottom: 15,
  },
  titleTablet: {
    fontSize: 26,
  },
  subtitleTablet: {
    fontSize: 16,
  },
});
