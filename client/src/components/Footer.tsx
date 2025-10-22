import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    // Додаємо клас mt-auto, щоб футер притискався до низу в flex-контейнері App.tsx
    <footer className="bg-dark text-light py-3 mt-auto">
      <Container>
        <Row className="align-items-center">
          {/* Колонка з копірайтом */}
          <Col md={4} className="text-center text-md-start mb-2 mb-md-0">
            &copy; {new Date().getFullYear()} Financial Servise UA
          </Col>

          {/* Колонка з контактами */}
          <Col md={4} className="text-center mb-2 mb-md-0">
            <div>
              {/* Використовуємо правильний href для телефону */}
              <a href="tel:+380673092338" className="text-light me-3">
                <i className="fas fa-phone me-1"></i> +380673092338
              </a>
            </div>
            <div>
              {/* Використовуємо правильний href для пошти */}
              <a href="mailto:Financial.service@gmail.com" className="text-light">
                <i className="fas fa-envelope me-1"></i> Financial.service@gmail.com
              </a>
            </div>
          </Col>

          {/* Колонка з соцмережами */}
          <Col md={4} className="text-center text-md-end">
            {/* Використовуємо реальне посилання для Instagram */}
            <a href="https://instagram.com/Financial_service.ua"
               target="_blank"
               rel="noopener noreferrer"
               className="text-light">
              <i className="fab fa-instagram me-1"></i> Financial_service.ua
            </a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; // <-- Переконайтесь, що цей рядок є

