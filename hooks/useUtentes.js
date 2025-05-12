import { useState, useCallback } from 'react';
import { collection, doc, addDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, LarApp_db } from '../firebaseConfig';

export const useUtentes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add new resident
  const addUtente = useCallback(async (utenteData) => {
    setLoading(true);
    setError(null);
    try {
      // Create authentication account
      const { email, password, ...restData } = utenteData;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Add to Firestore
      const userData = {
        ...restData,
        email,
        role: 'utente',
        uid: userCredential.user.uid,
        createdAt: new Date(),
        status: 'ativo'
      };

      await addDoc(collection(LarApp_db, 'user'), userData);
      return { id: userCredential.user.uid, ...userData };
    } catch (err) {
      setError('Erro ao adicionar utente: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update resident
  const updateUtente = useCallback(async (utenteId, utenteData) => {
    setLoading(true);
    setError(null);
    try {
      const utenteRef = doc(LarApp_db, 'user', utenteId);
      await updateDoc(utenteRef, {
        ...utenteData,
        updatedAt: new Date()
      });
      return true;
    } catch (err) {
      setError('Erro ao atualizar utente: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get resident medical history
  const getHistoricoMedico = useCallback(async (utenteId) => {
    setLoading(true);
    setError(null);
    try {
      const historicoRef = collection(LarApp_db, 'historicoMedico');
      const q = query(historicoRef, where('utenteId', '==', utenteId));
      const historicoSnap = await getDocs(q);
      
      return historicoSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      setError('Erro ao buscar histórico médico: ' + err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Add medical record
  const addRegistroMedico = useCallback(async (utenteId, registroData) => {
    setLoading(true);
    setError(null);
    try {
      const historicoRef = collection(LarApp_db, 'historicoMedico');
      const docRef = await addDoc(historicoRef, {
        utenteId,
        ...registroData,
        createdAt: new Date()
      });
      return { id: docRef.id, ...registroData };
    } catch (err) {
      setError('Erro ao adicionar registro médico: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get resident activities
  const getAtividades = useCallback(async (utenteId) => {
    setLoading(true);
    setError(null);
    try {
      const atividadesRef = collection(LarApp_db, 'atividades');
      const q = query(
        atividadesRef,
        where('utenteId', '==', utenteId),
        where('status', '==', 'ativo')
      );
      
      const atividadesSnap = await getDocs(q);
      return atividadesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      setError('Erro ao buscar atividades: ' + err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Update resident room
  const updateQuarto = useCallback(async (utenteId, quartoId) => {
    setLoading(true);
    setError(null);
    try {
      const utenteRef = doc(LarApp_db, 'user', utenteId);
      await updateDoc(utenteRef, {
        quartoId,
        updatedAt: new Date()
      });
      return true;
    } catch (err) {
      setError('Erro ao atualizar quarto: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    addUtente,
    updateUtente,
    getHistoricoMedico,
    addRegistroMedico,
    getAtividades,
    updateQuarto,
    clearError: () => setError(null)
  };
}; 