import React, { useState, useEffect, useContext, useCallback, ChangeEvent } from 'react';
// Видаляємо невикористаний імпорт ListGroup
import { Table, Button, Row, Col, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// Інтерфейс User (тільки потрібні поля)
interface User {
  _id: string;
  fullName: string;
  email: string;
  role?: 'admin' | 'soldier'; // Додаємо роль для можливої фільтрації
}

// Інтерфейс PaySlip (оновлений)
interface PaySlip {
  _id: string;
  paymentDate: string; // Зберігаємо як рядок для зручності
  totalAmount: number;
  description?: string;
  user: string | User; // Може бути ID або об'єкт User
}

// Тип для даних форми редагування нарахування
type PaySlipFormData = Omit<PaySlip, '_id' | 'user'>;


const AdminPayrollHistoryPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [paySlips, setPaySlips] = useState<PaySlip[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPaySlips, setLoadingPaySlips] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Стани для модального вікна редагування
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPaySlip, setCurrentPaySlip] = useState<PaySlip | null>(null);
  const [editFormData, setEditFormData] = useState<PaySlipFormData>({
      paymentDate: '',
      totalAmount: 0,
      description: ''
  });
   const [loadingModal, setLoadingModal] = useState(false);


  const authContext = useContext(AuthContext);

  // Завантажуємо список користувачів при першому завантаженні сторінки
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      if (authContext?.userInfo?.token) {
        try {
          const config = { headers: { Authorization: `Bearer ${authContext.userInfo.token}` } };
          const { data } = await axios.get<User[]>(`${process.env.REACT_APP_API_URL}/api/users`, config);
          // Можна додати фільтрацію, якщо треба показувати тільки soldier
          setUsers(data);
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
  }, [authContext?.userInfo?.token]); // Залежність від токена

  // Функція для завантаження історії нарахувань обраного користувача
  const fetchPaySlipsForUser = useCallback(async (userId: string) => {
    if (!userId || !authContext?.userInfo?.token) return;
    setLoadingPaySlips(true);
    setError('');
    setSuccessMessage('');
    try {
      const config = { headers: { Authorization: `Bearer ${authContext.userInfo.token}` } };
      // Використовуємо новий маршрут для отримання нарахувань конкретного користувача
      const { data } = await axios.get<PaySlip[]>(`${process.env.REACT_APP_API_URL}/api/payroll/user/${userId}`, config);
      // Сортуємо за датою від новішої до старішої
      setPaySlips(data.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не вдалося завантажити історію нарахувань.');
      console.error("Помилка завантаження історії:", err);
    } finally {
      setLoadingPaySlips(false);
    }
  }, [authContext?.userInfo?.token]);

  // Обробник зміни користувача у випадаючому списку
  const handleUserChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    if (userId) {
      fetchPaySlipsForUser(userId); // Завантажуємо історію для обраного ID
    } else {
      setPaySlips([]); // Очищаємо список, якщо користувача не обрано
    }
  };

  // --- Логіка для модального вікна редагування ---
  const handleShowEditModal = (payslip: PaySlip) => {
    setCurrentPaySlip(payslip);
    // Встановлюємо початкові дані форми (форматуємо дату для input type="date")
    setEditFormData({
        paymentDate: payslip.paymentDate.substring(0, 10), // Беремо тільки YYYY-MM-DD
        totalAmount: payslip.totalAmount,
        description: payslip.description || ''
    });
    setShowEditModal(true);
    setError(''); // Скидаємо помилки при відкритті
    setSuccessMessage('');
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setCurrentPaySlip(null);
  };

   const handleEditFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentPaySlip || !selectedUserId) return; // Перевіряємо чи є вибраний юзер

    setLoadingModal(true);
    setError('');
    setSuccessMessage('');

     try {
        const config = { headers: { Authorization: `Bearer ${authContext?.userInfo?.token}` } };
         const updateData = {
             paymentDate: editFormData.paymentDate,
             totalAmount: Number(editFormData.totalAmount), // Перетворюємо на число
             description: editFormData.description
         };
         // Перевірка на валідність суми
         if (isNaN(updateData.totalAmount) || updateData.totalAmount < 0) {
             throw new Error("Некоректна сума нарахування");
         }

        await axios.put(`${process.env.REACT_APP_API_URL}/api/payroll/${currentPaySlip._id}`, updateData, config);
        setSuccessMessage('Нарахування оновлено!');
        fetchPaySlipsForUser(selectedUserId); // Оновлюємо список саме обраного юзера
        handleCloseEditModal();
     } catch (err: any) {
       setError(err.response?.data?.message || err.message || 'Помилка оновлення нарахування.');
       console.error("Помилка оновлення:", err);
     } finally {
       setLoadingModal(false);
     }
  };


  // Функція видалення нарахування
  const deletePaySlipHandler = async (id: string) => {
    // Використовуємо новий текст для підтвердження
    const confirmed = await showConfirmDialog('Ви впевнені, що хочете видалити це нарахування?');
    if (confirmed) {
      try {
        const config = { headers: { Authorization: `Bearer ${authContext?.userInfo?.token}` } };
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/payroll/${id}`, config);
        setSuccessMessage('Нарахування видалено!');
        fetchPaySlipsForUser(selectedUserId); // Оновлюємо список обраного юзера
        setTimeout(() => setSuccessMessage(''), 3000); // Ховаємо повідомлення
      } catch (err: any) {
        setError(err.response?.data?.message || 'Помилка видалення нарахування.');
        console.error("Помилка видалення:", err);
      }
    }
  };

   // Функція діалогу підтвердження з кастомним текстом
   const showConfirmDialog = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Замінюємо стандартний текст на ваш
      const result = window.confirm(message);
      resolve(result);
    });
  };


  return (
    <>
      <h1>Історія нарахувань</h1>
      {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>{successMessage}</Alert>}
      {error && !showEditModal && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Form.Group controlId="userSelectHistory" className="my-3">
        <Form.Label>Оберіть військовослужбовця для перегляду історії</Form.Label>
        {loadingUsers ? (
            <Spinner animation="border" size="sm"/>
        ) : users.length === 0 && !error ? (
             <Alert variant="warning">Список користувачів порожній.</Alert>
        ) : (
            <Form.Select value={selectedUserId} onChange={handleUserChange}>
            <option value="">-- Оберіть користувача --</option>
            {users.map((user) => (
                <option key={user._id} value={user._id}>
                {user.fullName} ({user.email})
                </option>
            ))}
            </Form.Select>
        )}
      </Form.Group>

      {loadingPaySlips ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : selectedUserId && paySlips.length === 0 && !error ? (
        <Alert variant="info">Для обраного користувача ще немає нарахувань.</Alert>
      ) : selectedUserId && paySlips.length > 0 ? (
        <Table striped bordered hover responsive className="table-sm mt-3">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Сума (грн)</th>
              <th>Опис</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {paySlips.map((slip) => (
              <tr key={slip._id}>
                <td>{new Date(slip.paymentDate).toLocaleDateString('uk-UA')}</td>
                <td>{slip.totalAmount.toLocaleString('uk-UA')}</td>
                <td>{slip.description || '-'}</td>
                <td>
                  {/* Оновлюємо стилі кнопок */}
                  <Button
                     variant="link" // Прибираємо фон
                     className="btn-sm mx-1 text-secondary" // Робимо іконку сірою
                     onClick={() => handleShowEditModal(slip)}
                     title="Редагувати"
                   >
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button
                     variant="link" // Прибираємо фон
                     className="btn-sm mx-1 text-secondary" // Робимо іконку сірою
                     onClick={() => deletePaySlipHandler(slip._id)}
                     title="Видалити"
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : null /* Якщо користувач не обраний, нічого не показуємо */ }

       {/* Модальне вікно для редагування нарахування */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Редагувати нарахування</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditFormSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>} {/* Помилка всередині модалки */}
             <Form.Group controlId="editPaymentDate" className="mt-2">
                <Form.Label>Дата нарахування</Form.Label>
                <Form.Control
                    type="date"
                    name="paymentDate"
                    value={editFormData.paymentDate}
                    onChange={handleEditFormChange}
                    required
                    max={new Date().toISOString().split("T")[0]} // Обмеження майбутніх дат
                />
            </Form.Group>
            <Form.Group controlId="editTotalAmount" className="mt-2">
              <Form.Label>Загальна сума (грн)</Form.Label>
              <Form.Control
                type="number"
                name="totalAmount"
                value={editFormData.totalAmount}
                onChange={handleEditFormChange}
                required
                step="0.01"
                min="0"
              />
            </Form.Group>
            <Form.Group controlId="editDescription" className="mt-2">
              <Form.Label>Опис (необов'язково)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={editFormData.description}
                onChange={handleEditFormChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEditModal} disabled={loadingModal}>
              Скасувати
            </Button>
            <Button variant="primary" type="submit" disabled={loadingModal}>
              {loadingModal ? <Spinner as="span" animation="border" size="sm" /> : 'Зберегти зміни'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default AdminPayrollHistoryPage;

