import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-light mt-5 pt-4 pb-3">
      <Container>
        <Row className="mb-4">
          <Col md={4} className="mb-3">
            <h5 className="mb-3">Rosa Cazetta Sewing Studio</h5>
            <p className="text-muted">
              Criando peças exclusivas e oferecendo serviços de costura de alta qualidade para valorizar seu estilo.
            </p>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="me-2 text-decoration-none">
                <FaFacebook size={24} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="me-2 text-decoration-none">
                <FaInstagram size={24} />
              </a>
              <a href="https://wa.me/5519982751041" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                <FaWhatsapp size={24} />
              </a>
            </div>
          </Col>
          <Col md={4} className="mb-3">
            <h5 className="mb-3">Links Rápidos</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-decoration-none">Início</Link></li>
              <li className="mb-2"><Link to="/produtos" className="text-decoration-none">Produtos</Link></li>
              <li className="mb-2"><Link to="/servicos" className="text-decoration-none">Serviços</Link></li>
              <li className="mb-2"><Link to="/orcamento" className="text-decoration-none">Solicitar Orçamento</Link></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5 className="mb-3">Contato</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <FaMapMarkerAlt className="me-2" />
                <span>Rua Dona Maria Umbelina, 628 - Campinas, SP</span>
              </li>
              <li className="mb-2">
                <FaPhone className="me-2" />
                <span>(19) 98275-1041</span>
              </li>
              <li className="mb-2">
                <FaEnvelope className="me-2" />
                <span>rcazetta@gmail.com</span>
              </li>
            </ul>
          </Col>
        </Row>
        <hr />
        <div className="text-center text-muted">
          <small>&copy; {currentYear} Rosa Cazetta Sewing Studio. Todos os direitos reservados.</small>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
