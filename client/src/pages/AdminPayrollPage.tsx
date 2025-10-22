import React, { useState, useEffect, useContext, useCallback, ChangeEvent } from 'react';
import { Form, Button, Row, Col, Spinner, Alert, ListGroup } from 'react-bootstrap'; // Імпортуємо ListGroup, якщо він буде потрібен
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// Інтерфейс User (тільки потрібні поля)
interface User {
  _id: string;
  fullName: string;
  email: string;
  role?: 'admin' | 'soldier'; // Додаємо роль для фільтрації
}

const AdminPayrollPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(''); // Використовуємо рядок для дати
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [description, setDescription] = useState<string>(''); // Додаємо опис

  const [loading, setLoading] = useState(false); // Загальне завантаження форми
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true); // Для завантаження списку користувачів

  const authContext = useContext(AuthContext);

  // Завантажуємо список користувачів для випадаючого списку
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setError(''); // Скидаємо помилку перед запитом
      if (authContext?.userInfo?.token) {
        try {
          const config = { headers: { Authorization: `Bearer ${authContext.userInfo.token}` } };
          const { data } = await axios.get<User[]>(`${process.env.REACT_APP_API_URL}/api/users`, config);
          // Фільтруємо, залишаючи тільки солдатів (опціонально, можна прибрати filter)
          setUsers(data.filter(user => user.role !== 'admin'));
          // Якщо після фільтрації нікого не залишилось
          if (data.filter(user => user.role !== 'admin').length === 0) {
              setError('Немає користувачів (роль soldier) для вибору.');
          }
        } catch (err: any) {
          setError(err.response?.data?.message || 'Не вдалося завантажити список користувачів.');
          console.error("Помилка завантаження користувачів:", err);
        } finally {
          setLoadingUsers(false);
        }
      } else {
        setError('Немає авторизації');
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [authContext?.userInfo?.token]);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Перевірка, чи обрано дату
    if (!paymentDate) {
        setError('Будь ласка, оберіть дату нарахування.');
        setLoading(false);
        return;
    }

    // Перевірка, чи сума є числом
    const amountNumber = Number(totalAmount);
    if (isNaN(amountNumber) || amountNumber < 0) {
        setError('Будь ласка, введіть коректну суму.');
        setLoading(false);
        return;
    }


    if (!selectedUserId || !paymentDate || !totalAmount) {
        setError('Будь ласка, заповніть усі обов\'язкові поля');
        setLoading(false);
        return;
    }


    try {
      const config = { headers: { Authorization: `Bearer ${authContext?.userInfo?.token}` } };
      const payslipData = {
          userId: selectedUserId,
          paymentDate,
          totalAmount: amountNumber, // Надсилаємо число
          description
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/api/payroll`, payslipData, config);

      setSuccessMessage(`Нарахування за ${new Date(paymentDate).toLocaleDateString('uk-UA')} успішно створено!`);
      // Очищаємо форму
      setSelectedUserId('');
      setPaymentDate('');
      setTotalAmount('');
      setDescription('');
       // Ховаємо повідомлення про успіх через 5 секунд
       setTimeout(() => setSuccessMessage(''), 5000);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Помилка створення нарахування.');
      console.error("Помилка створення нарахування:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="justify-content-md-center">
      <Col xs={12} md={8} lg={6}>
        <h1>Створити нарахування</h1>
        {/* Повідомлення тепер можна закрити */}
        {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>{successMessage}</Alert>}
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

        <Form onSubmit={submitHandler}>
          <Form.Group controlId="userSelect" className="mt-3">
            <Form.Label>Оберіть військовослужбовця</Form.Label>
            {loadingUsers ? (
              <Spinner animation="border" size="sm" />
            ) : users.length === 0 ? (
                // Показуємо Alert, якщо користувачів немає після завантаження
                <Alert variant="info">Немає користувачів для вибору.</Alert>
            ): (
              <Form.Select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                // Робимо неактивним, якщо немає користувачів
                disabled={users.length === 0}
              >
                <option value="">-- Оберіть користувача --</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.fullName} ({user.email})
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>

           <Form.Group controlId="paymentDate" className="mt-3">
                <Form.Label>Дата нарахування</Form.Label>
                <Form.Control
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                    // Обмежуємо вибір майбутніх дат
                    max={new Date().toISOString().split("T")[0]}
                />
            </Form.Group>

          <Form.Group controlId="totalAmount" className="mt-3">
            <Form.Label>Загальна сума (грн)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Введіть суму"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              required
              step="0.01" // Дозволяє вводити копійки
              min="0"
            />
          </Form.Group>

           <Form.Group controlId="description" className="mt-3">
                <Form.Label>Опис (необов'язково)</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Додаткова інформація про нарахування"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </Form.Group>

          <Button type="submit" variant="primary" className="mt-4 w-100" disabled={loading || loadingUsers || users.length === 0}>
            {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Створити нарахування'}
          </Button>
        </Form>
      </Col>
    </Row>
  );
};

export default AdminPayrollPage;

