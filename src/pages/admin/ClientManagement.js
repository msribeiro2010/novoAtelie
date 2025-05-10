import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, InputGroup, Modal, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs, doc, getDoc, where, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FaSearch, FaEye, FaPhone, FaEnvelope, FaCalendarAlt, FaTrash } from 'react-icons/fa';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientOrders, setClientOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [alert, setAlert] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = clients.filter(client => 
        (client.nome || '').toLowerCase().includes(term) || 
        (client.email || '').toLowerCase().includes(term) ||
        (client.telefone || '').includes(term)
      );
      setFilteredClients(filtered);
    }
  }, [clients, searchTerm]);

  const handleDeleteClient = async () => {
    if (!deletingClient) return;
    try {
      await deleteDoc(doc(db, 'usuarios', deletingClient.id));
      setClients(prev => prev.filter(c => c.id !== deletingClient.id));
      setFilteredClients(prev => prev.filter(c => c.id !== deletingClient.id));
      setAlert({ type: 'success', message: 'Cliente excluído com sucesso.' });
    } catch (error) {
      setAlert({ type: 'danger', message: 'Erro ao excluir cliente.' });
      console.error('Erro ao excluir cliente:', error);
    } finally {
      setShowDeleteModal(false);
      setDeletingClient(null);
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'usuarios'),
        where('perfil', '==', 'cliente'),
        orderBy('email')
      );
      const querySnapshot = await getDocs(q);
      const clientsData = [];
      querySnapshot.forEach((doc) => {
        clientsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setClients(clientsData);
      setFilteredClients(clientsData);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      setAlert({
        type: 'danger',
        message: 'Erro ao carregar clientes. Por favor, tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowClientDetails = async (client) => {
    setSelectedClient(client);
    setShowModal(true);

    try {
      setLoadingOrders(true);
      const q = query(
        collection(db, 'pedidos'),
        where('clienteId', '==', client.id),
        orderBy('dataSolicitacao', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const ordersData = [];

      for (const doc of querySnapshot.docs) {
        const orderData = {
          id: doc.id,
          ...doc.data()
        };

        if (orderData.referenciaId && orderData.tipoSolicitacao) {
          const collectionName = orderData.tipoSolicitacao === 'produto' ? 'produtos' : 'servicos';
          const refDoc = await getDoc(doc.ref.firestore.doc(`${collectionName}/${orderData.referenciaId}`));
          if (refDoc.exists()) {
            orderData.referencia = refDoc.data();
          }
        }

        ordersData.push(orderData);
      }

      setClientOrders(ordersData);
    } catch (error) {
      console.error('Erro ao buscar pedidos do cliente:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedClient(null);
    setClientOrders([]);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data não disponível';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Recebido': return <span className="badge bg-info">Recebido</span>;
      case 'Em análise': return <span className="badge bg-warning">Em análise</span>;
      case 'Concluído': return <span className="badge bg-success">Concluído</span>;
      case 'Rejeitado': return <span className="badge bg-danger">Rejeitado</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gerenciar Clientes</h1>
      </div>

      {alert && (
        <Alert variant={alert.type} onClose={() => setAlert(null)} dismissible className="mb-4">
          {alert.message}
        </Alert>
      )}

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por nome, e-mail ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="d-flex align-items-center justify-content-end">
              <span className="text-muted">
                {filteredClients.length} cliente(s) encontrado(s)
              </span>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Carregando clientes...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Telefone</th>
                    <th>Data de Cadastro</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id}>
                      <td>{client.nome || '-'}</td>
                      <td>{client.email || '-'}</td>
                      <td>{client.telefone || '-'}</td>
                      <td>{formatDate(client.dataCadastro)}</td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleShowClientDetails(client)}
                          className="me-2"
                        >
                          <FaEye className="me-1" />
                          Detalhes
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => {
                            setDeletingClient(client);
                            setShowDeleteModal(true);
                          }}
                        >
                          <FaTrash className="me-1" />
                          Excluir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Detalhes do Cliente */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalhes do Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClient && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>{selectedClient.nome}</h5>
                  <div className="mb-2">
                    <FaEnvelope className="me-2 text-muted" />
                    {selectedClient.email}
                  </div>
                  <div className="mb-2">
                    <FaPhone className="me-2 text-muted" />
                    {selectedClient.telefone}
                  </div>
                  <div>
                    <FaCalendarAlt className="me-2 text-muted" />
                    Cliente desde {formatDate(selectedClient.dataCadastro)}
                  </div>
                </Col>
                <Col md={6} className="text-md-end">
                  <div className="mb-2">
                    <strong>ID do Cliente:</strong> {selectedClient.id}
                  </div>
                </Col>
              </Row>
              <h6 className="border-bottom pb-2 mb-3">Histórico de Pedidos</h6>
              {loadingOrders ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" variant="primary" />
                  <p className="mt-2">Carregando pedidos...</p>
                </div>
              ) : (
                clientOrders.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover size="sm">
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Tipo</th>
                          <th>Item</th>
                          <th>Status</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientOrders.map((order) => (
                          <tr key={order.id}>
                            <td>{formatDate(order.dataSolicitacao)}</td>
                            <td>{order.tipoSolicitacao === 'produto' ? 'Produto' : 'Serviço'}</td>
                            <td>{order.referencia ? (order.tipoSolicitacao === 'produto' ? order.referencia.nome : order.referencia.tipo) : 'Item não encontrado'}</td>
                            <td>{getStatusBadge(order.status)}</td>
                            <td>
                              <Button as={Link} to={`/admin/pedidos/${order.id}`} variant="outline-primary" size="sm">
                                Ver
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center">Este cliente ainda não realizou nenhum pedido.</p>
                )
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Exclusão */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Excluir Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir o cliente <strong>{deletingClient?.nome}</strong>? Esta ação não poderá ser desfeita.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteClient}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ClientManagement;
