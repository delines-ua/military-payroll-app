import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode'; // ✅ ВИПРАВЛЕНИЙ ІМПОРТ

// Інтерфейс для опису структури розшифрованого токена
interface DecodedToken {
  user: {
    id: string;
    role?: string;
  };
}

const AdminRoute = () => {
  const authContext = useContext(AuthContext);
  let isAdmin = false;

  if (authContext?.userInfo?.token) {
    try {
      // Розшифровуємо токен, щоб дізнатися роль
      const decoded: DecodedToken = jwtDecode(authContext.userInfo.token); // ✅ ВИПРАВЛЕНИЙ ВИКЛИК
      // Перевіряємо, чи є поле user та role, і чи role === 'admin'
      if (decoded.user && decoded.user.role === 'admin') {
        isAdmin = true;
      }
    } catch (error) {
      console.error("Помилка декодування токена в AdminRoute:", error);
      isAdmin = false; 
    }
  }

  // Якщо користувач увійшов І він адмін, показуємо дочірній компонент (Outlet)
  // В іншому випадку перенаправляємо на сторінку входу
  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;
