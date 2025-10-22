import React, { useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios'; // Імпортуємо axios

const LoginPage = () => {
  // Створюємо стани для email та пароля
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Функція, яка спрацює при відправці форми
  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Запобігаємо перезавантаженню сторінки

    try {
      // Конфігурація для POST-запиту
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Відправляємо email та пароль на наш backend
      const { data } = await axios.post(
        'http://localhost:5000/api/users/login',
        { email, password },
        config
      );

      console.log(data); // Виводимо токен в консоль для перевірки
      alert('Вхід успішний!');

      // Тут ми згодом будемо зберігати токен і перенаправляти користувача

    } catch (error) {
      console.error(error);
      alert('Помилка входу! Перевірте дані.');
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <h1>Увійти</h1>
          <Form onSubmit={submitHandler}> {/* Додаємо обробник події */}
            <Form.Group controlId="email">
              <Form.Label>Email адреса</Form.Label>
              <Form.Control
                type="email"
                placeholder="Введіть email"
                value={email} // Прив'язуємо до стану
                onChange={(e) => setEmail(e.target.value)} // Оновлюємо стан при вводі
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="password">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                placeholder="Введіть пароль"
                value={password} // Прив'язуємо до стану
                onChange={(e) => setPassword(e.target.value)} // Оновлюємо стан при вводі
              ></Form.Control>
            </Form.Group>

            <Button type="submit" variant="primary" className="mt-3">
              Увійти
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;