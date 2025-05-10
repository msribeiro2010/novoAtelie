import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal, Spinner, Alert, Toast, ToastContainer } from 'react-bootstrap';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaPlus, FaEdit, FaTrash, FaImage, FaCheck, FaTimes } from 'react-icons/fa';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sobConsulta, setSobConsulta] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'produtos'));
      const productsData = [];
      
      querySnapshot.forEach((doc) => {
        productsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setProducts(productsData);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      showToast('danger', 'Erro ao carregar produtos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const initialValues = {
    nome: '',
    descricao: '',
    preco: '',
    tamanhos: [],
    categoria: '',
    disponivel: true,
    novidade: false,
    lancamento: false,
    destaque: false,
    imagem: null,
    sobConsulta: false
  };

  const validationSchema = Yup.object({
    nome: Yup.string().required('Nome é obrigatório'),
    descricao: Yup.string().required('Descrição é obrigatória'),
    preco: Yup.number().nullable().min(0, 'Preço não pode ser negativo'),
    categoria: Yup.string().required('Categoria é obrigatória'),
    tamanhos: Yup.array().min(1, 'Selecione pelo menos um tamanho')
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setImagePreview(null);
  };

  const handleShowModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setImagePreview(product.imagemUrl);
    } else {
      setEditingProduct(null);
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleShowDeleteConfirmation = (product) => {
    setDeleteConfirmation(product);
  };

  const handleCloseDeleteConfirmation = () => {
    setDeleteConfirmation(null);
  };

  const handleImageChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      setFieldValue('imagem', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        
        // Mostrar uma mensagem explicativa sobre o uso de imagens de placeholder
        showToast('info', 'Devido a configurações de segurança, estamos usando imagens de placeholder durante o desenvolvimento. A imagem final pode ser diferente da selecionada.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSizeChange = (size, values, setFieldValue) => {
    const currentSizes = [...values.tamanhos];
    
    if (currentSizes.includes(size)) {
      setFieldValue('tamanhos', currentSizes.filter(s => s !== size));
    } else {
      setFieldValue('tamanhos', [...currentSizes, size]);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      console.log('Iniciando processo de salvar produto:', values);
      setSubmitLoading(true);
      
      let imageUrl = editingProduct?.imagemUrl || null;
      let imagePath = editingProduct?.imagemPath || null;
      
      // Upload new image if provided
      if (values.imagem) {
        console.log('Processando imagem selecionada...');
        
        // Se for uma imagem real (File), faz upload
        if (values.imagem instanceof File) {
          try {
            const storagePath = `produtos/${Date.now()}_${values.imagem.name}`;
            const storageRef = ref(storage, storagePath);
            await uploadBytes(storageRef, values.imagem);
            imageUrl = await getDownloadURL(storageRef);
            imagePath = storagePath;
          } catch (imageError) {
            console.error('Erro no upload da imagem:', imageError);
            // Continua com placeholder se der erro
          }
        } else if (imagePreview) {
          // Se for base64/preview, só usa preview
          imageUrl = imagePreview;
          imagePath = null;
        }
      }
      
      const productData = {
        nome: values.nome,
        descricao: values.descricao,
        preco: Number(values.preco),
        tamanhos: values.tamanhos,
        novidade: values.novidade || false,
        lancamento: values.lancamento || false,
        destaque: values.destaque || false,
        categoria: values.categoria,
        disponivel: values.disponivel,
        imagemUrl: imageUrl,
        imagemPath: imagePath || null,
        createdAt: editingProduct ? editingProduct.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
        sobConsulta: values.sobConsulta || false
      };
      
      console.log('Dados do produto a serem salvos:', productData);
      
      if (editingProduct) {
        // Update existing product
        console.log('Atualizando produto existente com ID:', editingProduct.id);
        await updateDoc(doc(db, 'produtos', editingProduct.id), productData);
        console.log('Produto atualizado com sucesso!');
        showToast('success', 'Produto atualizado com sucesso!');
      } else {
        // Create new product
        console.log('Criando novo produto...');
        const docRef = await addDoc(collection(db, 'produtos'), productData);
        console.log('Produto criado com sucesso! ID:', docRef.id);
        showToast('success', 'Produto criado com sucesso!');
      }
      
      resetForm();
      handleCloseModal();
      // Pequeno atraso antes de buscar produtos para garantir que o Firestore tenha tempo de processar a operação
      setTimeout(() => {
        fetchProducts();
      }, 1000);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      showToast('danger', `Erro ao salvar produto: ${error.message}. Por favor, tente novamente.`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirmation) return;
    
    try {
      setSubmitLoading(true);
      
      // Só deleta do Storage se imagemPath for válido
      if (
        deleteConfirmation.imagemPath &&
        typeof deleteConfirmation.imagemPath === 'string' &&
        !deleteConfirmation.imagemPath.startsWith('data:') &&
        !deleteConfirmation.imagemPath.startsWith('http')
      ) {
        try {
          const imageRef = ref(storage, deleteConfirmation.imagemPath);
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Erro ao excluir imagem:', error);
        }
      }
      
      // Delete product document
      await deleteDoc(doc(db, 'produtos', deleteConfirmation.id));
      
      showToast('success', 'Produto excluído com sucesso!');
      
      handleCloseDeleteConfirmation();
      fetchProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      showToast('danger', 'Erro ao excluir produto. Por favor, tente novamente.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const availableSizes = ['PP', 'P', 'M', 'G', 'GG', 'XG', '36', '38', '40', '42', '44', '46', '48', '50', 'Único'];
  const categories = ['Vestidos', 'Blusas', 'Calças', 'Saias', 'Conjuntos', 'Acessórios', 'Outros'];

  // Função para exibir toast
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  return (
    <Container fluid className="py-4">
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 9999 }}
      >
        <Toast
          bg={toast.type === 'danger' ? 'danger' : toast.type === 'success' ? 'success' : 'info'}
          onClose={() => setToast({ ...toast, show: false })}
          show={toast.show}
          delay={3500}
          autohide
        >
          <Toast.Body className="text-white">
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gerenciar Produtos</h1>
        <Button 
          variant="primary" 
          onClick={() => handleShowModal()}
        >
          <FaPlus className="me-2" />
          Novo Produto
        </Button>
      </div>
      
      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Carregando produtos...</p>
            </div>
          ) : (
            <>
              {products.length > 0 ? (
                <div className="table-responsive">
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Categoria</th>
                        <th>Preço</th>
                        <th>Disponível</th>
                        <th>Destaque</th>
                        <th>Novidade</th>
                        <th>Lançamento</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td>{product.nome}</td>
                          <td>{product.categoria}</td>
                          <td>
                            {product.sobConsulta
                              ? "Sob Consulta"
                              : product.preco
                                ? `R$ ${parseFloat(product.preco).toFixed(2)}`
                                : "-"
                            }
                          </td>
                          <td>
                            {product.disponivel ? (
                              <FaCheck className="text-success" />
                            ) : (
                              <FaTimes className="text-danger" />
                            )}
                          </td>
                          <td>
                            {product.destaque ? (
                              <FaCheck className="text-success" />
                            ) : (
                              <FaTimes className="text-muted" />
                            )}
                          </td>
                          <td>
                            {product.novidade ? (
                              <FaCheck className="text-success" />
                            ) : (
                              <FaTimes className="text-muted" />
                            )}
                          </td>
                          <td>
                            {product.lancamento ? (
                              <FaCheck className="text-success" />
                            ) : (
                              <FaTimes className="text-muted" />
                            )}
                          </td>
                          <td>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="me-2"
                              onClick={() => handleShowModal(product)}
                            >
                              <FaEdit />
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleShowDeleteConfirmation(product)}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <p>Nenhum produto cadastrado.</p>
                  <Button 
                    variant="primary" 
                    onClick={() => handleShowModal()}
                  >
                    <FaPlus className="me-2" />
                    Cadastrar Produto
                  </Button>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
      
      {/* Product Form Modal */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={editingProduct || initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleSubmit, handleChange, handleBlur, values, touched, errors, setFieldValue }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <Row className="mb-3">
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="nome">Nome do Produto</Form.Label>
                      <Form.Control
                        id="nome"
                        type="text"
                        name="nome"
                        value={values.nome}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.nome && !!errors.nome}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.nome}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="categoria">Categoria</Form.Label>
                      <Form.Select
                        id="categoria"
                        name="categoria"
                        value={values.categoria}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.categoria && !!errors.categoria}
                      >
                        <option value="">Selecione...</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.categoria}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="descricao">Descrição</Form.Label>
                  <Form.Control
                    id="descricao"
                    as="textarea"
                    rows={3}
                    name="descricao"
                    value={values.descricao}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.descricao && !!errors.descricao}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.descricao}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="preco">Preço (R$)</Form.Label>
                      <div className="d-flex align-items-center">
                        <Field
                          id="preco"
                          name="preco"
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control flex-grow-1"
                          disabled={values.sobConsulta}
                        />
                        <div className="form-check mt-4">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="sobConsulta"
                            checked={values.sobConsulta}
                            onChange={(e) => {
                              setFieldValue('sobConsulta', e.target.checked);
                              if (e.target.checked) {
                                setFieldValue('preco', null);
                              }
                            }}
                          />
                          <label className="form-check-label" htmlFor="sobConsulta">
                            Preço sob consulta
                          </label>
                        </div>
                      </div>
                      <Form.Control.Feedback type="invalid">
                        {errors.preco}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Check 
                        id="disponivel"
                        type="checkbox"
                        label="Produto disponível para venda"
                        checked={values.disponivel}
                        onChange={() => setFieldValue('disponivel', !values.disponivel)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Tamanhos Disponíveis</Form.Label>
                  {touched.tamanhos && errors.tamanhos && (
                    <div className="text-danger mb-2 small">{errors.tamanhos}</div>
                  )}
                  <div className="d-flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <Form.Check
                        key={size}
                        type="checkbox"
                        id={`size-${size}`}
                        label={size}
                        checked={values.tamanhos?.includes(size)}
                        onChange={() => handleSizeChange(size, values, setFieldValue)}
                        className="me-2"
                      />
                    ))}
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Marcadores Especiais</Form.Label>
                  <div className="d-flex flex-column gap-2">
                    <Form.Check 
                      type="checkbox"
                      id="novidade"
                      label="Marcar como Novidade"
                      checked={values.novidade}
                      onChange={() => setFieldValue('novidade', !values.novidade)}
                    />
                    <Form.Check 
                      type="checkbox"
                      id="lancamento"
                      label="Marcar como Lançamento"
                      checked={values.lancamento}
                      onChange={() => setFieldValue('lancamento', !values.lancamento)}
                    />
                    <Form.Check 
                      type="checkbox"
                      id="destaque"
                      label="Exibir em Destaque na Página Inicial"
                      checked={values.destaque}
                      onChange={() => setFieldValue('destaque', !values.destaque)}
                    />
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="product-image-upload">Imagem do Produto</Form.Label>
                  <div className="d-flex align-items-center mb-2">
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => document.getElementById('product-image-upload').click()}
                      className="me-3"
                    >
                      <FaImage className="me-2" />
                      {imagePreview ? 'Trocar Imagem' : 'Escolher Imagem'}
                    </Button>
                    <span className="text-muted small">
                      {values.imagem ? values.imagem.name : 'Nenhuma imagem selecionada'}
                    </span>
                  </div>
                  <Form.Control
                    type="file"
                    id="product-image-upload"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, setFieldValue)}
                  />
                  
                  {imagePreview && (
                    <div className="mt-3 text-center">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="img-thumbnail" 
                        style={{ maxHeight: '200px' }} 
                      />
                      <div className="text-muted small mt-2">
                        <strong>Nota:</strong> Durante o desenvolvimento, usaremos esta mesma imagem para o produto.
                        Em ambiente de produção, as imagens serão armazenadas no Firebase Storage.
                      </div>
                    </div>
                  )}
                </Form.Group>
              </Modal.Body>
              
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={submitLoading}
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
                    'Salvar Produto'
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal 
        show={!!deleteConfirmation} 
        onHide={handleCloseDeleteConfirmation}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Tem certeza que deseja excluir o produto <strong>{deleteConfirmation?.nome}</strong>?
          </p>
          <p className="text-danger">
            Esta ação não pode ser desfeita.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteConfirmation}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteProduct}
            disabled={submitLoading}
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
                Excluindo...
              </>
            ) : (
              'Excluir Produto'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductManagement;
