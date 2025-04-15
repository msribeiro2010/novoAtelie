import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { FaUpload, FaSpinner, FaCheck } from 'react-icons/fa';

const QuoteRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const produtoId = queryParams.get('produtoId');
  const servicoId = queryParams.get('servicoId');
  const tamanho = queryParams.get('tamanho');
  
  const [produto, setProduto] = useState(null);
  const [servico, setServico] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  useEffect(() => {
    const fetchReferences = async () => {
      try {
        if (produtoId) {
          const docRef = doc(db, 'produtos', produtoId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setProduto({
              id: docSnap.id,
              ...docSnap.data()
            });
          }
        }
        
        if (servicoId) {
          const docRef = doc(db, 'servicos', servicoId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setServico({
              id: docSnap.id,
              ...docSnap.data()
            });
          }
        }
      } catch (error) {
        console.error('Erro ao buscar referências:', error);
      }
    };
    
    fetchReferences();
  }, [produtoId, servicoId]);
  
  const initialValues = {
    nome: '',
    email: '',
    telefone: '',
    tipoSolicitacao: produtoId ? 'produto' : (servicoId ? 'servico' : ''),
    referenciaId: produtoId || servicoId || '',
    tamanho: tamanho || '',
    observacoes: '',
    imagem: null
  };
  
  const validationSchema = Yup.object({
    nome: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
    telefone: Yup.string().required('Telefone é obrigatório'),
    tipoSolicitacao: Yup.string().required('Tipo de solicitação é obrigatório'),
    observacoes: Yup.string().required('Por favor, descreva o que você precisa')
  });
  
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      
      // Upload image if provided
      let imageUrl = null;
      if (values.imagem) {
        const storageRef = ref(storage, `orcamentos/${Date.now()}_${values.imagem.name}`);
        await uploadBytes(storageRef, values.imagem);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      // Create client if not exists
      const clienteData = {
        nome: values.nome,
        email: values.email,
        telefone: values.telefone,
        dataCadastro: serverTimestamp()
      };
      
      const clienteRef = await addDoc(collection(db, 'clientes'), clienteData);
      
      // Create quote request
      const orcamentoData = {
        clienteId: clienteRef.id,
        tipoSolicitacao: values.tipoSolicitacao,
        referenciaId: values.referenciaId,
        tamanho: values.tamanho,
        observacoes: values.observacoes,
        imagemUrl: imageUrl,
        status: 'Recebido',
        dataSolicitacao: serverTimestamp()
      };
      
      await addDoc(collection(db, 'pedidos'), orcamentoData);
      
      setSuccess(true);
      resetForm();
      setImagePreview(null);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };
  
  const handleImageChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      setFieldValue('imagem', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <Container className="py-4">
      <h1 className="mb-4 text-center">Solicitar Orçamento</h1>
      
      {success ? (
        <Alert variant="success" className="text-center">
          <FaCheck size={24} className="mb-3" />
          <h4>Solicitação enviada com sucesso!</h4>
          <p>Agradecemos pelo seu interesse. Entraremos em contato em breve.</p>
          <p>Você será redirecionado para a página inicial em alguns segundos...</p>
        </Alert>
      ) : (
        <Row>
          <Col md={7}>
            <Card className="shadow-sm">
              <Card.Body>
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ handleSubmit, handleChange, handleBlur, values, touched, errors, setFieldValue, isSubmitting }) => (
                    <Form onSubmit={handleSubmit}>
                      <h5 className="mb-3">Seus Dados</h5>
                      <Row className="mb-3">
                        <Col>
                          <Form.Group controlId="nome">
                            <Form.Label>Nome Completo</Form.Label>
                            <Form.Control
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
                      </Row>
                      
                      <Row className="mb-3">
                        <Col md={6}>
                          <Form.Group controlId="email">
                            <Form.Label>E-mail</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={values.email}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.email && !!errors.email}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.email}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group controlId="telefone">
                            <Form.Label>Telefone</Form.Label>
                            <Form.Control
                              type="text"
                              name="telefone"
                              value={values.telefone}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.telefone && !!errors.telefone}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.telefone}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <hr className="my-4" />
                      <h5 className="mb-3">Detalhes da Solicitação</h5>
                      
                      <Row className="mb-3">
                        <Col md={6}>
                          <Form.Group controlId="tipoSolicitacao">
                            <Form.Label>Tipo de Solicitação</Form.Label>
                            <Form.Select
                              name="tipoSolicitacao"
                              value={values.tipoSolicitacao}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.tipoSolicitacao && !!errors.tipoSolicitacao}
                            >
                              <option value="">Selecione...</option>
                              <option value="produto">Produto</option>
                              <option value="servico">Serviço</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                              {errors.tipoSolicitacao}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        {values.tipoSolicitacao === 'produto' && produto && (
                          <Col md={6}>
                            <Form.Group controlId="tamanho">
                              <Form.Label>Tamanho</Form.Label>
                              <Form.Select
                                name="tamanho"
                                value={values.tamanho}
                                onChange={handleChange}
                              >
                                <option value="">Selecione o tamanho...</option>
                                {produto.tamanhos && produto.tamanhos.map((size) => (
                                  <option key={size} value={size}>{size}</option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        )}
                      </Row>
                      
                      <Form.Group className="mb-3" controlId="observacoes">
                        <Form.Label>Detalhes do Pedido</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          name="observacoes"
                          value={values.observacoes}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.observacoes && !!errors.observacoes}
                          placeholder="Descreva o que você precisa, incluindo detalhes como cores, materiais, medidas, etc."
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.observacoes}
                        </Form.Control.Feedback>
                      </Form.Group>
                      
                      <Form.Group className="mb-4" controlId="imagem">
                        <Form.Label>Anexar Imagem (opcional)</Form.Label>
                        <div className="d-flex align-items-center">
                          <Button 
                            variant="outline-secondary" 
                            onClick={() => document.getElementById('file-upload').click()}
                            className="me-3"
                          >
                            <FaUpload className="me-2" />
                            Escolher Arquivo
                          </Button>
                          <span className="text-muted small">
                            {values.imagem ? values.imagem.name : 'Nenhum arquivo selecionado'}
                          </span>
                        </div>
                        <Form.Control
                          type="file"
                          id="file-upload"
                          hidden
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, setFieldValue)}
                        />
                        
                        {imagePreview && (
                          <div className="mt-3">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="img-thumbnail" 
                              style={{ maxHeight: '200px' }} 
                            />
                          </div>
                        )}
                      </Form.Group>
                      
                      <div className="d-grid">
                        <Button 
                          type="submit" 
                          variant="primary" 
                          size="lg"
                          disabled={isSubmitting || loading}
                        >
                          {loading ? (
                            <>
                              <FaSpinner className="me-2 fa-spin" />
                              Enviando...
                            </>
                          ) : (
                            'Enviar Solicitação'
                          )}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={5}>
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-3">Sua Solicitação</h5>
                
                {produto && (
                  <div className="mb-3 p-3 bg-light rounded">
                    <div className="d-flex">
                      <div className="me-3">
                        <img 
                          src={produto.imagemUrl || 'https://via.placeholder.com/100x100?text=Produto'} 
                          alt={produto.nome}
                          className="img-thumbnail"
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <h6>{produto.nome}</h6>
                        <div className="text-muted small">{produto.categoria}</div>
                        <div className="mt-1">R$ {produto.preco.toFixed(2)}</div>
                        {tamanho && <div className="mt-1">Tamanho: {tamanho}</div>}
                      </div>
                    </div>
                  </div>
                )}
                
                {servico && (
                  <div className="mb-3 p-3 bg-light rounded">
                    <div className="d-flex">
                      <div className="me-3">
                        <img 
                          src={servico.imagemUrl || 'https://via.placeholder.com/100x100?text=Serviço'} 
                          alt={servico.tipo}
                          className="img-thumbnail"
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <h6>{servico.tipo}</h6>
                        <div className="text-muted small">{servico.descricao}</div>
                        <div className="mt-1">A partir de R$ {servico.precoEstimado.toFixed(2)}</div>
                        <div className="mt-1">Tempo estimado: {servico.tempoEstimado}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mb-3">
                  <h6>Como funciona?</h6>
                  <ol className="ps-3">
                    <li className="mb-2">Preencha o formulário com seus dados e detalhes do pedido</li>
                    <li className="mb-2">Anexe uma imagem se necessário para melhor compreensão</li>
                    <li className="mb-2">Envie sua solicitação</li>
                    <li className="mb-2">Analisaremos seu pedido e entraremos em contato em até 24 horas úteis</li>
                    <li>Após aprovação do orçamento, iniciaremos o trabalho</li>
                  </ol>
                </div>
                
                <div className="alert alert-info">
                  <strong>Importante:</strong> O orçamento final pode variar de acordo com a complexidade do trabalho e materiais necessários.
                </div>
              </Card.Body>
            </Card>
            
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="mb-3">Contato Direto</h5>
                <p>Prefere falar conosco diretamente? Entre em contato:</p>
                <ul className="list-unstyled">
                  <li className="mb-2">📞 (19) 98275-1041</li>
                  <li className="mb-2">📧 rcazetta@gmail.com</li>
                  <li>📱 WhatsApp: (19) 98275-1041</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default QuoteRequest;
