import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FaShoppingBag, FaTools, FaClipboardList } from 'react-icons/fa';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        // Primeiro tenta buscar produtos marcados como destaque
        let q = query(
          collection(db, 'produtos'),
          where('disponivel', '==', true),
          where('destaque', '==', true),
          limit(4)
        );
        
        let querySnapshot = await getDocs(q);
        let products = [];
        
        querySnapshot.forEach((doc) => {
          products.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Se não houver produtos marcados como destaque suficientes, busca produtos mais recentes
        if (products.length < 4) {
          const remainingLimit = 4 - products.length;
          
          // Busca produtos adicionais que não estão já na lista
          try {
            // Tenta primeiro com o campo updatedAt
            const additionalQuery = query(
              collection(db, 'produtos'),
              where('disponivel', '==', true),
              orderBy('updatedAt', 'desc'),
              limit(remainingLimit)
            );
            
            const additionalSnapshot = await getDocs(additionalQuery);
            
            additionalSnapshot.forEach((doc) => {
              // Verifica se o produto já não está na lista
              if (!products.some(p => p.id === doc.id)) {
                products.push({
                  id: doc.id,
                  ...doc.data()
                });
              }
            });
          } catch (error) {
            console.log('Erro ao buscar com updatedAt, tentando sem orderBy:', error);
            
            // Se falhar, tenta sem o orderBy
            const simpleQuery = query(
              collection(db, 'produtos'),
              where('disponivel', '==', true),
              limit(remainingLimit)
            );
            
            const simpleSnapshot = await getDocs(simpleQuery);
            
            simpleSnapshot.forEach((doc) => {
              // Verifica se o produto já não está na lista
              if (!products.some(p => p.id === doc.id)) {
                products.push({
                  id: doc.id,
                  ...doc.data()
                });
              }
            });
          }
          
          // Código movido para dentro dos blocos try/catch acima
        }
        
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Erro ao buscar produtos em destaque:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const carouselItems = [
    {
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200',
      title: 'Moda Feminina Exclusiva',
      description: 'Conheça nossas criações únicas para mulheres modernas e sofisticadas'
    },
    {
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1200',
      title: 'Moda Masculina Elegante',
      description: 'Roupas masculinas com corte perfeito e acabamento impecável'
    },
    {
      image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?q=80&w=1200',
      title: 'Ateliê de Alta Costura',
      description: 'Cada peça é criada com atenção aos detalhes e materiais de qualidade'
    },
    {
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200',
      title: 'Ajustes e Personalizações',
      description: 'Serviços de costura, ajustes e reparos com acabamento profissional'
    }
  ];

  return (
    <div className="home-page">
      <Carousel fade>
        {carouselItems.map((item, index) => (
          <Carousel.Item key={index}>
            <div 
              className="carousel-image"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${item.image})`,
                height: '500px',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <Container className="h-100 d-flex flex-column justify-content-center text-white">
                <h1>{item.title}</h1>
                <p className="lead">{item.description}</p>
                <div>
                  <Button as={Link} to="/produtos" variant="primary" className="me-2">
                    Ver Produtos
                  </Button>
                  <Button as={Link} to="/orcamento" variant="outline-light">
                    Solicitar Orçamento
                  </Button>
                </div>
              </Container>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

      <Container className="py-5">
        <h2 className="text-center mb-5">Nossos Serviços</h2>
        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 text-center shadow-sm" style={{ backgroundColor: '#f0fff4', borderColor: '#c3e6cb' }}>
              <Card.Body>
                <div className="mb-3">
                  <FaShoppingBag size={48} className="text-primary" />
                </div>
                <Card.Title>Peças Exclusivas</Card.Title>
                <Card.Text>
                  Criações únicas feitas com tecidos de alta qualidade e acabamento impecável.
                </Card.Text>
                <Button as={Link} to="/produtos" variant="outline-primary">
                  Ver Produtos
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 text-center shadow-sm" style={{ backgroundColor: '#f0fff4', borderColor: '#c3e6cb' }}>
              <Card.Body>
                <div className="mb-3">
                  <FaTools size={48} className="text-primary" />
                </div>
                <Card.Title>Reparos e Ajustes</Card.Title>
                <Card.Text>
                  Serviços de qualidade para consertos, bainhas, ajustes e reparos em geral.
                </Card.Text>
                <Button as={Link} to="/servicos" variant="outline-primary">
                  Ver Serviços
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 text-center shadow-sm" style={{ backgroundColor: '#f0fff4', borderColor: '#c3e6cb' }}>
              <Card.Body>
                <div className="mb-3">
                  <FaClipboardList size={48} className="text-primary" />
                </div>
                <Card.Title>Orçamento Personalizado</Card.Title>
                <Card.Text>
                  Solicite um orçamento para seu projeto ou serviço de forma rápida e fácil.
                </Card.Text>
                <Button as={Link} to="/orcamento" variant="outline-primary">
                  Solicitar Orçamento
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <div className="py-5" style={{ backgroundColor: '#dff0d8' }}>
        <Container>
          <h2 className="text-center mb-5">Produtos em Destaque</h2>
          {loading ? (
            <p className="text-center">Carregando produtos...</p>
          ) : (
            <Row className="g-4">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <Col md={3} key={product.id}>
                    <Card className="h-100 product-card shadow-sm" style={{ backgroundColor: '#f0fff4', borderColor: '#c3e6cb' }}>
                      <div className="product-image-container">
                        <Card.Img 
                          variant="top" 
                          src={product.imagemUrl || 'https://via.placeholder.com/300x200?text=Produto'} 
                          alt={product.nome}
                          className="product-image"
                        />
                        {(product.novidade || product.lancamento) && (
                          <div className="position-absolute top-0 start-0 p-2 d-flex flex-column gap-1">
                            {product.novidade && (
                              <span className="badge bg-success">Novidade</span>
                            )}
                            {product.lancamento && (
                              <span className="badge bg-primary">Lançamento</span>
                            )}
                          </div>
                        )}
                      </div>
                      <Card.Body>
                        <Card.Title>{product.nome}</Card.Title>
                        <Card.Text className="text-muted small">{product.categoria}</Card.Text>
                        <Card.Text className="product-price">
                          {product.sobConsulta
                            ? "Sob Consulta"
                            : product.preco
                              ? `R$ ${product.preco.toFixed(2)}`
                              : "Preço não disponível"
                          }
                        </Card.Text>
                        <div className="d-grid">
                          <Button 
                            as={Link} 
                            to={`/produtos/${product.id}`} 
                            variant="primary"
                            size="sm"
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <p className="text-center">Nenhum produto em destaque no momento.</p>
              )}
            </Row>
          )}
          <div className="text-center mt-4">
            <Button as={Link} to="/produtos" variant="outline-primary">
              Ver Todos os Produtos
            </Button>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="align-items-center">
          <Col md={6}>
            <h2>Sobre o Ateliê da Costura Criativa</h2>
            <p>
              Somos um ateliê especializado em criações exclusivas e serviços de costura de alta qualidade. 
              Nossa missão é oferecer peças únicas que expressam personalidade e estilo, além de proporcionar 
              soluções para reparos e ajustes com excelência.
            </p>
            <p>
              Com anos de experiência no mercado, nossa equipe de profissionais qualificados está pronta 
              para atender às suas necessidades com dedicação e atenção aos detalhes.
            </p>
            <Button as={Link} to="/orcamento" variant="primary">
              Entre em Contato
            </Button>
          </Col>
          <Col md={6}>
            <img 
              src="/images/rosa-cazetta-logo.png" 
              alt="Ateliê da Costura Criativa" 
              className="img-fluid rounded shadow"
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
