// hooks/AuthContext.js
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  addDoc,
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
  const [isCreatingNewUser, setIsCreatingNewUser] = useState(false);

  // Refs para controlar subscrições e estado
  const unsubscribesRef = useRef({});
  const isInitializedRef = useRef(false);

  // Função para criar usuário com role específica
  const createUserWithRole = useCallback(async (userData, role) => {
    try {
      setIsCreatingNewUser(true);

      const userQuery = query(
        collection(LarApp_db, "users"),
        where("email", "==", userData.email)
      );
      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        throw new Error("Este email já está em uso");
      }

      const newUserData = {
        ...userData,
        uid: auth.currentUser.uid,
        role: role.toLowerCase(),
        createdAt: new Date(),
        status: "ativo",
      };

      const docRef = await addDoc(collection(LarApp_db, "users"), newUserData);
      return { id: docRef.id, ...newUserData };
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      throw error;
    } finally {
      setIsCreatingNewUser(false);
    }
  }, []);

  // Fetch user data with caching
  const fetchUserData = useCallback(async (userId) => {
    try {
      const cachedData = await AsyncStorage.getItem(`userData_${userId}`);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setUserData(parsed);
        return parsed;
      }

      const userQuery = query(
        collection(LarApp_db, "users"),
        where("uid", "==", userId)
      );
      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setUserData(data);
        await AsyncStorage.setItem(`userData_${userId}`, JSON.stringify(data));
        return data;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar dados do user:", error);
      return null;
    }
  }, []);

  // Setup real-time listeners
  const setupListeners = useCallback(async (role) => {
    // Limpar listeners anteriores
    Object.values(unsubscribesRef.current).forEach((unsub) => unsub?.());
    unsubscribesRef.current = {};

    try {
      // Configurar listeners baseado na role
      switch (role?.toLowerCase()) {
        case "admin":
          unsubscribesRef.current.quartos = onSnapshot(
            collection(LarApp_db, "quartos"),
            (snapshot) => {
              setQuartos(
                snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
              );
            }
          );

          unsubscribesRef.current.funcionarios = onSnapshot(
            collection(LarApp_db, "funcionarios"),
            (snapshot) => {
              setFuncionarios(
                snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
              );
            }
          );

          unsubscribesRef.current.utentes = onSnapshot(
            collection(LarApp_db, "utentes"),
            (snapshot) => {
              setUtentes(
                snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
              );
            }
          );
          break;

        case "funcionario":
          unsubscribesRef.current.quartos = onSnapshot(
            collection(LarApp_db, "quartos"),
            (snapshot) => {
              setQuartos(
                snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
              );
            }
          );

          unsubscribesRef.current.utentes = onSnapshot(
            collection(LarApp_db, "utentes"),
            (snapshot) => {
              setUtentes(
                snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
              );
            }
          );
          break;

        case "utente":
          if (!user?.uid) {
            console.warn("User not available for utente listener setup");
            return;
          }

          // Para utentes, buscar seus próprios dados usando o id que corresponde ao uid do usuário
          const utenteQuery = query(
            collection(LarApp_db, "utentes"),
            where("id", "==", user.uid)  // Usando o uid do usuário para buscar pelo id na coleção utentes
          );
          
          unsubscribesRef.current.utenteData = onSnapshot(utenteQuery, (snapshot) => {
            if (!snapshot.empty) {
              const utenteData = snapshot.docs[0].data();
              console.log("Dados do utente atualizados:", utenteData); // Log para debug
              // Atualizar userData com os dados do utente
              setUserData(prevData => ({
                ...prevData,
                contacto: utenteData.contacto,
                morada: utenteData.morada,
                dataNascimento: utenteData.dataNascimento,
                quarto: utenteData.quarto,
                medicamentos: utenteData.medicamentos || [],
                atividades: utenteData.atividades || [],
                dadosVitais: utenteData.dadosVitais || []
              }));
            } else {
              console.warn("Nenhum documento encontrado para o utente com id:", user.uid);
            }
          });

          // Também buscar dados do quarto do utente
          if (userData?.quarto) {
            const quartoQuery = query(
              collection(LarApp_db, "quartos"),
              where("id", "==", userData.quarto)
            );
            
            unsubscribesRef.current.quartoData = onSnapshot(quartoQuery, (snapshot) => {
              if (!snapshot.empty) {
                const quartoData = snapshot.docs[0].data();
                setQuartos([quartoData]);
              }
            });
          }
          break;
      }
    } catch (error) {
      console.error("Erro ao configurar listeners:", error);
    }
  }, [user, userData?.quarto]);

  // Efeito principal para gerenciar autenticação
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const userQuery = query(
            collection(LarApp_db, "users"),
            where("uid", "==", parsedUser.uid)
          );
          const userSnapshot = await getDocs(userQuery);

          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            if (userData.status === "inativo") {
              await AsyncStorage.clear();
              setUser(null);
              setUserData(null);
              return;
            }
            setUser(parsedUser);
            setUserData(userData);
            await setupListeners(userData.role);
          }
        }
      } catch (error) {
        console.error("Erro na inicialização:", error);
      } finally {
        setLoading(false);
        isInitializedRef.current = true;
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (isCreatingNewUser) {
        return;
      }

      if (firebaseUser && (!user || user.uid !== firebaseUser.uid)) {
        if (userData?.role === "admin") {
          return;
        }

        const userQuery = query(
          collection(LarApp_db, "users"),
          where("uid", "==", firebaseUser.uid)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          if (userData.status === "inativo") {
            await auth.signOut();
            await AsyncStorage.clear();
            setUser(null);
            setUserData(null);
            return;
          }
          setUser(firebaseUser);
          await AsyncStorage.setItem("user", JSON.stringify(firebaseUser));
          setUserData(userData);
          await setupListeners(userData.role);
        }
      } else if (!firebaseUser && !isCreatingNewUser) {
        setUser(null);
        setUserData(null);
        setQuartos([]);
        setFuncionarios([]);
        setUtentes([]);
        await AsyncStorage.clear();
        Object.values(unsubscribesRef.current).forEach((unsub) => unsub?.());
        unsubscribesRef.current = {};
      }
    });

    if (!isInitializedRef.current) {
      initializeAuth();
    }

    return () => {
      unsubscribeAuth();
      Object.values(unsubscribesRef.current).forEach((unsub) => unsub?.());
    };
  }, [fetchUserData, setupListeners, isCreatingNewUser, user, userData]);

  const contextValue = {
    user,
    setUser,
    userData,
    loading,
    error,
    clearError: useCallback(() => setError(null), []),
    quartos,
    funcionarios,
    utentes,
    createUserWithRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export default AuthContext;
