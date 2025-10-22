import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Row, Col, Spinner, Alert, Container } from 'react-bootstrap'; // Додали Container
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// Інтерфейс User (тільки потрібні поля для списку)
interface User {
  _id: string;
  fullName: string;
  email: string;
  role?: 'admin' | 'soldier'; // Додаємо роль для фільтрації
}

const AdminPayrollPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  // Замінюємо month, year на paymentDate
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [description, setDescription] = useState<string>(''); // Додаємо поле опису

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);

  const authContext = useContext(AuthContext);

  // Отримуємо сьогоднішню дату у форматі YYYY-MM-DD для обмеження input[type=date]
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchUsers = async () => {
      if (authContext?.userInfo?.token) {
        try {
          setLoadingUsers(true);
          const config = { headers: { Authorization: `Bearer ${authContext.userInfo.token}` } };
          // Отримуємо повний список користувачів
          const { data } = await axios.get<User[]>('/api/users', config);
          // Фільтруємо на клієнті, залишаючи тільки солдатів
          setUsers(data.filter(user => user.role === 'soldier'));
          setError('');
        } catch (err: any) {
          setError('Не вдалося завантажити список користувачів.');
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
  }, [authContext]);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!selectedUserId || !paymentDate || !totalAmount) {
      setError('Будь ласка, заповніть поля користувача, дати та суми');
      setLoading(false);
      return;
    }

    // Додаткова перевірка дати (щоб не була в майбутньому)
    if (new Date(paymentDate) > new Date(today)) {
        setError('Дата нарахування не може бути у майбутньому.');
        setLoading(false);
        return;
    }


    try {
      const config = { headers: { Authorization: `Bearer ${authContext?.userInfo?.token}` } };
      const payslipData = {
        userId: selectedUserId,
        paymentDate, // Тепер відправляємо тільки дату
        totalAmount: Number(totalAmount),
        description: description, // Додаємо опис
      };

      await axios.post('/api/payroll', payslipData, config);

      setSuccessMessage(`Нарахування за ${new Date(paymentDate).toLocaleDateString('uk-UA')} успішно створено!`);
      // Очищаємо форму
      setSelectedUserId('');
      setPaymentDate('');
      setTotalAmount('');
      setDescription('');

    } catch (err: any) {
      setError(err.response?.data?.message || 'Помилка створення нарахування.');
      console.error("Помилка створення нарахування:", err);
    } finally {
      setLoading(false);
      // Ховаємо повідомлення про успіх через 5 секунд
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  return (
    // Використовуємо Container для кращого центрування на великих екранах
    <Container>
      <Row className="justify-content-md-center">
        <Col xs={12} md={8} lg={6}>
          <h1>Створити нарахування</h1>
          {/* Додаємо можливість закрити повідомлення */}
          {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>{successMessage}</Alert>}
          {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

          {loadingUsers ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : users.length === 0 ? (
             <Alert variant="info">Немає користувачів для вибору.</Alert>
          ) : (
            <Form onSubmit={submitHandler}>
              <Form.Group controlId="userSelect" className="mt-3">
                <Form.Label>Оберіть військовослужбовця</Form.Label>
                <Form.Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  <option value="">-- Оберіть користувача --</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.fullName} ({user.email})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Нове поле для дати */}
              <Form.Group controlId="paymentDate" className="mt-3">
                <Form.Label>Дата нарахування</Form.Label>
                <Form.Control
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  max={today} // Обмеження на вибір майбутньої дати
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
                  step="0.01"
                  min="0"
                />
              </Form.Group>

              {/* Нове поле для опису */}
               <Form.Group controlId="description" className="mt-3">
                <Form.Label>Опис (необов'язково)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Додаткова інформація про нарахування"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>


              <Button type="submit" variant="primary" className="mt-4 w-100" disabled={loading}>
                {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Створити нарахування'}
              </Button>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminPayrollPage;

