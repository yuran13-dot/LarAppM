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
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { auth, LarApp_db } from "../firebaseConfig";
import { useAuth } from "./AuthContext";

export const useUtentes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { createUserWithRole } = useAuth();

  // Add new resident
  const addUtente = useCallback(
    async (utenteData) => {
      setLoading(true);
      setError(null);
      try {
        // Create authentication account
        const { email, password, ...restData } = utenteData;

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

        const userDoc = await createUserWithRole(userData, "utente");

        // Add to utentes collection
        const utenteDoc = {
          ...restData,
          id: userCredential.user.uid,
          email,
          createdAt: new Date(),
          status: "ativo",
        };

        await addDoc(collection(LarApp_db, "utentes"), utenteDoc);

        console.log("Utente criado com sucesso:", email);
        return { id: userCredential.user.uid, ...utenteDoc };
      } catch (err) {
        console.error("Erro ao criar utente:", err);
        setError("Erro ao adicionar utente: " + err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [createUserWithRole]
  );

  // Update resident
  const updateUtente = useCallback(async (utenteId, utenteData) => {
    setLoading(true);
    setError(null);
    try {
      const utenteRef = doc(LarApp_db, "user", utenteId);
      await updateDoc(utenteRef, {
        ...utenteData,
        updatedAt: new Date(),
      });
      return true;
    } catch (err) {
      setError("Erro ao atualizar utente: " + err.message);
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
      const historicoRef = collection(LarApp_db, "historicoMedico");
      const q = query(historicoRef, where("utenteId", "==", utenteId));
      const historicoSnap = await getDocs(q);

      return historicoSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (err) {
      setError("Erro ao buscar histórico médico: " + err.message);
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
      const historicoRef = collection(LarApp_db, "historicoMedico");
      const docRef = await addDoc(historicoRef, {
        utenteId,
        ...registroData,
        createdAt: new Date(),
      });
      return { id: docRef.id, ...registroData };
    } catch (err) {
      setError("Erro ao adicionar registro médico: " + err.message);
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
      const atividadesRef = collection(LarApp_db, "atividades");
      const q = query(
        atividadesRef,
        where("utenteId", "==", utenteId),
        where("status", "==", "ativo")
      );

      const atividadesSnap = await getDocs(q);
      return atividadesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (err) {
      setError("Erro ao buscar atividades: " + err.message);
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
      const utenteRef = doc(LarApp_db, "user", utenteId);
      await updateDoc(utenteRef, {
        quartoId,
        updatedAt: new Date(),
      });
      return true;
    } catch (err) {
      setError("Erro ao atualizar quarto: " + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Inativar utente
  const inativarUtente = useCallback(async (utenteId) => {
    setLoading(true);
    setError(null);
    try {
      // Atualizar na coleção user
      const userQuery = query(
        collection(LarApp_db, "user"),
        where("uid", "==", utenteId)
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        await updateDoc(doc(LarApp_db, "user", userDoc.id), {
          status: "inativo",
          updatedAt: new Date(),
        });
      }

      // Atualizar na coleção utentes
      const utenteQuery = query(
        collection(LarApp_db, "utentes"),
        where("id", "==", utenteId)
      );
      const utenteSnapshot = await getDocs(utenteQuery);

      if (!utenteSnapshot.empty) {
        const utenteDoc = utenteSnapshot.docs[0];
        await updateDoc(doc(LarApp_db, "utentes", utenteDoc.id), {
          status: "inativo",
          updatedAt: new Date(),
        });
      }

      return true;
    } catch (err) {
      console.error("Erro ao inativar utente:", err);
      setError("Erro ao inativar utente: " + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Ativar utente
  const ativarUtente = useCallback(async (utenteId) => {
    setLoading(true);
    setError(null);
    try {
      // Atualizar na coleção user
      const userQuery = query(
        collection(LarApp_db, "user"),
        where("uid", "==", utenteId)
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        await updateDoc(doc(LarApp_db, "user", userDoc.id), {
          status: "ativo",
          updatedAt: new Date(),
        });
      }

      // Atualizar na coleção utentes
      const utenteQuery = query(
        collection(LarApp_db, "utentes"),
        where("id", "==", utenteId)
      );
      const utenteSnapshot = await getDocs(utenteQuery);

      if (!utenteSnapshot.empty) {
        const utenteDoc = utenteSnapshot.docs[0];
        await updateDoc(doc(LarApp_db, "utentes", utenteDoc.id), {
          status: "ativo",
          updatedAt: new Date(),
        });
      }

      return true;
    } catch (err) {
      console.error("Erro ao ativar utente:", err);
      setError("Erro ao ativar utente: " + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Deletar utente completamente
  const deletarUtente = useCallback(async (utenteId) => {
    setLoading(true);
    setError(null);
    try {
      // Deletar da coleção user
      const userQuery = query(
        collection(LarApp_db, "user"),
        where("uid", "==", utenteId)
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        await deleteDoc(doc(LarApp_db, "user", userDoc.id));
      }

      // Deletar da coleção utentes
      const utenteQuery = query(
        collection(LarApp_db, "utentes"),
        where("id", "==", utenteId)
      );
      const utenteSnapshot = await getDocs(utenteQuery);

      if (!utenteSnapshot.empty) {
        const utenteDoc = utenteSnapshot.docs[0];
        await deleteDoc(doc(LarApp_db, "utentes", utenteDoc.id));
      }

      return true;
    } catch (err) {
      console.error("Erro ao deletar utente:", err);
      setError("Erro ao deletar utente: " + err.message);
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
    inativarUtente,
    ativarUtente,
    deletarUtente,
    clearError: () => setError(null),
  };
};
