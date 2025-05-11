// styles.js
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",  // Centraliza o conteúdo verticalmente
    padding: 20,
    backgroundColor: "#f6f6f6",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",  // Centraliza o conteúdo verticalmente
    paddingHorizontal: 20,
    paddingBottom: 20,  // Garante que o conteúdo tenha espaço na parte inferior
  },
  logoContainer: {
    marginBottom: 20,  // Ajuste para espaçar a logo
    alignItems: "center",  // Centraliza a logo horizontalmente
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,  // Espaço entre o campo de entrada e o botão
    backgroundColor: "#fff",
  },
  icon: {
    marginRight: 10,
    color: "#007bff",
  },
  input: {
    flex: 1,
    height: 45,  // Ajuste a altura para um valor mais confortável
    fontSize: 16,
  },
  error: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
  },
  success: {
    color: "green",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
  },
});

export default styles;
