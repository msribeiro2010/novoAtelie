import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { initializeFirestore } from './firebase/initFirestore';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Services from './pages/Services';
import QuoteRequest from './pages/QuoteRequest';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import OrderManagement from './pages/admin/OrderManagement';
import OrderDetail from './pages/admin/OrderDetail';
import ClientManagement from './pages/admin/ClientManagement';

function App() {
  useEffect(() => {
    // Inicializar o Firestore quando o aplicativo é carregado
    const init = async () => {
      try {
        await initializeFirestore();
        console.log('Firestore inicializado com sucesso');
      } catch (error) {
        console.error('Erro ao inicializar Firestore:', error);
      }
    };
    
    init();
  }, []);
  
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/produtos" element={<Products />} />
            <Route path="/produtos/:id" element={<ProductDetail />} />
            <Route path="/servicos" element={<Services />} />
            <Route path="/orcamento" element={<QuoteRequest />} />
            <Route path="/login" element={<Login />} />
            <Route path="/esqueci-senha" element={<ForgotPassword />} />
          </Route>
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/produtos" element={<ProductManagement />} />
              <Route path="/admin/servicos" element={<ServiceManagement />} />
              <Route path="/admin/pedidos" element={<OrderManagement />} />
              <Route path="/admin/pedidos/:id" element={<OrderDetail />} />
              <Route path="/admin/clientes" element={<ClientManagement />} />
            </Route>
          </Route>
          
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
