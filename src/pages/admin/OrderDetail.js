import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Form } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FaArrowLeft, FaEdit, FaCheck, FaTimes, FaUser, FaBox, FaTools, FaCalendarAlt, FaComment } from 'react-icons/fa';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const orderDoc = await getDoc(doc(db, 'pedidos', id));
      
      if (!orderDoc.exists()) {
        setError('Pedido não encontrado');
        return;
      }
      
      const orderData = {
        id: orderDoc.id,
        ...orderDoc.data()
      };
      
      // Get client info
      if (orderData.clienteId) {
        const clientDoc = await getDoc(doc(db, 'clientes', orderData.clienteId));
        if (clientDoc.exists()) {
          orderData.cliente = clientDoc.data();
        }
      }
      
      // Get reference info (product or service)
      if (orderData.referenciaId && orderData.tipoSolicitacao) {
        const collectionName = orderData.tipoSolicitacao === 'produto' ? 'produtos' : 'servicos';
        const refDoc = await getDoc(doc(db, collectionName, orderData.referenciaId));
        if (refDoc.exists()) {
          orderData.referencia = refDoc.data();
        }
      }
      
      setOrder(orderData);
      setNewStatus(orderData.status);
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error);
      setError('Erro ao carregar detalhes do pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order || newStatus === order.status) {
      setEditingStatus(false);
      return;
    }
    
    try {
      setSubmitLoading(true);
      
      await updateDoc(doc(db, 'pedidos', order.id), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      setAlert({
        type: 'success',
        message: 'Status do pedido atualizado com sucesso!'
      });
      
      // Update local state
      setOrder({
        ...order,
        status: newStatus
      });
      
      setEditingStatus(false);
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

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando detalhes do pedido...</p>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || 'Pedido não encontrado'}
        </Alert>
        <Button 
          as={Link} 
          to="/admin/pedidos" 
          variant="primary"
        >
          <FaArrowLeft className="me-2" />
          Voltar para Pedidos
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button 
            as={Link} 
            to="/admin/pedidos" 
            variant="outline-secondary"
            className="me-2"
          >
            <FaArrowLeft className="me-2" />
            Voltar
          </Button>
          <h1 className="d-inline-block mb-0">Detalhes do Pedido #{order.id.slice(0, 6)}</h1>
        </div>
        <div>
          {editingStatus ? (
            <>
              <Button 
                variant="success" 
                onClick={handleUpdateStatus}
                disabled={submitLoading}
                className="me-2"
              >
                {submitLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Salvando...
                  </>
                ) : (
                  <>
                    <FaCheck className="me-2" />
                    Salvar
                  </>
                )}
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  setEditingStatus(false);
                  setNewStatus(order.status);
                }}
              >
                <FaTimes className="me-2" />
                Cancelar
              </Button>
            </>
          ) : (
            <Button 
              variant="primary" 
              onClick={() => setEditingStatus(true)}
            >
              <FaEdit className="me-2" />
              Editar Status
            </Button>
          )}
        </div>
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
      
      <Row>
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Informações do Pedido</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <div className="mb-3">
                    <div className="text-muted mb-1">ID do Pedido</div>
                    <div className="fw-bold">{order.id}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-muted mb-1">Tipo de Solicitação</div>
                    <div className="fw-bold">
                      {order.tipoSolicitacao === 'produto' ? 'Produto' : 'Serviço'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-muted mb-1">Data da Solicitação</div>
                    <div className="fw-bold d-flex align-items-center">
                      <FaCalendarAlt className="me-2 text-primary" />
                      {formatDate(order.dataSolicitacao)}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <div className="text-muted mb-1">Status</div>
                    <div>
                      {editingStatus ? (
                        <Form.Select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-75"
                        >
                          <option value="Recebido">Recebido</option>
                          <option value="Em análise">Em análise</option>
                          <option value="Concluído">Concluído</option>
                          <option value="Rejeitado">Rejeitado</option>
                        </Form.Select>
                      ) : (
                        getStatusBadge(order.status)
                      )}
                    </div>
                  </div>
                  {order.tamanho && (
                    <div className="mb-3">
                      <div className="text-muted mb-1">Tamanho</div>
                      <div className="fw-bold">{order.tamanho}</div>
                    </div>
                  )}
                </Col>
              </Row>
              
              <div className="mb-4">
                <h6>Observações</h6>
                <div className="p-3 bg-light rounded">
                  <FaComment className="me-2 text-muted" />
                  {order.observacoes || 'Nenhuma observação fornecida.'}
                </div>
              </div>
              
              {order.imagemUrl && (
                <div>
                  <h6>Imagem Anexada</h6>
                  <div className="text-center">
                    <img 
                      src={order.imagemUrl} 
                      alt="Imagem do pedido" 
                      className="img-fluid rounded shadow-sm" 
                      style={{ maxHeight: '300px' }} 
                    />
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
          
          {order.referencia && (
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  {order.tipoSolicitacao === 'produto' ? (
                    <>
                      <FaBox className="me-2 text-primary" />
                      Detalhes do Produto
                    </>
                  ) : (
                    <>
                      <FaTools className="me-2 text-primary" />
                      Detalhes do Serviço
                    </>
                  )}
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <img 
                      src={order.referencia.imagemUrl || 'https://via.placeholder.com/200x200?text=Sem+Imagem'} 
                      alt={order.tipoSolicitacao === 'produto' ? order.referencia.nome : order.referencia.tipo} 
                      className="img-fluid rounded mb-3 mb-md-0" 
                    />
                  </Col>
                  <Col md={8}>
                    <h5>
                      {order.tipoSolicitacao === 'produto' ? order.referencia.nome : order.referencia.tipo}
                    </h5>
                    
                    {order.tipoSolicitacao === 'produto' && order.referencia.categoria && (
                      <div className="mb-2">
                        <Badge bg="secondary">{order.referencia.categoria}</Badge>
                      </div>
                    )}
                    
                    <p>{order.referencia.descricao}</p>
                    
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong>Preço:</strong> R$ {
                          order.tipoSolicitacao === 'produto' 
                            ? order.referencia.preco?.toFixed(2) 
                            : `${order.referencia.precoEstimado?.toFixed(2)} (estimado)`
                        }
                      </div>
                      
                      {order.tipoSolicitacao === 'servico' && order.referencia.tempoEstimado && (
                        <div>
                          <strong>Tempo Estimado:</strong> {order.referencia.tempoEstimado}
                        </div>
                      )}
                    </div>
                    
                    {order.tipoSolicitacao === 'produto' && order.referencia.tamanhos && (
                      <div className="mt-2">
                        <strong>Tamanhos Disponíveis:</strong> {order.referencia.tamanhos.join(', ')}
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <Button 
                        as={Link} 
                        to={`/admin/${order.tipoSolicitacao === 'produto' ? 'produtos' : 'servicos'}`} 
                        variant="outline-primary" 
                        size="sm"
                      >
                        Ver Todos {order.tipoSolicitacao === 'produto' ? 'Produtos' : 'Serviços'}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Col>
        
        <Col lg={4}>
          {order.cliente && (
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <FaUser className="me-2 text-primary" />
                  Informações do Cliente
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <div className="text-muted mb-1">Nome</div>
                  <div className="fw-bold">{order.cliente.nome}</div>
                </div>
                <div className="mb-3">
                  <div className="text-muted mb-1">E-mail</div>
                  <div className="fw-bold">{order.cliente.email}</div>
                </div>
                <div className="mb-3">
                  <div className="text-muted mb-1">Telefone</div>
                  <div className="fw-bold">{order.cliente.telefone}</div>
                </div>
                {order.cliente.dataCadastro && (
                  <div className="mb-3">
                    <div className="text-muted mb-1">Data de Cadastro</div>
                    <div className="fw-bold">{formatDate(order.cliente.dataCadastro)}</div>
                  </div>
                )}
                <div className="mt-3">
                  <Button 
                    as={Link} 
                    to={`/admin/clientes/${order.clienteId}`} 
                    variant="outline-primary" 
                    size="sm"
                    className="w-100"
                  >
                    Ver Perfil Completo
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
          
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Ações</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button 
                  variant="outline-primary"
                  as={Link}
                  to={`/admin/pedidos`}
                >
                  <FaArrowLeft className="me-2" />
                  Voltar para Pedidos
                </Button>
                
                {order.status !== 'Concluído' && (
                  <Button 
                    variant="success"
                    onClick={() => {
                      setNewStatus('Concluído');
                      setEditingStatus(true);
                    }}
                  >
                    <FaCheck className="me-2" />
                    Marcar como Concluído
                  </Button>
                )}
                
                {order.status !== 'Rejeitado' && (
                  <Button 
                    variant="danger"
                    onClick={() => {
                      setNewStatus('Rejeitado');
                      setEditingStatus(true);
                    }}
                  >
                    <FaTimes className="me-2" />
                    Rejeitar Pedido
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderDetail;
