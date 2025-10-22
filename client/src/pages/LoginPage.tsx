import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook for redirection
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate(); // Initialize the navigate function
  const authContext = useContext(AuthContext);

  useEffect(() => {
    // If user is already logged in, redirect them from this page
    if (authContext?.userInfo) {
      navigate('/dashboard');
    }
  }, [authContext, navigate]);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!authContext) {
      alert('Authentication context error.');
      return;
    }

    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/users/login',
        { email, password }
      );
      
      // Step 1: Save user data globally
      authContext.login(data);

      // Step 2: Redirect to the dashboard ✅
      navigate('/dashboard'); 

    } catch (error) {
      console.error(error);
      alert('Login error! Check your credentials.');
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <h1>Увійти</h1>
          <Form onSubmit={submitHandler}>
            <Form.Group controlId="email">
              <Form.Label>Email адреса</Form.Label>
              <Form.Control
                type="email"
                placeholder="Введіть email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="password" className="mt-2">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                placeholder="Введіть пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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