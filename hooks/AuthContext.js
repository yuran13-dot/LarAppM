// hooks/AuthContext.js
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, LarApp_db } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [quartos, setQuartos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [utentes, setUtentes] = useState([]);
  const [error, setError] = useState(null);

  // Fetch user data with caching
  const fetchUserData = useCallback(async (userId) => {
    try {
      // Try to get from cache first
      const cachedData = await AsyncStorage.getItem(`userData_${userId}`);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setUserData(parsed);
      }

      // Fetch fresh data from Firestore
      const userDocRef = doc(LarApp_db, "user", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        // Update cache
        await AsyncStorage.setItem(`userData_${userId}`, JSON.stringify(data));
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar dados do user:", error);
      setError("Erro ao buscar dados do usuário");
      return null;
    }
  }, []);

  // Fetch rooms data
  const fetchQuartos = useCallback(async () => {
    try {
      const quartosRef = collection(LarApp_db, "quartos");
      // Usando onSnapshot para atualização em tempo real
      const unsubscribe = onSnapshot(quartosRef, (snapshot) => {
        const quartosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuartos(quartosData);
      });
      return unsubscribe;
    } catch (error) {
      console.error("Erro ao buscar quartos:", error);
      setError("Erro ao buscar dados dos quartos");
      return () => {};
    }
  }, []);

  // Fetch staff data
  const fetchFuncionarios = useCallback(async () => {
    try {
      const funcionariosRef = collection(LarApp_db, "funcionarios");
      // Usando onSnapshot para atualização em tempo real
      const unsubscribe = onSnapshot(funcionariosRef, (snapshot) => {
        const funcionariosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFuncionarios(funcionariosData);
      });
      return unsubscribe;
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      setError("Erro ao buscar dados dos funcionários");
      return () => {};
    }
  }, []);

  // Fetch residents data
  const fetchUtentes = useCallback(async () => {
    try {
      const utentesRef = collection(LarApp_db, "utentes");
      // Usando onSnapshot para atualização em tempo real
      const unsubscribe = onSnapshot(utentesRef, (snapshot) => {
        const utentesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUtentes(utentesData);
      });
      return unsubscribe;
    } catch (error) {
      console.error("Erro ao buscar utentes:", error);
      setError("Erro ao buscar dados dos utentes");
      return () => {};
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize data based on user role
  const initializeRoleData = useCallback(
    async (role) => {
      let unsubscribes = [];

      switch (role?.toLowerCase()) {
        case "admin":
          const [unsubQuartos, unsubFunc, unsubUtentes] = await Promise.all([
            fetchQuartos(),
            fetchFuncionarios(),
            fetchUtentes(),
          ]);
          unsubscribes = [unsubQuartos, unsubFunc, unsubUtentes];
          break;
        case "funcionario":
          const [unsubQuartos2, unsubUtentes2] = await Promise.all([
            fetchQuartos(),
            fetchUtentes(),
          ]);
          unsubscribes = [unsubQuartos2, unsubUtentes2];
          break;
        case "utente":
          const [unsubQuartos3] = await Promise.all([fetchQuartos()]);
          unsubscribes = [unsubQuartos3];
          break;
      }

      return () => {
        unsubscribes.forEach((unsub) => unsub && unsub());
      };
    },
    [fetchQuartos, fetchFuncionarios, fetchUtentes]
  );

  useEffect(() => {
    let unsubscribeRole = () => {};

    const checkUser = async () => {
      try {
        const userDataFromStorage = await AsyncStorage.getItem("user");
        if (userDataFromStorage) {
          const storedUser = JSON.parse(userDataFromStorage);
          setUser(storedUser);
          const userData = await fetchUserData(storedUser.uid);
          if (userData) {
            unsubscribeRole = await initializeRoleData(userData.role);
          }
        }
      } catch (e) {
        console.error(e);
        setError("Erro ao inicializar dados do usuário");
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await AsyncStorage.setItem("user", JSON.stringify(firebaseUser));
        const userData = await fetchUserData(firebaseUser.uid);
        if (userData) {
          unsubscribeRole = await initializeRoleData(userData.role);
        }
      } else {
        setUser(null);
        setUserData(null);
        setQuartos([]);
        setFuncionarios([]);
        setUtentes([]);
        await AsyncStorage.clear();
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeRole();
    };
  }, [fetchUserData, initializeRoleData]);

  const contextValue = {
    user,
    setUser,
    userData,
    loading,
    error,
    clearError,
    quartos,
    funcionarios,
    utentes,
    fetchUserData,
    fetchQuartos,
    fetchFuncionarios,
    fetchUtentes,
    initializeRoleData,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
