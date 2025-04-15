import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Nav, Button } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaTachometerAlt, 
  FaBoxOpen, 
  FaTools, 
  FaClipboardList, 
  FaUsers, 
  FaSignOutAlt,
  FaUser,
  FaBars,
  FaHome
} from 'react-icons/fa';

const AdminLayout = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Falha ao sair:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="admin-layout">
      {/* Botão de menu móvel visível apenas em dispositivos pequenos */}
      <Button 
        variant="dark" 
        className="mobile-menu-toggle d-md-none" 
        onClick={toggleSidebar}
      >
        <FaBars />
      </Button>
      
      <div className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h3 className="mb-0">
            {!sidebarCollapsed && 'Painel Admin'}
          </h3>
          <Button 
            variant="link" 
            className="sidebar-toggle p-0 text-white" 
            onClick={toggleSidebar}
          >
            <FaBars />
          </Button>
        </div>
        
        <div className="sidebar-user">
          {!sidebarCollapsed ? (
            <>
              <div className="user-avatar">
                <FaUser size={24} />
              </div>
              <div className="user-info">
                <div className="user-name">{userProfile?.nome || 'Usuário'}</div>
                <div className="user-role">{userProfile?.perfil || 'Admin'}</div>
              </div>
            </>
          ) : (
            <div className="user-avatar-small">
              <FaUser size={20} />
            </div>
          )}
        </div>
        
        <Nav className="flex-column sidebar-nav">
          <Nav.Link 
            as={Link} 
            to="/admin" 
            className={location.pathname === '/admin' ? 'active' : ''}
          >
            <FaTachometerAlt className="nav-icon" />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </Nav.Link>
          
          <Nav.Link 
            as={Link} 
            to="/admin/produtos" 
            className={location.pathname.includes('/admin/produtos') ? 'active' : ''}
          >
            <FaBoxOpen className="nav-icon" />
            {!sidebarCollapsed && <span>Produtos</span>}
          </Nav.Link>
          
          <Nav.Link 
            as={Link} 
            to="/admin/servicos" 
            className={location.pathname.includes('/admin/servicos') ? 'active' : ''}
          >
            <FaTools className="nav-icon" />
            {!sidebarCollapsed && <span>Serviços</span>}
          </Nav.Link>
          
          <Nav.Link 
            as={Link} 
            to="/admin/pedidos" 
            className={location.pathname.includes('/admin/pedidos') ? 'active' : ''}
          >
            <FaClipboardList className="nav-icon" />
            {!sidebarCollapsed && <span>Pedidos</span>}
          </Nav.Link>
          
          <Nav.Link 
            as={Link} 
            to="/admin/clientes" 
            className={location.pathname.includes('/admin/clientes') ? 'active' : ''}
          >
            <FaUsers className="nav-icon" />
            {!sidebarCollapsed && <span>Clientes</span>}
          </Nav.Link>
        </Nav>
        
        <div className="sidebar-footer">
          <Nav.Link 
            as={Link} 
            to="/" 
            className="view-site-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaHome className="nav-icon" />
            {!sidebarCollapsed && <span>Ver Site</span>}
          </Nav.Link>
          
          <Button 
            variant="link" 
            className="logout-btn" 
            onClick={handleLogout}
          >
            <FaSignOutAlt className="nav-icon" />
            {!sidebarCollapsed && <span>Sair</span>}
          </Button>
        </div>
      </div>
      
      <div className={`admin-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <div className="admin-content-header d-md-none">
          <Button 
            variant="outline-dark" 
            className="mb-3" 
            onClick={toggleSidebar}
          >
            <FaBars className="me-2" /> Menu
          </Button>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
