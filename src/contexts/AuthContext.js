import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, name, profile = 'editor') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid,
        nome: name,
        email: email,
        perfil: profile,
      });
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  async function login(email, password) {
    try {
      console.log('Tentando fazer login com:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login bem-sucedido:', result.user.uid);
      
      // Carregar o perfil do usuário imediatamente após o login
      await fetchUserProfile(result.user.uid);
      
      return result;
    } catch (error) {
      console.error('Erro detalhado no login:', error);
      throw error;
    }
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  async function fetchUserProfile(uid) {
    try {
      console.log('Buscando perfil do usuário:', uid);
      const userDoc = await getDoc(doc(db, 'usuarios', uid));
      
      if (userDoc.exists()) {
        console.log('Perfil encontrado:', userDoc.data());
        setUserProfile(userDoc.data());
        return userDoc.data();
      } else {
        console.log('Perfil não encontrado no Firestore. Criando perfil padrão...');
        
        // Se não encontrar o perfil, criar um perfil padrão de admin
        try {
          const userData = {
            uid: uid,
            nome: 'Administrador',
            email: auth.currentUser?.email || 'admin@ateliedacosturacriativa.com.br',
            perfil: 'admin',
          };
          
          await setDoc(doc(db, 'usuarios', uid), userData);
          console.log('Perfil padrão criado com sucesso!');
          
          setUserProfile(userData);
          return userData;
        } catch (createError) {
          console.error('Erro ao criar perfil padrão:', createError);
          if (createError.code === 'permission-denied') {
            // Se for erro de permissão, criar um perfil local temporário
            const tempProfile = {
              uid: uid,
              nome: 'Administrador (Temporário)',
              email: auth.currentUser?.email || 'admin@ateliedacosturacriativa.com.br',
              perfil: 'admin',
            };
            console.log('Criando perfil temporário devido a erro de permissão:', tempProfile);
            setUserProfile(tempProfile);
            return tempProfile;
          }
          
          setUserProfile(null);
          return null;
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      
      if (error.code === 'permission-denied') {
        // Se for erro de permissão, criar um perfil local temporário
        const tempProfile = {
          uid: uid,
          nome: 'Administrador (Temporário)',
          email: auth.currentUser?.email || 'admin@ateliedacosturacriativa.com.br',
          perfil: 'admin',
        };
        console.log('Criando perfil temporário devido a erro de permissão:', tempProfile);
        setUserProfile(tempProfile);
        return tempProfile;
      }
      
      setUserProfile(null);
      return null;
    }
  }

  useEffect(() => {
    console.log('Configurando listener de autenticação...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Estado de autenticação alterado:', user ? `Usuário ${user.uid} autenticado` : 'Usuário deslogado');
      setCurrentUser(user);
      
      if (user) {
        console.log('Buscando perfil para o usuário autenticado...');
        try {
          await fetchUserProfile(user.uid);
        } catch (error) {
          console.error('Erro ao buscar perfil do usuário:', error);
        }
      } else {
        console.log('Usuário deslogado, limpando perfil');
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    resetPassword,
    fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
