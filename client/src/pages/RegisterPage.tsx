import React, { useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const RegisterPage = () => {
  // Додаємо нові стани для всіх полів
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Паролі не співпадають!');
      return;
    }

    try {
      const config = {
        headers: { 'Content-Type': 'application/json' },
      };

      // Відправляємо всі дані на backend
      const { data } = await axios.post(
        '/api/users/register', // Використовуємо proxy
        { fullName, email, password }, // Додали fullName
        config
      );

      console.log(data);
      alert('Реєстрація успішна! Тепер ви можете увійти.');
      
    } catch (error) {
      console.error(error);
      alert('Помилка реєстрації!');
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <h1>Реєстрація</h1>
          <Form onSubmit={submitHandler}>
            {/* Нове поле для ПІБ */}
            <Form.Group controlId="fullName" className="mt-2">
              <Form.Label>Повне ім'я (ПІБ)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введіть повне ім'я"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="email" className="mt-2">
              <Form.Label>Email адреса</Form.Label>
              <Form.Control
                type="email"
                placeholder="Введіть email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="password" className="mt-2">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                placeholder="Введіть пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="confirmPassword" className="mt-2">
              <Form.Label>Підтвердіть пароль</Form.Label>
              <Form.Control
                type="password"
                placeholder="Підтвердіть пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              ></Form.Control>
            </Form.Group>

            <Button type="submit" variant="primary" className="mt-3">
              Зареєструватися
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
