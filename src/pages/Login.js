import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaSignInAlt } from 'react-icons/fa';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [resetMessage, setResetMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      console.log('Tentando fazer login com:', email);
      const result = await login(email, password);
      console.log('Login bem-sucedido, redirecionando para /admin');
      
      // Pequeno atraso para garantir que o contexto de autenticação seja atualizado
      setTimeout(() => {
        navigate('/admin');
      }, 500);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError('Falha ao fazer login. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setResetMessage('');
    if (!email) {
      setError('Digite seu e-mail para recuperar a senha.');
      return;
    }
    try {
      await sendPasswordResetEmail(getAuth(), email);
      setResetMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (err) {
      setError('Erro ao enviar e-mail de recuperação.');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <Card className="shadow">
          <Card.Body>
            <h2 className="text-center mb-4">
              <FaSignInAlt className="me-2" />
              Login
            </h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="email" className="mb-3">
                <Form.Label>E-mail</Form.Label>
                <Form.Control 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </Form.Group>
              <Form.Group id="password" className="mb-4">
                <Form.Label>Senha</Form.Label>
                <Form.Control 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </Form.Group>
              <div className="d-grid">
                <Button 
                  type="submit" 
                  className="mb-3"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </div>
              <div className="text-center mb-2">
                <Link to="/cadastro">Não tem conta? Cadastre-se</Link>
              </div>
              <div className="text-center mb-2">
                <Button variant="link" onClick={handleResetPassword} style={{padding: 0}}>
                  Esqueceu a senha?
                </Button>
              </div>
              {resetMessage && <div className="text-success text-center small mb-2">{resetMessage}</div>}
            </Form>
          </Card.Body>
        </Card>
        <div className="text-center mt-3">
          <p className="text-muted small">
            Esta área é restrita para administradores do Ateliê da Costura Criativa.
          </p>
        </div>
      </div>
    </Container>
  );
};

export default Login;
