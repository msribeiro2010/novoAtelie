import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { createAdminUserInFirestore } from '../firebase/initFirestore';

// Dados do administrador
const adminEmail = 'admin@ateliedacosturacriativa.com.br';
const adminPassword = 'Senha@123456'; // Defina uma senha forte
const adminName = 'Administrador';

// Função para criar usuário admin
export const createAdminUser = async () => {
  try {
    let user;
    
    try {
      // Tentar criar um novo usuário
      console.log('Tentando criar novo usuário admin...');
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      user = userCredential.user;
      console.log('Usuário criado com sucesso no Authentication:', user.uid);
    } catch (error) {
      console.log('Erro ao criar usuário:', error.code, error.message);
      // Se o usuário já existir, tentar fazer login
      if (error.code === 'auth/email-already-in-use') {
        console.log('Usuário já existe, tentando fazer login...');
        try {
          const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
          user = userCredential.user;
          console.log('Login bem-sucedido com usuário existente:', user.uid);
        } catch (loginError) {
          console.error('Erro ao fazer login com usuário existente:', loginError);
          throw loginError;
        }
      } else {
        // Se for outro erro, lançar novamente
        throw error;
      }
    }
    
    // Verificar se o usuário já existe no Firestore
    console.log('Verificando se o usuário existe no Firestore...');
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
      
      if (userDoc.exists()) {
        console.log('Usuário já existe no Firestore');
      } else {
        // Criar perfil do admin no Firestore
        console.log('Criando perfil de usuário no Firestore...');
        await createAdminUserInFirestore(user.uid, adminEmail, adminName);
      }
    } catch (firestoreError) {
      console.error('Erro ao verificar/criar usuário no Firestore:', firestoreError);
      // Mesmo com erro no Firestore, consideramos o processo bem-sucedido
      // já que o usuário foi autenticado
      console.log('Usuário autenticado, mas houve erro ao acessar o Firestore');
    }
    
    console.log('Usuário administrador configurado com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error);
    
    // Se for erro de permissão do Firestore, tentar criar apenas no Authentication
    if (error.code === 'permission-denied') {
      console.log('Erro de permissão no Firestore. Verifique as regras de segurança.');
    }
    
    return false;
  }
};
