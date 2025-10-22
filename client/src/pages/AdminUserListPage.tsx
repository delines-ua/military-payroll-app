import React, { useState, useEffect, useContext, useCallback, ChangeEvent } from 'react';
import { Table, Button, Row, Col, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
// useNavigate більше не потрібен тут
// import { useNavigate } from 'react-router-dom';

// Інтерфейс User (з бази даних)
interface User {
  _id: string;
  position?: string;
  rank?: string;
  fullName: string;
  email: string;
  role: 'admin' | 'soldier';
  createdAt?: string;
}

// Тип для даних форми (включаючи необов'язковий пароль)
type UserFormData = Omit<User, '_id' | 'createdAt'> & { password?: string };

// Початковий стан для форми, що відповідає типу
const initialUserState: UserFormData & { _id?: string } = {
  fullName: '',
  email: '',
  role: 'soldier',
  rank: '',
  position: '',
  password: ''
};


const AdminUserListPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserFormData & { _id?: string }>(initialUserState);
  const [loadingModal, setLoadingModal] = useState(false);

  const authContext = useContext(AuthContext);
  // const navigate = useNavigate(); // Більше не потрібен тут

  const fetchUsers = useCallback(async () => {
    if (!authContext?.userInfo?.token) {
      setError('Ви не авторизовані або не маєте прав адміністратора.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${authContext.userInfo.token}` } };
      const { data } = await axios.get<User[]>('/api/users', config);
      setUsers(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не вдалося завантажити список користувачів.');
      console.error("Помилка завантаження користувачів:", err);
    } finally {
      setLoading(false);
    }
  }, [authContext?.userInfo?.token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Тепер залежність правильна

  const handleShowModal = (userToEdit?: User) => {
    if (userToEdit) {
      setIsEditMode(true);
      setCurrentUser({
        _id: userToEdit._id,
        fullName: userToEdit.fullName || '',
        email: userToEdit.email || '',
        rank: userToEdit.rank || '',
        position: userToEdit.position || '',
        role: userToEdit.role || 'soldier',
      });
    } else {
      setIsEditMode(false);
      setCurrentUser(initialUserState);
    }
    setShowModal(true);
    setError('');
    setSuccessMessage('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentUser(initialUserState);
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentUser(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingModal(true);
    setError('');
    setSuccessMessage('');

    const config = { headers: { Authorization: `Bearer ${authContext?.userInfo?.token}` } };

    const userData: UserFormData = {
      fullName: currentUser.fullName || '',
      email: currentUser.email || '',
      rank: currentUser.rank || '',
      position: currentUser.position || '',
      role: currentUser.role || 'soldier',
    };
    if (!isEditMode && currentUser.password) {
      userData.password = currentUser.password;
    }


    try {
      if (isEditMode && currentUser._id) {
        await axios.put(`/api/users/${currentUser._id}`, userData, config);
        setSuccessMessage('Дані користувача оновлено!');
      } else {
        if (!userData.password) {
          setError('Пароль є обов\'язковим при створенні користувача.');
          setLoadingModal(false);
          return;
        }
        await axios.post('/api/users', userData, config);
        setSuccessMessage('Нового користувача створено!');
      }
      fetchUsers();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Сталася помилка.');
      console.error("Помилка збереження:", err);
    } finally {
      setLoadingModal(false);
    }
  };

  const deleteHandler = async (id: string) => {
    const confirmed = await showConfirmDialog('Ви впевнені?');
    if (confirmed) {
      try {
        const config = { headers: { Authorization: `Bearer ${authContext?.userInfo?.token}` } };
        await axios.delete(`/api/users/${id}`, config);
        setSuccessMessage('Користувача видалено!');
        fetchUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Помилка видалення.');
        console.error("Помилка видалення:", err);
      }
    }
  };

  const showConfirmDialog = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const result = window.confirm(message);
      resolve(result);
    });
  };

  // Функція для обробки натискання на кнопку редагування
  const editHandler = (user: User) => {
      console.log('Редагування користувача:', user._id);
      handleShowModal(user); // Відкриваємо модальне вікно для редагування
  };


  return (
    <>
      <Row className="align-items-center">
        <Col><h1>Користувачі системи</h1></Col>
        <Col className="text-end">
          <Button className="my-3" onClick={() => handleShowModal()}>
            <i className="fas fa-plus"></i> Додати користувача
          </Button>
        </Col>
      </Row>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {error && !showModal && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="d-flex justify-content-center my-3"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive className="table-sm mt-3">
          <thead>
            <tr>
              <th>№</th>
              <th>ПОСАДА</th>
              <th>ЗВАННЯ</th>
              <th>ПОВНЕ ІМ'Я</th>
              <th>EMAIL</th>
              <th>РОЛЬ</th>
              <th>ДІЇ</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.position || 'Не вказано'}</td>
                <td>{user.rank || 'Не вказано'}</td>
                <td>{user.fullName}</td>
                <td><a href={`mailto:${user.email}`}>{user.email}</a></td>
                <td>{user.role}</td>
                <td>
                  {/* Оновлюємо стилі кнопок */}
                  <Button
                    variant="link" // Прибираємо фон
                    className="btn-sm mx-1 text-secondary" // Робимо іконку сірою
                    onClick={() => editHandler(user)}
                    title="Редагувати" // Додаємо підказку
                   >
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button
                    variant="link" // Прибираємо фон
                    className="btn-sm mx-1 text-secondary" // Робимо іконку сірою
                    onClick={() => deleteHandler(user._id)}
                     title="Видалити" // Додаємо підказку
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Модальне вікно для створення/редагування */}
      <Modal show={showModal} onHide={handleCloseModal} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? 'Редагувати користувача' : 'Додати нового користувача'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group controlId="fullName" className="mt-2">
              <Form.Label>Повне ім'я</Form.Label>
              <Form.Control type="text" name="fullName"
                value={currentUser.fullName || ''} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group controlId="email" className="mt-2">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email"
                value={currentUser.email || ''} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group controlId="rank" className="mt-2">
              <Form.Label>Звання</Form.Label>
              <Form.Control type="text" name="rank"
                value={currentUser.rank || ''} onChange={handleFormChange} />
            </Form.Group>
            <Form.Group controlId="position" className="mt-2">
              <Form.Label>Посада</Form.Label>
              <Form.Control type="text" name="position"
                value={currentUser.position || ''} onChange={handleFormChange} />
            </Form.Group>
            <Form.Group controlId="role" className="mt-2">
              <Form.Label>Роль</Form.Label>
              <Form.Select name="role" value={currentUser.role || 'soldier'} onChange={handleFormChange}>
                <option value="soldier">Soldier</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            {!isEditMode && (
              <Form.Group controlId="password" className="mt-2">
                <Form.Label>Пароль</Form.Label>
                <Form.Control type="password" name="password"
                  placeholder='Введіть пароль (мін. 6 символів)'
                  onChange={handleFormChange} required />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loadingModal}>
              Скасувати
            </Button>
            <Button variant="primary" type="submit" disabled={loadingModal}>
              {loadingModal ? <Spinner as="span" animation="border" size="sm" /> : (isEditMode ? 'Зберегти зміни' : 'Створити')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default AdminUserListPage;

