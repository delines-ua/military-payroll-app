// client/src/context/AuthContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Описуємо, яка інформація про користувача буде зберігатись
interface UserInfo {
  token: string;
}

// Описуємо, що буде доступно з нашого контексту
interface AuthContextType {
  userInfo: UserInfo | null;
  login: (data: UserInfo) => void;
  logout: () => void;
}

// Створюємо сам контекст
export const AuthContext = createContext<AuthContextType | null>(null);

// Створюємо компонент-провайдер, який буде "обгортати" наш додаток
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // При першому завантаженні додатку, перевіряємо, чи є дані в localStorage
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  // Функція для входу
  const login = (data: UserInfo) => {
    setUserInfo(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  // Функція для виходу
  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};