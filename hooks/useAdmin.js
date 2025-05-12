import { useState, useCallback } from 'react';
import { collection, doc, getDocs, query, where, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { LarApp_db } from '../firebaseConfig';
import { useUtentes } from './useUtentes';
import { useQuartos } from './useQuartos';
import { handleAsyncOperation } from '../utils/errorHandler';

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { addUtente, updateUtente } = useUtentes();
  const { addQuarto, updateQuarto } = useQuartos();

  // Gerenciamento de Utentes
  const getAllUtentes = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const utentesRef = collection(LarApp_db, 'user');
      const q = query(utentesRef, where('role', '==', 'utente'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }, setLoading);
  }, []);

  const deleteUtente = useCallback(async (utenteId) => {
    return handleAsyncOperation(async () => {
      const utenteRef = doc(LarApp_db, 'user', utenteId);
      await updateDoc(utenteRef, {
        status: 'inativo',
        updatedAt: new Date()
      });
      return true;
    }, setLoading);
  }, []);

  // Gerenciamento de Quartos
  const getAllQuartos = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const quartosRef = collection(LarApp_db, 'quartos');
      const snapshot = await getDocs(quartosRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }, setLoading);
  }, []);

  const deleteQuarto = useCallback(async (quartoId) => {
    return handleAsyncOperation(async () => {
      const quartoRef = doc(LarApp_db, 'quartos', quartoId);
      await deleteDoc(quartoRef);
      return true;
    }, setLoading);
  }, []);

  // Alocação de Utentes a Quartos
  const alocarUtenteQuarto = useCallback(async (utenteId, quartoId, quartoAntigo = null) => {
    return handleAsyncOperation(async () => {
      // Atualizar o utente com o novo quarto
      const utenteRef = doc(LarApp_db, 'user', utenteId);
      await updateDoc(utenteRef, {
        quartoId,
        updatedAt: new Date()
      });

      // Atualizar status do quarto novo
      const quartoNovoRef = doc(LarApp_db, 'quartos', quartoId);
      await updateDoc(quartoNovoRef, {
        status: 'ocupado',
        utenteId,
        updatedAt: new Date()
      });

      // Se havia quarto antigo, liberar ele
      if (quartoAntigo) {
        const quartoAntigoRef = doc(LarApp_db, 'quartos', quartoAntigo);
        await updateDoc(quartoAntigoRef, {
          status: 'disponível',
          utenteId: null,
          updatedAt: new Date()
        });
      }

      return true;
    }, setLoading);
  }, []);

  // Geração de Relatórios
  const gerarRelatorioUtentes = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const utentes = await getAllUtentes();
      return {
        totalUtentes: utentes.length,
        ativos: utentes.filter(u => u.status === 'ativo').length,
        porQuarto: utentes.reduce((acc, utente) => {
          if (utente.quartoId) {
            acc[utente.quartoId] = (acc[utente.quartoId] || 0) + 1;
          }
          return acc;
        }, {}),
        dados: utentes
      };
    }, setLoading);
  }, [getAllUtentes]);

  const gerarRelatorioMedicacao = useCallback(async (startDate, endDate) => {
    return handleAsyncOperation(async () => {
      const medicacoesRef = collection(LarApp_db, 'medicacoes');
      const q = query(
        medicacoesRef,
        where('data', '>=', startDate),
        where('data', '<=', endDate)
      );
      const snapshot = await getDocs(q);
      const medicacoes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        total: medicacoes.length,
        porUtente: medicacoes.reduce((acc, med) => {
          acc[med.utenteId] = (acc[med.utenteId] || 0) + 1;
          return acc;
        }, {}),
        dados: medicacoes
      };
    }, setLoading);
  }, []);

  const gerarRelatorioAtividades = useCallback(async (startDate, endDate) => {
    return handleAsyncOperation(async () => {
      const atividadesRef = collection(LarApp_db, 'atividades');
      const q = query(
        atividadesRef,
        where('data', '>=', startDate),
        where('data', '<=', endDate)
      );
      const snapshot = await getDocs(q);
      const atividades = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        total: atividades.length,
        participacoes: atividades.reduce((acc, atv) => {
          (atv.participantes || []).forEach(utenteId => {
            acc[utenteId] = (acc[utenteId] || 0) + 1;
          });
          return acc;
        }, {}),
        dados: atividades
      };
    }, setLoading);
  }, []);

  const gerarRelatorioAtendimentos = useCallback(async (startDate, endDate) => {
    return handleAsyncOperation(async () => {
      const atendimentosRef = collection(LarApp_db, 'atendimentos');
      const q = query(
        atendimentosRef,
        where('data', '>=', startDate),
        where('data', '<=', endDate)
      );
      const snapshot = await getDocs(q);
      const atendimentos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        total: atendimentos.length,
        porTipo: atendimentos.reduce((acc, atd) => {
          acc[atd.tipo] = (acc[atd.tipo] || 0) + 1;
          return acc;
        }, {}),
        porUtente: atendimentos.reduce((acc, atd) => {
          acc[atd.utenteId] = (acc[atd.utenteId] || 0) + 1;
          return acc;
        }, {}),
        dados: atendimentos
      };
    }, setLoading);
  }, []);

  return {
    // Estado
    loading,
    error,
    clearError: () => setError(null),

    // Gerenciamento de Utentes
    getAllUtentes,
    addUtente,
    updateUtente,
    deleteUtente,

    // Gerenciamento de Quartos
    getAllQuartos,
    addQuarto,
    updateQuarto,
    deleteQuarto,

    // Alocação
    alocarUtenteQuarto,

    // Relatórios
    gerarRelatorioUtentes,
    gerarRelatorioMedicacao,
    gerarRelatorioAtividades,
    gerarRelatorioAtendimentos
  };
}; 