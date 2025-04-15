import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = () => {
  const { currentUser, userProfile, loading } = useAuth();

  console.log('ProtectedRoute - Estado atual:', { 
    currentUser: currentUser ? { uid: currentUser.uid, email: currentUser.email } : null,
    userProfile,
    loading 
  });

  if (loading) {
    console.log('ProtectedRoute - Carregando...');
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  // Check if user is logged in and has admin or editor role
  if (!currentUser) {
    console.log('ProtectedRoute - Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" replace />;
  }
  
  if (!userProfile) {
    console.log('ProtectedRoute - Perfil de usuário não encontrado, redirecionando para login');
    return <Navigate to="/login" replace />;
  }
  
  if (userProfile.perfil !== 'admin' && userProfile.perfil !== 'editor') {
    console.log(`ProtectedRoute - Perfil ${userProfile.perfil} não autorizado, redirecionando para login`);
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute - Acesso autorizado, renderizando rota protegida');
  return <Outlet />;
};

export default ProtectedRoute;
