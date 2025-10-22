import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import NewsPage from './pages/NewsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import StatisticsPage from './pages/StatisticsPage';
import AdminUserListPage from './pages/AdminUserListPage';
import AdminPayrollPage from './pages/AdminPayrollPage'; // Сторінка створення
import AdminPayrollHistoryPage from './pages/AdminPayrollHistoryPage'; // Сторінка історії
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Router>
      {/* Додаємо обгортку для flexbox */}
      <div className="d-flex flex-column min-vh-100">
        <Header />
        {/* Основний контент займає весь доступний простір */}
        <main className="py-3 flex-grow-1">
          <Container>
            <Routes>
              {/* --- Публічні маршрути --- */}
              <Route path="/" element={<HomePage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* --- Приватні маршрути --- */}
              {/* Поки що не захищені, але можна буде додати PrivateRoute */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />

              {/* --- Адмінські маршрути --- */}
              <Route path="" element={<AdminRoute />}>
                <Route path="/admin/userlist" element={<AdminUserListPage />} />
                <Route path="/admin/payroll/create" element={<AdminPayrollPage />} />
                <Route path="/admin/payroll/history" element={<AdminPayrollHistoryPage />} /> {/* Маршрут для історії */}
                {/* <Route path="/admin/user/:id/edit" element={<AdminUserEditPage />} /> */}
                {/* <Route path="/admin/user/create" element={<AdminUserCreatePage />} /> */}
              </Route>
            </Routes>
          </Container>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

