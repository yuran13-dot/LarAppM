import { useState, useCallback } from 'react';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, LarApp_db } from '../firebaseConfig';

export const useFuncionarios = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add new staff member
  const addFuncionario = useCallback(async (funcionarioData) => {
    setLoading(true);
    setError(null);
    try {
      // Create authentication account
      const { email, password, ...restData } = funcionarioData;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Add to Firestore
      const userData = {
        ...restData,
        email,
        role: 'funcionario',
        uid: userCredential.user.uid,
        createdAt: new Date(),
        status: 'ativo'
      };

      await addDoc(collection(LarApp_db, 'user'), userData);
      return { id: userCredential.user.uid, ...userData };
    } catch (err) {
      setError('Erro ao adicionar funcionário: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update staff member
  const updateFuncionario = useCallback(async (funcionarioId, funcionarioData) => {
    setLoading(true);
    setError(null);
    try {
      const funcionarioRef = doc(LarApp_db, 'user', funcionarioId);
      await updateDoc(funcionarioRef, {
        ...funcionarioData,
        updatedAt: new Date()
      });
      return true;
    } catch (err) {
      setError('Erro ao atualizar funcionário: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get staff schedule
  const getFuncionarioSchedule = useCallback(async (funcionarioId, startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      const scheduleRef = collection(LarApp_db, 'schedules');
      const q = query(
        scheduleRef,
        where('funcionarioId', '==', funcionarioId),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );
      
      const scheduleSnap = await getDocs(q);
      return scheduleSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      setError('Erro ao buscar agenda do funcionário: ' + err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get staff assignments
  const getFuncionarioAssignments = useCallback(async (funcionarioId) => {
    setLoading(true);
    setError(null);
    try {
      const assignmentsRef = collection(LarApp_db, 'assignments');
      const q = query(
        assignmentsRef,
        where('funcionarioId', '==', funcionarioId),
        where('status', '==', 'active')
      );
      
      const assignmentsSnap = await getDocs(q);
      return assignmentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      setError('Erro ao buscar atribuições do funcionário: ' + err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle staff active status
  const toggleFuncionarioStatus = useCallback(async (funcionarioId, isActive) => {
    setLoading(true);
    setError(null);
    try {
      const funcionarioRef = doc(LarApp_db, 'user', funcionarioId);
      await updateDoc(funcionarioRef, {
        status: isActive ? 'ativo' : 'inativo',
        updatedAt: new Date()
      });
      return true;
    } catch (err) {
      setError('Erro ao alterar status do funcionário: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    addFuncionario,
    updateFuncionario,
    getFuncionarioSchedule,
    getFuncionarioAssignments,
    toggleFuncionarioStatus,
    clearError: () => setError(null)
  };
}; 