import React, { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Card, Container } from 'react-bootstrap';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const ClientOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'pedidos'),
          where('clienteId', '==', currentUser.uid),
          orderBy('dataSolicitacao', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const ordersData = [];
        querySnapshot.forEach((doc) => {
          ordersData.push({ id: doc.id, ...doc.data() });
        });
        setOrders(ordersData);
      } catch (err) {
        setError('Erro ao buscar suas solicitações.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentUser]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <h2 className="mb-4">Minhas Solicitações</h2>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p>Carregando solicitações...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : orders.length === 0 ? (
            <p>Você ainda não fez nenhuma solicitação.</p>
          ) : (
            <Table hover>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Item</th>
                  <th>Descrição</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{formatDate(order.dataSolicitacao)}</td>
                    <td>{order.tipoSolicitacao === 'produto' ? 'Produto' : 'Serviço'}</td>
                    <td>{order.referenciaId || '-'}</td>
                    <td>{order.descricao || order.observacao || '-'}</td>
                    <td>{order.status || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ClientOrders; 