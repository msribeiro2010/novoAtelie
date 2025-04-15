import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const { currentUser, logout, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Falha ao sair:', error);
    }
  };

  return (
    <Navbar style={{ backgroundColor: '#d4edda' }} expand="lg" className="shadow-sm mb-4 py-2">
      <Container fluid="md">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img 
            src={process.env.PUBLIC_URL + '/images/rosa-cazetta-logo.png'}
            alt="Rosa Cazetta Sewing Studio"
            height="50"
            className="me-2"
            onError={(e) => {e.target.onerror = null; e.target.src = 'https://via.placeholder.com/50x50?text=AR'}}
          />
          <span className="brand-text d-none d-sm-inline">Ateliê Rosa Costuras</span>
<span className="brand-text d-inline d-sm-none">Ateliê Rosa</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/">Início</Nav.Link>
            <Nav.Link as={Link} to="/produtos">Produtos</Nav.Link>
            <Nav.Link as={Link} to="/servicos">Serviços</Nav.Link>
            <Nav.Link as={Link} to="/orcamento">Solicitar Orçamento</Nav.Link>
            
            {currentUser ? (
              <>
                {userProfile && (userProfile.perfil === 'admin' || userProfile.perfil === 'editor') && (
                  <Nav.Link as={Link} to="/admin" className="text-primary">
                    <FaUser className="me-1" /> Área Admin
                  </Nav.Link>
                )}
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="ms-2 d-flex align-items-center mt-2 mt-lg-0"
                >
                  <FaSignOutAlt className="me-1" /> <span className="d-none d-sm-inline">Sair</span>
                </Button>
              </>
            ) : (
              <Nav.Link as={Link} to="/login" className="btn btn-outline-primary btn-sm ms-2 mt-2 mt-lg-0">
                Login
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
