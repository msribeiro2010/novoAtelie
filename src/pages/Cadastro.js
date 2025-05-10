import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { FaUserPlus } from 'react-icons/fa';

const Cadastro = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
      const user = userCredential.user;
      // Salva perfil como cliente no Firestore
      const db = getFirestore();
      await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid,
        email: user.email,
        perfil: 'cliente',
      });
      setSuccess('Cadastro realizado com sucesso! Redirecionando...');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError('Erro ao cadastrar. ' + (err.message || ''));
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
              <FaUserPlus className="me-2" />
              Cadastro
            </h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
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
                  {loading ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </div>
            </Form>
            <div className="text-center mt-2">
              <Link to="/login">Já tem conta? Entrar</Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Cadastro; 