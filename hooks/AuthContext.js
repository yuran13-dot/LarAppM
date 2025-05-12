// hooks/AuthContext.js
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, LarApp_db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      const userDocRef = doc(LarApp_db, 'user', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        // Update cache
        await AsyncStorage.setItem(`userData_${userId}`, JSON.stringify(data));
        return data;
      } else {
        console.log('Documento do user não encontrado!', userId);
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar dados do user:', error);
      setError('Erro ao buscar dados do usuário');
      return null;
    }
  }, []);

  // Fetch rooms data
  const fetchQuartos = useCallback(async () => {
    try {
      const quartosRef = collection(LarApp_db, 'quartos');
      const quartosSnap = await getDocs(quartosRef);
      const quartosData = quartosSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuartos(quartosData);
      return quartosData;
    } catch (error) {
      console.error('Erro ao buscar quartos:', error);
      setError('Erro ao buscar dados dos quartos');
      return [];
    }
  }, []);

  // Fetch staff data
  const fetchFuncionarios = useCallback(async () => {
    try {
      const funcionariosRef = collection(LarApp_db, 'user');
      const q = query(funcionariosRef, where('role', '==', 'funcionario'));
      const funcionariosSnap = await getDocs(q);
      const funcionariosData = funcionariosSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFuncionarios(funcionariosData);
      return funcionariosData;
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      setError('Erro ao buscar dados dos funcionários');
      return [];
    }
  }, []);

  // Fetch residents data
  const fetchUtentes = useCallback(async () => {
    try {
      const utentesRef = collection(LarApp_db, 'user');
      const q = query(utentesRef, where('role', '==', 'utente'));
      const utentesSnap = await getDocs(q);
      const utentesData = utentesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUtentes(utentesData);
      return utentesData;
    } catch (error) {
      console.error('Erro ao buscar utentes:', error);
      setError('Erro ao buscar dados dos utentes');
      return [];
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize data based on user role
  const initializeRoleData = useCallback(async (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        await Promise.all([
          fetchQuartos(),
          fetchFuncionarios(),
          fetchUtentes()
        ]);
        break;
      case 'funcionario':
        await Promise.all([
          fetchQuartos(),
          fetchUtentes()
        ]);
        break;
      case 'utente':
        await fetchQuartos();
        break;
    }
  }, [fetchQuartos, fetchFuncionarios, fetchUtentes]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userDataFromStorage = await AsyncStorage.getItem('user');
        if (userDataFromStorage) {
          const storedUser = JSON.parse(userDataFromStorage);
          setUser(storedUser);
          const userData = await fetchUserData(storedUser.uid);
          if (userData) {
            await initializeRoleData(userData.role);
          }
        }
      } catch (e) {
        console.error(e);
        setError('Erro ao inicializar dados do usuário');
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await AsyncStorage.setItem('user', JSON.stringify(firebaseUser));
        const userData = await fetchUserData(firebaseUser.uid);
        if (userData) {
          await initializeRoleData(userData.role);
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

    return () => unsubscribe();
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
    initializeRoleData
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
