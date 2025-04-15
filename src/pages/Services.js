import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FaClipboardList, FaTools } from 'react-icons/fa';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'servicos'));
        const servicesData = [];
        
        querySnapshot.forEach((doc) => {
          servicesData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setServices(servicesData);
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Sample services to display if no services are found in the database
  const sampleServices = [
    {
      id: 'bainha',
      tipo: 'Bainha',
      descricao: 'Ajuste de comprimento em peças como calças, saias e vestidos.',
      precoEstimado: null,
      tempoEstimado: '1-2 dias',
      imagemUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80' // Bainha: costureira ajustando barra de calça
    },
    {
      id: 'ajuste',
      tipo: 'Ajuste de Tamanho',
      descricao: 'Ajuste de cintura, quadril ou busto para melhor caimento da peça.',
      precoEstimado: null,
      tempoEstimado: '2-3 dias',
      imagemUrl: 'https://images.unsplash.com/photo-1537274942065-eda9d00a6293'
    },
    {
      id: 'ziper',
      tipo: 'Troca de Zíper',
      descricao: 'Substituição de zíperes quebrados ou danificados em roupas, bolsas e outros itens.',
      precoEstimado: null,
      tempoEstimado: '1-2 dias',
      imagemUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80'
    },
    {
      id: 'conserto',
      tipo: 'Conserto Geral',
      descricao: 'Reparos em rasgos, furos, costuras desfeitas e outros danos em peças de roupa.',
      precoEstimado: null,
      tempoEstimado: '1-3 dias',
      // Conserto Geral: cabide cheio de roupas
      imagemUrl: '/images/consertos-gerais.jpg'
    },
    {
      id: 'botoes',
      tipo: 'Troca de Botões',
      descricao: 'Substituição de botões quebrados ou perdidos, com opção de personalização.',
      precoEstimado: null,
      tempoEstimado: '1 dia',
      imagemUrl: '/images/botoes.jpg' // Botões de costura, referência a ateliê
    },
    {
      id: 'personalizacao',
      tipo: 'Personalização',
      descricao: 'Adição de bordados, apliques ou outros detalhes personalizados em suas peças.',
      precoEstimado: null,
      tempoEstimado: '3-5 dias',
      imagemUrl: '/images/persona.jpg'
    }
  ];

  const displayServices = services.length > 0 ? services : sampleServices;

  return (
    <Container className="py-4">
      <div className="text-center mb-5">
        <h1 className="mb-3">Nossos Serviços</h1>
        <p className="lead">
          Oferecemos uma variedade de serviços de costura para atender às suas necessidades.
          Desde simples reparos até personalizações exclusivas.
        </p>
      </div>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Carregando serviços...</p>
        </div>
      ) : (
        <Row className="g-4">
          {displayServices.map((service) => (
            <Col md={4} key={service.id} className="mb-4">
              <Card className="h-100 shadow-sm service-card">
                <div className="service-image-container">
                  <Card.Img 
                    variant="top" 
                    src={service.imagemUrl || 'https://via.placeholder.com/300x200?text=Serviço'} 
                    alt={service.tipo}
                    className="service-image"
                  />
                  <div className="service-icon">
                    <FaTools size={24} />
                  </div>
                </div>
                <Card.Body>
                  <Card.Title>{service.tipo}</Card.Title>
                  <Card.Text>{service.descricao}</Card.Text>
                  <div className="d-flex justify-content-between mb-3">
                    <div>
                      <strong>Preço estimado:</strong>
                      <div>{service.precoEstimado ? `A partir de R$ ${service.precoEstimado.toFixed(2)}` : 'A consultar'}</div>
                    </div>
                    <div>
                      <strong>Tempo estimado:</strong>
                      <div>{service.tempoEstimado}</div>
                    </div>
                  </div>
                  <div className="d-grid">
                    <Button 
                      as={Link} 
                      to={`/orcamento?servicoId=${service.id}`} 
                      variant="primary"
                    >
                      <FaClipboardList className="me-2" />
                      Solicitar Orçamento
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      
      <div className="text-center mt-5 p-4 bg-light rounded">
        <h3>Precisa de um serviço personalizado?</h3>
        <p>
          Se você não encontrou o serviço que procura, entre em contato conosco para um orçamento personalizado.
        </p>
        <Button 
          as={Link} 
          to="/orcamento" 
          variant="primary" 
          size="lg"
          className="mt-2"
        >
          Solicitar Orçamento Personalizado
        </Button>
      </div>
    </Container>
  );
};

export default Services;
