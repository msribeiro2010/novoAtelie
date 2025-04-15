import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './config';

// Função para verificar e inicializar o Firestore
export const initializeFirestore = async () => {
  try {
    console.log('Inicializando Firestore...');
    
    // Verificar se as coleções existem, se não, criar documentos iniciais
    const collections = ['usuarios', 'produtos', 'servicos', 'pedidos', 'clientes'];
    
    for (const collectionName of collections) {
      try {
        // Tentar obter documentos da coleção para verificar se existe e se temos acesso
        const querySnapshot = await getDocs(collection(db, collectionName));
        console.log(`Coleção ${collectionName} acessada com sucesso. Documentos: ${querySnapshot.size}`);
      } catch (error) {
        console.error(`Erro ao acessar coleção ${collectionName}:`, error);
        
        // Se o erro for de permissão, não podemos fazer nada aqui
        if (error.code === 'permission-denied') {
          console.error(`Permissão negada para acessar a coleção ${collectionName}. Verifique as regras de segurança do Firestore.`);
        }
      }
    }
    
    console.log('Verificação do Firestore concluída.');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar Firestore:', error);
    return false;
  }
};

// Função para criar um usuário admin diretamente no Firestore
// Útil quando o usuário já existe no Authentication mas não no Firestore
export const createAdminUserInFirestore = async (uid, email, name = 'Administrador') => {
  try {
    console.log('Criando usuário admin diretamente no Firestore...');
    
    await setDoc(doc(db, 'usuarios', uid), {
      uid: uid,
      nome: name,
      email: email,
      perfil: 'admin',
    });
    
    console.log('Usuário admin criado com sucesso no Firestore!');
    return true;
  } catch (error) {
    console.error('Erro ao criar usuário admin no Firestore:', error);
    return false;
  }
};
