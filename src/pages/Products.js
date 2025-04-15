import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FaSearch, FaFilter } from 'react-icons/fa';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('nome-asc');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Removendo o orderBy para evitar erros de índice
        const q = query(
          collection(db, 'produtos'),
          where('disponivel', '==', true)
        );
        
        const querySnapshot = await getDocs(q);
        const productsData = [];
        const categoriesSet = new Set();
        
        querySnapshot.forEach((doc) => {
          const product = {
            id: doc.id,
            ...doc.data()
          };
          productsData.push(product);
          
          if (product.categoria) {
            categoriesSet.add(product.categoria);
          }
        });
        
        // Ordenar os produtos por nome antes de definir o estado
        const sortedProducts = [...productsData].sort((a, b) => a.nome.localeCompare(b.nome));
        
        setProducts(sortedProducts);
        setFilteredProducts(sortedProducts);
        setCategories(Array.from(categoriesSet).sort());
        
        console.log('Produtos carregados:', sortedProducts.length);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // Apply filters and sorting
    let result = [...products];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(product => 
        product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      result = result.filter(product => product.categoria === selectedCategory);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'nome-asc':
        result.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'nome-desc':
        result.sort((a, b) => b.nome.localeCompare(a.nome));
        break;
      case 'preco-asc':
        result.sort((a, b) => a.preco - b.preco);
        break;
      case 'preco-desc':
        result.sort((a, b) => b.preco - a.preco);
        break;
      default:
        break;
    }
    
    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategory, sortBy]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('nome-asc');
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Nossos Produtos</h1>
      
      <Row className="mb-4">
        <Col md={4} className="mb-3 mb-md-0">
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </InputGroup>
        </Col>
        <Col md={3} className="mb-3 mb-md-0">
          <Form.Select 
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3} className="mb-3 mb-md-0">
          <Form.Select
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="nome-asc">Nome (A-Z)</option>
            <option value="nome-desc">Nome (Z-A)</option>
            <option value="preco-asc">Preço (menor-maior)</option>
            <option value="preco-desc">Preço (maior-menor)</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Button 
            variant="outline-secondary" 
            onClick={clearFilters}
            className="w-100"
          >
            <FaFilter className="me-1" /> Limpar
          </Button>
        </Col>
      </Row>
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando produtos...</p>
        </div>
      ) : (
        <>
          {filteredProducts.length > 0 ? (
            <Row className="g-4">
              {filteredProducts.map((product) => (
                <Col md={3} sm={6} key={product.id}>
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
                      <div className="d-grid gap-2">
                        <Button 
                          as={Link} 
                          to={`/produtos/${product.id}`} 
                          variant="primary"
                          size="sm"
                        >
                          Ver Detalhes
                        </Button>
                        <Button 
                          as={Link} 
                          to={`/orcamento?produtoId=${product.id}`} 
                          variant="outline-primary"
                          size="sm"
                        >
                          Solicitar Orçamento
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center py-5">
              <p>Nenhum produto encontrado com os filtros selecionados.</p>
              <Button variant="primary" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default Products;
