// styles.js
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#f6f6f6",
    justifyContent: "center",
    padding: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8, // menor radius
    paddingHorizontal: 10,
    paddingVertical: 4, // mais leve
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  icon: {
    marginRight: 6,
    color: "#007bff",
  },
  input: {
    flex: 1,
    height: 40, // mais compacto
    fontSize: 16,
  },

  error: {
    color: "red",
    marginBottom: 8,
    textAlign: "center",
  },
  link: {
    marginTop: 12,
    alignItems: "center",
  },
  linkText: {
    color: "#007bff",
    fontSize: 14,
  },
});

export default styles;
