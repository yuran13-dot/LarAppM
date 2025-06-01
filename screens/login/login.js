import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, LarApp_db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Icon from "react-native-vector-icons/Ionicons";
import styles from "./styles";
import Logo from "../../components/Logo";
import PrimaryButton from "../../components/PrimaryButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function LoginScreen() {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateInputs = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("O email é obrigatório.");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Insira um email válido.");
      valid = false;
    }

    if (!password) {
      setPasswordError("A palavra passe é obrigatória.");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("A palavra passe deve ter pelo menos 6 caracteres.");
      valid = false;
    } else if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setPasswordError(
        "A palavra passe deve conter pelo menos uma letra maiúscula e um número."
      );
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Fetch user data including role from Firestore
      const userQuery = query(
        collection(LarApp_db, "users"),
        where("uid", "==", user.uid)
      );
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        setError("Dados do usuário não encontrados.");
        await auth.signOut();
        return;
      }

      const userData = userSnapshot.docs[0].data();

      // Verificar se o usuário está ativo
      if (userData.status === "inativo") {
        setError("Sua conta está inativa. Por favor, contate o administrador.");
        await auth.signOut();
        return;
      }

      // Se for um utente, buscar dados adicionais da coleção utentes
      if (userData.role === "utente") {
        const utenteQuery = query(
          collection(LarApp_db, "utentes"),
          where("id", "==", user.uid)
        );
        const utenteSnapshot = await getDocs(utenteQuery);

        if (!utenteSnapshot.empty) {
          const utenteData = utenteSnapshot.docs[0].data();
          console.log("Dados do utente encontrados:", utenteData); // Log para debug
          // Combinar os dados do usuário com os dados do utente
          userData.contacto = utenteData.contacto;
          userData.morada = utenteData.morada;
          userData.dataNascimento = utenteData.dataNascimento;
          userData.quarto = utenteData.quarto;
          userData.medicamentos = utenteData.medicamentos || [];
          userData.atividades = utenteData.atividades || [];
          userData.dadosVitais = utenteData.dadosVitais || [];
        } else {
          console.warn("Nenhum documento encontrado para o utente com id:", user.uid);
        }
      }

      // Store user data in AsyncStorage
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify({
          ...userData,
          uid: user.uid,
        })
      );
      console.log("Login bem-sucedido como:", userData.role);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("User não encontrado. Verifique seu email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Palavra passe incorreta. Tente novamente.");
      } else {
        setError("Falha no login: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Logo />

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.inputContainer}>
          <Icon name="mail-outline" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

        <View style={styles.inputContainer}>
          <Icon name="lock-closed-outline" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Palavra Passe"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        {passwordError ? (
          <Text style={styles.error}>{passwordError}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.linkText}>Esqueceu sua senha?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <PrimaryButton
              title="Entrar"
              onPress={handleLogin}
              disabled={loading}
              style={{ with: "80%" }}
            />
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
