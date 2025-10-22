import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';

// Оновлюємо інтерфейс PaySlip
interface PaySlip {
  _id: string;
  paymentDate: string; // Замість month/year
  totalAmount: number;
  description?: string; // Додаємо опис
}

const DashboardPage = () => {
  const authContext = useContext(AuthContext);
  const [paySlips, setPaySlips] = useState<PaySlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaySlips = async () => {
      // Переконуємось, що дані користувача і токен точно існують
      if (authContext?.userInfo?.token) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${authContext.userInfo.token}`,
            },
          };
          // Робимо запит на той самий маршрут
          const { data } = await axios.get<PaySlip[]>('/api/payroll/mypayslips', config); // Очікуємо оновлений тип
          setPaySlips(data);
          setError(''); // Скидаємо помилку
        } catch (err: any) {
          setError('Не вдалося завантажити дані про нарахування.');
          console.error("Помилка завантаження нарахувань:", err);
        } finally {
          setLoading(false);
        }
      } else {
        // Якщо userInfo ще не завантажився, чекаємо
        // Якщо він null після завантаження, ставимо помилку
        const timer = setTimeout(() => {
          if (!localStorage.getItem('userInfo')) {
             setError('Ви не авторизовані');
             setLoading(false);
          }
        }, 200);
         return () => clearTimeout(timer);
      }
    };
     // Запускаємо запит тільки коли userInfo завантажено
     if(authContext?.userInfo !== undefined){ // Перевіряємо, чи стан ініціалізовано
        fetchPaySlips();
     }

  }, [authContext?.userInfo]); // Залежність тепер - userInfo

  return (
    <Container>
      <Row>
        <Col>
          <h1>Особистий кабінет</h1>
          <p>Вітаємо! Тут ви можете переглянути ваші останні нарахування.</p>
        </Col>
      </Row>

      <Row className="mt-4">
        <h2>Останні нарахування</h2>
        {loading ? (
          <Spinner animation="border" />
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : paySlips.length === 0 ? (
          <p>Інформація про нарахування відсутня.</p>
        ) : (
          // Беремо тільки перші 3 нарахування
          paySlips.slice(0, 3).map((slip) => (
            <Col key={slip._id} md={4} className="mb-3">
              <Card>
                <Card.Body>
                  {/* Оновлюємо відображення дати */}
                  <Card.Title>
                    {new Date(slip.paymentDate).toLocaleDateString('uk-UA', {
                       year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </Card.Title>
                  <Card.Text>
                    <strong>Сума до виплати: {slip.totalAmount.toLocaleString('uk-UA')} грн</strong>
                     {slip.description && <><br/><small><i>Опис: {slip.description}</i></small></>}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default DashboardPage;
