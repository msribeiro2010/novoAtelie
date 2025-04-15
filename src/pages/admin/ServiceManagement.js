import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal, Spinner, Alert } from 'react-bootstrap';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaPlus, FaEdit, FaTrash, FaImage, FaCheck, FaTimes } from 'react-icons/fa';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
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
      setAlert({
        type: 'danger',
        message: 'Erro ao carregar serviços. Por favor, tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const initialValues = {
    tipo: '',
    descricao: '',
    precoEstimado: '',
    tempoEstimado: '',
    imagem: null
  };

  const validationSchema = Yup.object({
    tipo: Yup.string().required('Tipo de serviço é obrigatório'),
    descricao: Yup.string().required('Descrição é obrigatória'),
    precoEstimado: Yup.number().required('Preço estimado é obrigatório').positive('Preço deve ser positivo'),
    tempoEstimado: Yup.string().required('Tempo estimado é obrigatório')
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setImagePreview(null);
  };

  const handleShowModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setImagePreview(service.imagemUrl);
    } else {
      setEditingService(null);
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleShowDeleteConfirmation = (service) => {
    setDeleteConfirmation(service);
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
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setSubmitLoading(true);
      
      let imageUrl = editingService?.imagemUrl || null;
      
      // Upload new image if provided
      if (values.imagem) {
        const storageRef = ref(storage, `servicos/${Date.now()}_${values.imagem.name}`);
        await uploadBytes(storageRef, values.imagem);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      const serviceData = {
        tipo: values.tipo,
        descricao: values.descricao,
        precoEstimado: Number(values.precoEstimado),
        tempoEstimado: values.tempoEstimado,
        imagemUrl: imageUrl,
        updatedAt: serverTimestamp()
      };
      
      if (editingService) {
        // Update existing service
        await updateDoc(doc(db, 'servicos', editingService.id), serviceData);
        setAlert({
          type: 'success',
          message: 'Serviço atualizado com sucesso!'
        });
      } else {
        // Create new service
        serviceData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'servicos'), serviceData);
        setAlert({
          type: 'success',
          message: 'Serviço criado com sucesso!'
        });
      }
      
      resetForm();
      handleCloseModal();
      fetchServices();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      setAlert({
        type: 'danger',
        message: 'Erro ao salvar serviço. Por favor, tente novamente.'
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteService = async () => {
    if (!deleteConfirmation) return;
    
    try {
      setSubmitLoading(true);
      
      // Delete image from storage if exists
      if (deleteConfirmation.imagemUrl) {
        try {
          const imageRef = ref(storage, deleteConfirmation.imagemUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Erro ao excluir imagem:', error);
        }
      }
      
      // Delete service document
      await deleteDoc(doc(db, 'servicos', deleteConfirmation.id));
      
      setAlert({
        type: 'success',
        message: 'Serviço excluído com sucesso!'
      });
      
      handleCloseDeleteConfirmation();
      fetchServices();
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      setAlert({
        type: 'danger',
        message: 'Erro ao excluir serviço. Por favor, tente novamente.'
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gerenciar Serviços</h1>
        <Button 
          variant="primary" 
          onClick={() => handleShowModal()}
        >
          <FaPlus className="me-2" />
          Novo Serviço
        </Button>
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
      
      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Carregando serviços...</p>
            </div>
          ) : (
            <>
              {services.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>Imagem</th>
                        <th>Tipo</th>
                        <th>Descrição</th>
                        <th>Preço Estimado</th>
                        <th>Tempo Estimado</th>
                        <th style={{ width: '150px' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((service) => (
                        <tr key={service.id}>
                          <td>
                            <img 
                              src={service.imagemUrl || 'https://via.placeholder.com/50x50?text=Serviço'} 
                              alt={service.tipo}
                              className="img-thumbnail"
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                          </td>
                          <td>{service.tipo}</td>
                          <td>
                            <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {service.descricao}
                            </div>
                          </td>
                          <td>R$ {service.precoEstimado?.toFixed(2) || '0.00'}</td>
                          <td>{service.tempoEstimado}</td>
                          <td>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="me-2"
                              onClick={() => handleShowModal(service)}
                            >
                              <FaEdit />
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleShowDeleteConfirmation(service)}
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
                  <p>Nenhum serviço cadastrado.</p>
                  <Button 
                    variant="primary" 
                    onClick={() => handleShowModal()}
                  >
                    <FaPlus className="me-2" />
                    Cadastrar Serviço
                  </Button>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
      
      {/* Service Form Modal */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingService ? 'Editar Serviço' : 'Novo Serviço'}
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={editingService || initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleSubmit, handleChange, handleBlur, values, touched, errors, setFieldValue }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3" controlId="tipo">
                  <Form.Label>Tipo de Serviço</Form.Label>
                  <Form.Control
                    type="text"
                    name="tipo"
                    value={values.tipo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.tipo && !!errors.tipo}
                    placeholder="Ex: Bainha, Ajuste, Troca de Zíper"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.tipo}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="descricao">
                  <Form.Label>Descrição</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descricao"
                    value={values.descricao}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.descricao && !!errors.descricao}
                    placeholder="Descreva detalhes do serviço"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.descricao}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="precoEstimado">
                      <Form.Label>Preço Estimado (R$)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        name="precoEstimado"
                        value={values.precoEstimado}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.precoEstimado && !!errors.precoEstimado}
                        placeholder="Ex: 25.00"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.precoEstimado}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="tempoEstimado">
                      <Form.Label>Tempo Estimado</Form.Label>
                      <Form.Control
                        type="text"
                        name="tempoEstimado"
                        value={values.tempoEstimado}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.tempoEstimado && !!errors.tempoEstimado}
                        placeholder="Ex: 1-2 dias"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.tempoEstimado}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3" controlId="imagem">
                  <Form.Label>Imagem do Serviço</Form.Label>
                  <div className="d-flex align-items-center mb-2">
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => document.getElementById('service-image-upload').click()}
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
                    id="service-image-upload"
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
                    'Salvar Serviço'
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
            Tem certeza que deseja excluir o serviço <strong>{deleteConfirmation?.tipo}</strong>?
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
            onClick={handleDeleteService}
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
              'Excluir Serviço'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ServiceManagement;
