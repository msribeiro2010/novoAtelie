import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FaBoxOpen, FaTools, FaClipboardList, FaUsers, FaPlus } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({
    produtos: 0,
    servicos: 0,
    pedidosPendentes: 0,
    clientes: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const produtosSnapshot = await getDocs(collection(db, 'produtos'));
        const servicosSnapshot = await getDocs(collection(db, 'servicos'));
        const clientesSnapshot = await getDocs(collection(db, 'clientes'));
        
        const pedidosPendentesQuery = query(
          collection(db, 'pedidos'),
          where('status', 'in', ['Recebido', 'Em análise'])
        );
        const pedidosPendentesSnapshot = await getDocs(pedidosPendentesQuery);
        
        // Fetch recent orders
        const recentOrdersQuery = query(
          collection(db, 'pedidos'),
          orderBy('dataSolicitacao', 'desc'),
          limit(5)
        );
        const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
        
        const recentOrdersData = [];
        for (const doc of recentOrdersSnapshot.docs) {
          const orderData = {
            id: doc.id,
            ...doc.data()
          };
          
          // Get client info
          if (orderData.clienteId) {
            const clientDoc = await getDocs(
              query(collection(db, 'clientes'), where('__name__', '==', orderData.clienteId))
            );
            if (!clientDoc.empty) {
              orderData.cliente = clientDoc.docs[0].data();
            }
          }
          
          // Get reference info (product or service)
          if (orderData.referenciaId && orderData.tipoSolicitacao) {
            const collectionName = orderData.tipoSolicitacao === 'produto' ? 'produtos' : 'servicos';
            const refDoc = await getDocs(
              query(collection(db, collectionName), where('__name__', '==', orderData.referenciaId))
            );
            if (!refDoc.empty) {
              orderData.referencia = refDoc.docs[0].data();
            }
          }
          
          recentOrdersData.push(orderData);
        }
        
        setStats({
          produtos: produtosSnapshot.size,
          servicos: servicosSnapshot.size,
          pedidosPendentes: pedidosPendentesSnapshot.size,
          clientes: clientesSnapshot.size
        });
        
        setRecentOrders(recentOrdersData);
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Recebido':
        return <Badge bg="info">Recebido</Badge>;
      case 'Em análise':
        return <Badge bg="warning">Em análise</Badge>;
      case 'Concluído':
        return <Badge bg="success">Concluído</Badge>;
      case 'Rejeitado':
        return <Badge bg="danger">Rejeitado</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data não disponível';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Dashboard</h1>
      
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                <FaBoxOpen size={24} className="text-primary" />
              </div>
              <div>
                <h6 className="mb-0">Produtos</h6>
                <h3 className="mb-0">{stats.produtos}</h3>
              </div>
            </Card.Body>
            <Card.Footer className="bg-white border-0">
              <Button 
                as={Link} 
                to="/admin/produtos" 
                variant="outline-primary" 
                size="sm" 
                className="w-100"
              >
                Ver Produtos
              </Button>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                <FaTools size={24} className="text-success" />
              </div>
              <div>
                <h6 className="mb-0">Serviços</h6>
                <h3 className="mb-0">{stats.servicos}</h3>
              </div>
            </Card.Body>
            <Card.Footer className="bg-white border-0">
              <Button 
                as={Link} 
                to="/admin/servicos" 
                variant="outline-success" 
                size="sm" 
                className="w-100"
              >
                Ver Serviços
              </Button>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                <FaClipboardList size={24} className="text-warning" />
              </div>
              <div>
                <h6 className="mb-0">Pedidos Pendentes</h6>
                <h3 className="mb-0">{stats.pedidosPendentes}</h3>
              </div>
            </Card.Body>
            <Card.Footer className="bg-white border-0">
              <Button 
                as={Link} 
                to="/admin/pedidos" 
                variant="outline-warning" 
                size="sm" 
                className="w-100"
              >
                Ver Pedidos
              </Button>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                <FaUsers size={24} className="text-info" />
              </div>
              <div>
                <h6 className="mb-0">Clientes</h6>
                <h3 className="mb-0">{stats.clientes}</h3>
              </div>
            </Card.Body>
            <Card.Footer className="bg-white border-0">
              <Button 
                as={Link} 
                to="/admin/clientes" 
                variant="outline-info" 
                size="sm" 
                className="w-100"
              >
                Ver Clientes
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Pedidos Recentes</h5>
                <Button 
                  as={Link} 
                  to="/admin/pedidos" 
                  variant="primary" 
                  size="sm"
                >
                  Ver Todos
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                  <p className="mt-2">Carregando dados...</p>
                </div>
              ) : (
                <>
                  {recentOrders.length > 0 ? (
                    <div className="table-responsive">
                      <Table hover>
                        <thead>
                          <tr>
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>Tipo</th>
                            <th>Item</th>
                            <th>Status</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map((order) => (
                            <tr key={order.id}>
                              <td>{formatDate(order.dataSolicitacao)}</td>
                              <td>{order.cliente?.nome || 'Cliente não encontrado'}</td>
                              <td>{order.tipoSolicitacao === 'produto' ? 'Produto' : 'Serviço'}</td>
                              <td>
                                {order.referencia ? (
                                  order.tipoSolicitacao === 'produto' ? order.referencia.nome : order.referencia.tipo
                                ) : (
                                  'Item não encontrado'
                                )}
                              </td>
                              <td>{getStatusBadge(order.status)}</td>
                              <td>
                                <Button 
                                  as={Link} 
                                  to={`/admin/pedidos/${order.id}`} 
                                  variant="outline-primary" 
                                  size="sm"
                                >
                                  Detalhes
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <p>Nenhum pedido recente encontrado.</p>
                      <Button 
                        as={Link} 
                        to="/admin/pedidos/novo" 
                        variant="primary"
                      >
                        <FaPlus className="me-2" />
                        Criar Pedido
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
