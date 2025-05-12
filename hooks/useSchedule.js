import { useState, useCallback } from 'react';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { LarApp_db } from '../firebaseConfig';

export const useSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add new activity
  const addAtividade = useCallback(async (atividadeData) => {
    setLoading(true);
    setError(null);
    try {
      const atividadesRef = collection(LarApp_db, 'atividades');
      const docRef = await addDoc(atividadesRef, {
        ...atividadeData,
        status: 'ativo',
        createdAt: new Date()
      });
      return { id: docRef.id, ...atividadeData };
    } catch (err) {
      setError('Erro ao adicionar atividade: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update activity
  const updateAtividade = useCallback(async (atividadeId, atividadeData) => {
    setLoading(true);
    setError(null);
    try {
      const atividadeRef = doc(LarApp_db, 'atividades', atividadeId);
      await updateDoc(atividadeRef, {
        ...atividadeData,
        updatedAt: new Date()
      });
      return true;
    } catch (err) {
      setError('Erro ao atualizar atividade: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete activity
  const deleteAtividade = useCallback(async (atividadeId) => {
    setLoading(true);
    setError(null);
    try {
      const atividadeRef = doc(LarApp_db, 'atividades', atividadeId);
      await updateDoc(atividadeRef, {
        status: 'inativo',
        updatedAt: new Date()
      });
      return true;
    } catch (err) {
      setError('Erro ao deletar atividade: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get activities by date range
  const getAtividadesByDate = useCallback(async (startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      const atividadesRef = collection(LarApp_db, 'atividades');
      const q = query(
        atividadesRef,
        where('data', '>=', startDate),
        where('data', '<=', endDate),
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

  // Add participant to activity
  const addParticipante = useCallback(async (atividadeId, utenteId) => {
    setLoading(true);
    setError(null);
    try {
      const atividadeRef = doc(LarApp_db, 'atividades', atividadeId);
      await updateDoc(atividadeRef, {
        participantes: [...(atividadeData.participantes || []), utenteId],
        updatedAt: new Date()
      });
      return true;
    } catch (err) {
      setError('Erro ao adicionar participante: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove participant from activity
  const removeParticipante = useCallback(async (atividadeId, utenteId) => {
    setLoading(true);
    setError(null);
    try {
      const atividadeRef = doc(LarApp_db, 'atividades', atividadeId);
      const atividadeSnap = await getDoc(atividadeRef);
      const atividadeData = atividadeSnap.data();
      
      await updateDoc(atividadeRef, {
        participantes: atividadeData.participantes.filter(id => id !== utenteId),
        updatedAt: new Date()
      });
      return true;
    } catch (err) {
      setError('Erro ao remover participante: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get activity participants
  const getParticipantes = useCallback(async (atividadeId) => {
    setLoading(true);
    setError(null);
    try {
      const atividadeRef = doc(LarApp_db, 'atividades', atividadeId);
      const atividadeSnap = await getDoc(atividadeRef);
      const atividadeData = atividadeSnap.data();
      
      if (!atividadeData.participantes?.length) {
        return [];
      }

      const usersRef = collection(LarApp_db, 'user');
      const participantesSnaps = await Promise.all(
        atividadeData.participantes.map(id => getDoc(doc(usersRef, id)))
      );

      return participantesSnaps
        .filter(snap => snap.exists())
        .map(snap => ({
          id: snap.id,
          ...snap.data()
        }));
    } catch (err) {
      setError('Erro ao buscar participantes: ' + err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    addAtividade,
    updateAtividade,
    deleteAtividade,
    getAtividadesByDate,
    addParticipante,
    removeParticipante,
    getParticipantes,
    clearError: () => setError(null)
  };
}; 