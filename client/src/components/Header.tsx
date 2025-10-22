import React, { useContext } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
// LinkContainer більше не імпортуємо, щоб уникнути плутанини
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

// Інтерфейс для розшифрованого токена
interface DecodedToken {
  user: {
    id: string;
    role?: string;
  };
  iat: number;
  exp: number;
}

const Header = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  let isAdmin = false;

  if (authContext?.userInfo?.token) {
    try {
      const decoded: DecodedToken = jwtDecode(authContext.userInfo.token);
      if (decoded.user && decoded.user.role === 'admin') {
        isAdmin = true;
      }
    } catch (error) {
      console.error("Помилка декодування токена в Header:", error);
    }
  }

  const logoutHandler = () => {
    authContext?.logout();
    navigate('/');
  };

  // Функція для навігації з меню
  const handleNavClick = (path: string) => {
    navigate(path);
  };


  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          {/* Використовуємо звичайний Navbar.Brand з onClick */}
          <Navbar.Brand
            // href={authContext?.userInfo ? '/dashboard' : '/'} // href не потрібен при використанні onClick
            onClick={(e: React.MouseEvent<HTMLElement>) => { // Додаємо тип для 'e'
              e.preventDefault();
              navigate(authContext?.userInfo ? '/dashboard' : '/');
            }}
            style={{ cursor: 'pointer' }}
          >
            <i className="fas fa-coins me-2"></i>
            Financial Servise UA
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {/* Використовуємо Nav.Link as={Link} */}
              <Nav.Link as={Link} to="/news">Новини</Nav.Link>
            </Nav>

            <Nav className="ms-auto">
              {authContext?.userInfo ? (
                // Якщо користувач увійшов
                <NavDropdown title={isAdmin ? "Панель адміна" : "Особистий кабінет"} id="username">
                  {/* ВИКОРИСТОВУЄМО onClick */}
                  <NavDropdown.Item onClick={() => handleNavClick('/dashboard')}>
                    Мій кабінет
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => handleNavClick('/statistics')}>
                    Статистика
                  </NavDropdown.Item>

                  {isAdmin && (
                    <>
                      <NavDropdown.Divider />
                      <NavDropdown.Item onClick={() => handleNavClick('/admin/userlist')}>
                        Керування користувачами
                      </NavDropdown.Item>
                      {/* Нове посилання */}
                      <NavDropdown.Item onClick={() => handleNavClick('/admin/payroll/create')}>
                         Створити нарахування
                      </NavDropdown.Item>
                       <NavDropdown.Item onClick={() => handleNavClick('/admin/payroll/history')}>
                         Історія нарахувань
                      </NavDropdown.Item>
                    </>
                  )}

                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logoutHandler}>
                    Вийти
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                // Якщо користувач не увійшов
                <>
                  {/* Використовуємо Nav.Link as={Link} */}
                  <Nav.Link as={Link} to="/login" className="d-flex align-items-center">
                    <i className="fas fa-user me-1"></i> Увійти
                  </Nav.Link>
                  <Nav.Link as={Link} to="/register" className="d-flex align-items-center">
                    <i className="fas fa-user-plus me-1"></i> Реєстрація
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;

