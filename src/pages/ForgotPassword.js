import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaKey } from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Verifique seu e-mail para instruções de redefinição de senha.');
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      setError('Falha ao redefinir senha. Verifique se o e-mail está correto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <Card className="shadow">
          <Card.Body>
            <h2 className="text-center mb-4">
              <FaKey className="me-2" />
              Recuperar Senha
            </h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="email" className="mb-4">
                <Form.Label>E-mail</Form.Label>
                <Form.Control 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </Form.Group>
              <div className="d-grid">
                <Button 
                  type="submit" 
                  className="mb-3"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Redefinir Senha'}
                </Button>
              </div>
            </Form>
            <div className="text-center mt-3">
              <Link to="/login">Voltar para o Login</Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default ForgotPassword;
