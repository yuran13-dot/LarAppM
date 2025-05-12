import { useState, useCallback } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, LarApp_db } from "../firebaseConfig";
import { useAuth } from "./AuthContext";

export const useFuncionarios = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { createUserWithRole } = useAuth();

  // Add new staff member
  const addFuncionario = useCallback(
    async (funcionarioData) => {
      setLoading(true);
      setError(null);
      try {
        // Create authentication account
        const { email, password, ...restData } = funcionarioData;

        // Armazenar o usuário atual
        const currentUser = auth.currentUser;

        // Criar conta de autenticação em um contexto separado
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Forçar reconexão com o usuário admin
        if (currentUser) {
          await auth.updateCurrentUser(currentUser);
        }

        // Add to user collection with role
        const userData = {
          ...restData,
          email,
          uid: userCredential.user.uid,
        };

        const userDoc = await createUserWithRole(userData, "funcionario");

        // Add to funcionarios collection
        const funcionarioDoc = {
          ...restData,
          id: userCredential.user.uid,
          email,
          createdAt: new Date(),
          status: "ativo",
        };

        await addDoc(collection(LarApp_db, "funcionarios"), funcionarioDoc);

        console.log("Funcionário criado com sucesso:", email);
        return { id: userCredential.user.uid, ...funcionarioDoc };
      } catch (err) {
        console.error("Erro ao criar funcionário:", err);
        setError("Erro ao adicionar funcionário: " + err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [createUserWithRole]
  );

  // Update staff member
  const updateFuncionario = useCallback(
    async (funcionarioId, funcionarioData) => {
      setLoading(true);
      setError(null);
      try {
        const funcionarioRef = doc(LarApp_db, "user", funcionarioId);
        await updateDoc(funcionarioRef, {
          ...funcionarioData,
          updatedAt: new Date(),
        });
        return true;
      } catch (err) {
        setError("Erro ao atualizar funcionário: " + err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get staff schedule
  const getFuncionarioSchedule = useCallback(
    async (funcionarioId, startDate, endDate) => {
      setLoading(true);
      setError(null);
      try {
        const scheduleRef = collection(LarApp_db, "schedules");
        const q = query(
          scheduleRef,
          where("funcionarioId", "==", funcionarioId),
          where("date", ">=", startDate),
          where("date", "<=", endDate)
        );

        const scheduleSnap = await getDocs(q);
        return scheduleSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (err) {
        setError("Erro ao buscar agenda do funcionário: " + err.message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get staff assignments
  const getFuncionarioAssignments = useCallback(async (funcionarioId) => {
    setLoading(true);
    setError(null);
    try {
      const assignmentsRef = collection(LarApp_db, "assignments");
      const q = query(
        assignmentsRef,
        where("funcionarioId", "==", funcionarioId),
        where("status", "==", "active")
      );

      const assignmentsSnap = await getDocs(q);
      return assignmentsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (err) {
      setError("Erro ao buscar atribuições do funcionário: " + err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle staff active status
  const toggleFuncionarioStatus = useCallback(
    async (funcionarioId, isActive) => {
      setLoading(true);
      setError(null);
      try {
        const funcionarioRef = doc(LarApp_db, "user", funcionarioId);
        await updateDoc(funcionarioRef, {
          status: isActive ? "ativo" : "inativo",
          updatedAt: new Date(),
        });
        return true;
      } catch (err) {
        setError("Erro ao alterar status do funcionário: " + err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    addFuncionario,
    updateFuncionario,
    getFuncionarioSchedule,
    getFuncionarioAssignments,
    toggleFuncionarioStatus,
    clearError: () => setError(null),
  };
};
