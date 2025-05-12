import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: "20%",
    backgroundColor: "#eef3f9",
  },

  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a73e8",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#5f6368",
  },

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
    borderColor: "#d0d7e2",
    borderRadius: 12,
    height: 48,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#333",
  },

  addButton: {
    padding: 14,
    borderRadius: 12,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a73e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  list: {
    paddingBottom: 20,
  },

  utenteItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  utenteInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  utenteNome: {
    fontSize: 17,
    fontWeight: "600",
    color: "#202124",
  },
  utenteQuarto: {
    fontSize: 14,
    color: "#5f6368",
    marginTop: 4,
  },
  avatar: {
    marginRight: 14,
  },

  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconAction: {
    padding: 8,
    marginLeft: 8,
  },

  statusAtivo: {
    color: "#2ecc71",
    fontWeight: "bold",
  },

  statusInativo: {
    color: "#e74c3c",
    fontWeight: "bold",
  },

  utenteStatus: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },

  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
    fontSize: 16,
  },
});
