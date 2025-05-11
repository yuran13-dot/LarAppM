// hooks/AuthContext.js
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { collection, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, LarApp_db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  const fetchUserData = useCallback(async (userId) => {
    try {
      const userDocRef = doc(LarApp_db, 'user', userId); 
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      } else {
        console.log('Documento do user não encontrado!', userId);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do user:', error);
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userDataFromStorage = await AsyncStorage.getItem('user');
        if (userDataFromStorage) {
          const storedUser = JSON.parse(userDataFromStorage);
          setUser(storedUser);
          fetchUserData(storedUser.uid); 
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        AsyncStorage.setItem('user', JSON.stringify(firebaseUser)); 
        fetchUserData(firebaseUser.uid); 
      } else {
        setUser(null);
        setUserData(null);
        AsyncStorage.removeItem('user');
      }
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  return (
    <AuthContext.Provider value={{ user, setUser, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
