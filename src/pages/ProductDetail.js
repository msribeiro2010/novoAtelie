import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Breadcrumb, Badge, Spinner } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FaArrowLeft, FaClipboardList } from 'react-icons/fa';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'produtos', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({
            id: docSnap.id,
            ...docSnap.data()
          });
          
          // Set first size as default if available
          if (docSnap.data().tamanhos && docSnap.data().tamanhos.length > 0) {
            setSelectedSize(docSnap.data().tamanhos[0]);
          }
        } else {
          setError('Produto não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes do produto:', error);
        setError('Erro ao carregar o produto');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleRequestQuote = () => {
    navigate(`/orcamento?produtoId=${id}&tamanho=${selectedSize}`);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando detalhes do produto...</p>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-5 text-center">
        <div className="alert alert-danger">
          {error || 'Produto não encontrado'}
        </div>
        <Button 
          as={Link} 
          to="/produtos" 
          variant="primary"
          className="mt-3"
        >
          <FaArrowLeft className="me-2" />
          Voltar para Produtos
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Início</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/produtos" }}>Produtos</Breadcrumb.Item>
        <Breadcrumb.Item active>{product.nome}</Breadcrumb.Item>
      </Breadcrumb>
      
      <Row>
        <Col md={6} className="mb-4 mb-md-0">
          <div className="product-detail-image-container shadow-sm rounded">
            <img 
              src={product.imagemUrl || 'https://via.placeholder.com/600x400?text=Produto'} 
              alt={product.nome}
              className="img-fluid rounded"
            />
          </div>
        </Col>
        <Col md={6}>
          <h1 className="mb-2">{product.nome}</h1>
          <Badge bg="secondary" className="mb-3">{product.categoria}</Badge>
          
          <h3 className="text-primary mb-3">
            {typeof product.preco === 'number' && product.preco > 0
              ? `R$ ${product.preco.toFixed(2)}`
              : 'Preço sob consulta'}
          </h3>
          
          <div className="mb-4">
            <h5>Descrição</h5>
            <p>{product.descricao}</p>
          </div>
          
          {product.tamanhos && product.tamanhos.length > 0 && (
            <div className="mb-4">
              <h5>Tamanhos Disponíveis</h5>
              <div className="d-flex flex-wrap gap-2">
                {product.tamanhos.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "primary" : "outline-primary"}
                    className="size-button"
                    onClick={() => handleSizeSelect(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              size="lg"
              onClick={handleRequestQuote}
              disabled={product.tamanhos && product.tamanhos.length > 0 && !selectedSize}
            >
              <FaClipboardList className="me-2" />
              Solicitar Orçamento
            </Button>
            <Button 
              as={Link} 
              to="/produtos" 
              variant="outline-secondary"
            >
              <FaArrowLeft className="me-2" />
              Voltar para Produtos
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;
