import { useState, useCallback } from 'react';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { LarApp_db } from '../firebaseConfig';

export const useQuartos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add new room
  const addQuarto = useCallback(async (quartoData) => {
    setLoading(true);
    setError(null);
    try {
      const quartosRef = collection(LarApp_db, 'quartos');
      const docRef = await addDoc(quartosRef, {
        ...quartoData,
        createdAt: new Date(),
        status: 'disponível'
      });
      return { id: docRef.id, ...quartoData };
    } catch (err) {
      setError('Erro ao adicionar quarto: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update room
  const updateQuarto = useCallback(async (quartoId, quartoData) => {
    setLoading(true);
    setError(null);
    try {
      const quartoRef = doc(LarApp_db, 'quartos', quartoId);
      await updateDoc(quartoRef, {
        ...quartoData,
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

  // Delete room
  const deleteQuarto = useCallback(async (quartoId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(LarApp_db, 'quartos', quartoId));
      return true;
    } catch (err) {
      setError('Erro ao deletar quarto: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get room occupancy status
  const getQuartoStatus = useCallback(async (quartoId) => {
    setLoading(true);
    setError(null);
    try {
      const utentesRef = collection(LarApp_db, 'user');
      const utentesSnap = await getDocs(utentesRef);
      const ocupantes = utentesSnap.docs
        .map(doc => doc.data())
        .filter(utente => utente.quartoId === quartoId);
      
      return {
        ocupado: ocupantes.length > 0,
        ocupantes
      };
    } catch (err) {
      setError('Erro ao verificar status do quarto: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    addQuarto,
    updateQuarto,
    deleteQuarto,
    getQuartoStatus,
    clearError: () => setError(null)
  };
}; 