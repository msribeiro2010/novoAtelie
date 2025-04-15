import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FaEye, FaEdit, FaFilter, FaCalendarAlt, FaTrash } from 'react-icons/fa';

const OrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [editOrder, setEditOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter, typeFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'pedidos'), orderBy('dataSolicitacao', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const ordersData = [];
      for (const pedidoDoc of querySnapshot.docs) {
        const orderData = {
          id: pedidoDoc.id,
          ...pedidoDoc.data()
        };
        
        // Get client info
        if (orderData.clienteId) {
          const clientDocRef = doc(db, 'clientes', orderData.clienteId);
          const clientDoc = await getDoc(clientDocRef);
          if (clientDoc.exists()) {
            orderData.cliente = clientDoc.data();
          }
        }
        
        // Get reference info (product or service)
        if (orderData.referenciaId && orderData.tipoSolicitacao) {
          const collectionName = orderData.tipoSolicitacao === 'produto' ? 'produtos' : 'servicos';
          const refDocRef = doc(db, collectionName, orderData.referenciaId);
          const refDoc = await getDoc(refDocRef);
          if (refDoc.exists()) {
            orderData.referencia = refDoc.data();
          }
        }
        
        ordersData.push(orderData);
      }
      
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      setAlert({
        type: 'danger',
        message: 'Erro ao carregar pedidos. Por favor, tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...orders];
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter) {
      result = result.filter(order => order.tipoSolicitacao === typeFilter);
    }
    
    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filterDate.setHours(0, 0, 0, 0);
      
      result = result.filter(order => {
        if (!order.dataSolicitacao) return false;
        
        const orderDate = order.dataSolicitacao.toDate ? 
          order.dataSolicitacao.toDate() : 
          new Date(order.dataSolicitacao);
        
        orderDate.setHours(0, 0, 0, 0);
        
        return orderDate.getTime() === filterDate.getTime();
      });
    }
    
    setFilteredOrders(result);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setTypeFilter('');
    setDateFilter('');
  };

  const handleShowModal = (order) => {
    setEditOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditOrder(null);
    setShowModal(false);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!editOrder) return;
    
    try {
      setSubmitLoading(true);
      
      await updateDoc(doc(db, 'pedidos', editOrder.id), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      setAlert({
        type: 'success',
        message: 'Status do pedido atualizado com sucesso!'
      });
      
      // Update local state
      const updatedOrders = orders.map(order => {
        if (order.id === editOrder.id) {
          return { ...order, status: newStatus };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      setAlert({
        type: 'danger',
        message: 'Erro ao atualizar status do pedido. Por favor, tente novamente.'
      });
    } finally {
      setSubmitLoading(false);
    }
  };

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

  const handleDeleteOrder = async () => {
    if (!deletingOrder) return;
    try {
      await deleteDoc(doc(db, 'pedidos', deletingOrder.id));
      setOrders(prev => prev.filter(o => o.id !== deletingOrder.id));
      setFilteredOrders(prev => prev.filter(o => o.id !== deletingOrder.id));
      setAlert({ type: 'success', message: 'Pedido excluído com sucesso.' });
    } catch (error) {
      setAlert({ type: 'danger', message: 'Erro ao excluir pedido.' });
      console.error('Erro ao excluir pedido:', error);
    } finally {
      setShowDeleteModal(false);
      setDeletingOrder(null);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gerenciar Pedidos</h1>
      </div>
      
      {alert && (
        <Alert 
          variant={alert.type} 
          onClose={() => setAlert(null)} 
          dismissible
          className="mb-4"
        >
          {alert.message}
        </Alert>
      )}
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5 className="mb-3">Filtros</h5>
          <Row>
            <Col md={3} className="mb-3 mb-md-0">
              <Form.Group controlId="statusFilter">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="Recebido">Recebido</option>
                  <option value="Em análise">Em análise</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Rejeitado">Rejeitado</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <Form.Group controlId="typeFilter">
                <Form.Label>Tipo</Form.Label>
                <Form.Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="produto">Produto</option>
                  <option value="servico">Serviço</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <Form.Group controlId="dateFilter">
                <Form.Label>Data</Form.Label>
                <Form.Control
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button 
                variant="outline-secondary" 
                onClick={clearFilters}
                className="w-100"
              >
                <FaFilter className="me-2" />
                Limpar Filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Carregando pedidos...</p>
            </div>
          ) : (
            <>
              {filteredOrders.length > 0 ? (
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
                      {filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaCalendarAlt className="me-2 text-muted" />
                              {formatDate(order.dataSolicitacao)}
                            </div>
                          </td>
                          <td>
                            {order.cliente ? (
                              <div>
                                <div>{order.cliente.nome}</div>
                                <small className="text-muted">{order.cliente.email}</small>
                              </div>
                            ) : (
                              'Cliente não encontrado'
                            )}
                          </td>
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
                              className="me-2"
                            >
                              <FaEye />
                            </Button>
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => handleShowModal(order)}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setDeletingOrder(order);
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
              ) : (
                <div className="text-center py-5">
                  <p>Nenhum pedido encontrado com os filtros selecionados.</p>
                  {(statusFilter || typeFilter || dateFilter) && (
                    <Button 
                      variant="primary" 
                      onClick={clearFilters}
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
      
      {/* Status Update Modal */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Atualizar Status do Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editOrder && (
            <>
              <div className="mb-4">
                <h6>Detalhes do Pedido:</h6>
                <p className="mb-1">
                  <strong>Cliente:</strong> {editOrder.cliente?.nome || 'Cliente não encontrado'}
                </p>
                <p className="mb-1">
                  <strong>Item:</strong> {
                    editOrder.referencia ? 
                      (editOrder.tipoSolicitacao === 'produto' ? editOrder.referencia.nome : editOrder.referencia.tipo) : 
                      'Item não encontrado'
                  }
                </p>
                <p className="mb-1">
                  <strong>Data da Solicitação:</strong> {formatDate(editOrder.dataSolicitacao)}
                </p>
                <p className="mb-0">
                  <strong>Status Atual:</strong> {getStatusBadge(editOrder.status)}
                </p>
              </div>
              
              <h6>Selecione o Novo Status:</h6>
              <div className="d-grid gap-2 mt-3">
                <Button 
                  variant="info" 
                  onClick={() => handleUpdateStatus('Recebido')}
                  disabled={editOrder.status === 'Recebido' || submitLoading}
                >
                  Recebido
                </Button>
                <Button 
                  variant="warning" 
                  onClick={() => handleUpdateStatus('Em análise')}
                  disabled={editOrder.status === 'Em análise' || submitLoading}
                >
                  Em análise
                </Button>
                <Button 
                  variant="success" 
                  onClick={() => handleUpdateStatus('Concluído')}
                  disabled={editOrder.status === 'Concluído' || submitLoading}
                >
                  Concluído
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => handleUpdateStatus('Rejeitado')}
                  disabled={editOrder.status === 'Rejeitado' || submitLoading}
                >
                  Rejeitado
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Exclusão */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Excluir Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tem certeza que deseja excluir este pedido?</p>
          {deletingOrder && (
            <div className="mt-3">
              <p className="mb-1"><strong>Cliente:</strong> {deletingOrder.cliente?.nome || 'Cliente não encontrado'}</p>
              <p className="mb-1"><strong>Tipo:</strong> {deletingOrder.tipoSolicitacao === 'produto' ? 'Produto' : 'Serviço'}</p>
              <p className="mb-1">
                <strong>Item:</strong> {
                  deletingOrder.referencia ? 
                    (deletingOrder.tipoSolicitacao === 'produto' ? deletingOrder.referencia.nome : deletingOrder.referencia.tipo) : 
                    'Item não encontrado'
                }
              </p>
              <p className="mb-0"><strong>Status:</strong> {deletingOrder.status}</p>
            </div>
          )}
          <Alert variant="warning" className="mt-3 mb-0">
            Esta ação não poderá ser desfeita.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteOrder}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrderManagement;
