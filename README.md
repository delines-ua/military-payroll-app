Курсова робота з дисципліни «Веб-технології та веб-дизайн»

Тема: Розробка веб-інтерфейсу підсистеми автоматизації нарахування грошового забезпечення військовослужбовців

Виконавець: курсант 221 навчальної групи солдат Науменко О.О.

Зміст

Суть проєкту

Використані технології та методології

Архітектура та Розгортання (Хостинг)

Структура проєкту

Опис основних функцій

Основні труднощі та їх вирішення

Майбутні плани та розвиток проєкту

1. Суть проєкту

Метою даної курсової роботи було створення сучасного веб-додатку для автоматизації процесу перегляду та частково керування грошовим забезпеченням військовослужбовців. Додаток розділено на дві основні частини:

Клієнтська частина: Призначена для військовослужбовців. Після автентифікації користувач отримує доступ до особистого кабінету, де може переглянути історію своїх нарахувань та візуалізовану статистику виплат. Також реалізовано доступ до актуальних новин з офіційних джерел.

Адміністративна частина: Призначена для відповідальних осіб (наприклад, бухгалтерів). Надає інструменти для керування обліковими записами користувачів (CRUD) та ручного внесення, редагування й видалення даних про нарахування грошового забезпечення.

2. Використані технології та методології

Проєкт розроблено з використанням сучасного стеку технологій MERN (MongoDB, Express.js, React.js, Node.js) та додаткових інструментів:

Frontend (Клієнтська частина):

Мова: TypeScript

```md
Курсова робота з дисципліни «Веб-технології та веб-дизайн"

Тема: Розробка веб-інтерфейсу підсистеми автоматизації нарахування грошового забезпечення військовослужбовців

Виконавець: курсант 221 навчальної групи солдат Науменко О.О.

---

Зміст

- Суть проєкту
- Використані технології та методології
- Архітектура та Розгортання (Хостинг)
- Структура проєкту
- Опис основних функцій
- Основні труднощі та їх вирішення
- Майбутні плани та розвиток проєкту

## 1. Суть проєкту

Метою даної курсової роботи було створення сучасного веб-додатку для автоматизації процесу перегляду та частково керування грошовим забезпеченням військовослужбовців. Додаток розділено на дві основні частини:

- Клієнтська частина: призначена для військовослужбовців. Після автентифікації користувач отримує доступ до особистого кабінету, де може переглянути історію своїх нарахувань та візуалізовану статистику виплат. Також реалізовано доступ до актуальних новин з офіційних джерел.
- Адміністративна частина: призначена для відповідальних осіб (наприклад, бухгалтерів). Надає інструменти для керування обліковими записами користувачів (CRUD) та ручного внесення, редагування й видалення даних про нарахування грошового забезпечення.

## 2. Використані технології та методології

Проєкт розроблено з використанням сучасного стеку технологій MERN (MongoDB, Express.js, React.js, Node.js) та додаткових інструментів:

### Frontend (клієнтська частина)
- Мова: TypeScript
- Бібліотека: React.js (v18+)
- Маршрутизація: react-router-dom (v6+)
- Управління станом: React Context API (AuthContext)
- HTTP-клієнт: axios
- UI-фреймворк: react-bootstrap, bootstrap (v5+)
- Іконки: Font Awesome
- Візуалізація даних: recharts
- Інструменти: jwt-decode

### Backend (серверна частина)
- Платформа: Node.js
- Фреймворк: Express.js
- База даних: MongoDB (mongoose)
- Автентифікація: JWT (jsonwebtoken), хешування паролів (bcryptjs)
- Обробка XML: xml2js (для RSS/Atom)
- Інше: dotenv, cors

### Інструменти розробки
- concurrently (одночасний запуск)
- nodemon (авто-перезапуск сервера)
- Git / GitHub (контроль версій)

## 3. Архітектура та Розгортання (Хостинг)

Додаток має розділену архітектуру Frontend/Backend і розгорнутий на безкоштовних хмарних платформах.

```mermaid
graph TD
        A[Користувач] --> B{Frontend (React)<br>Vercel};
        B --> C{Backend (Node.js API)<br>Render};
        C --> D[(База Даних<br>MongoDB Atlas)];
        E[Адміністратор] --> B;
        F[RSS/Atom Feed] --> C;

        style B fill:#f9f,stroke:#333,stroke-width:2px;
        style C fill:#ccf,stroke:#333,stroke-width:2px;
        style D fill:#f8d7da,stroke:#333,stroke-width:2px;
```

Деталі розгортання:

- Backend (Render):
    - Платформа: https://render.com/ (Web Service, Free tier)
    - Налаштування: Root Directory: server, Build: npm install, Start: npm start
    - Змінні середовища: MONGO_URI (рядок підключення Atlas), JWT_SECRET.
    - URL API: https://military-payroll-app.onrender.com (приклад)

- Frontend (Vercel):
    - Платформа: https://vercel.com/
    - Інтеграція: GitHub Repository
    - Налаштування: Framework: Create React App, Root Directory: client
    - Змінні середовища: REACT_APP_API_URL (URL backend на Render).
    - URL Додатку: https://military-payroll-app.vercel.app (приклад)

- База Даних (MongoDB Atlas):
    - Платформа: https://www.mongodb.com/cloud/atlas (M0 Sandbox, Free)
    - Доступ: Налаштовано користувача БД та Network Access (0.0.0.0/0).
    - Керування: Через Atlas UI або MongoDB Compass.

## 4. Структура проєкту

```
military-payroll-app/
├── client/              # Frontend (React + TypeScript)
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/  # Header, Footer, AdminRoute etc.
│       ├── context/     # AuthContext
│       └── pages/       # Компоненти сторінок
├── server/              # Backend (Node.js + Express)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/        # User.js, PaySlip.js
│   ├── routes/
│   └── server.js
├── .gitignore
└── package.json       # Головний (для concurrently)
```

## 5. Опис основних функцій

### Автентифікація та авторизація

Реєстрація/вхід, хешування паролів (bcryptjs). Генерація JWT (jsonwebtoken) з ID та роллю. Зберігання на клієнті (localStorage).

Backend middleware: `protect` (перевірка токена), `admin` (перевірка ролі).

Frontend AdminRoute з `jwt-decode` для захисту адмінських маршрутів.

Глобальний стан через `AuthContext`.

### Портал новин

Backend (`newsController.js`) парсить RSS/Atom (axios, xml2js) з armyinform.com.ua, обходить CORS.

Frontend (`NewsPage.tsx`) запитує `/api/news` і відображає дані.

Короткий приклад компоненту `NewsPage.tsx`:

```tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

type NewsItem = { title: string; link: string; pubDate?: string };

export const NewsPage: React.FC = () => {
    const [items, setItems] = useState<NewsItem[]>([]);

    useEffect(() => {
        axios.get('/api/news').then(res => setItems(res.data)).catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h2>Новини</h2>
            <ul>
                {items.map((it, i) => (
                    <li key={i}><a href={it.link}>{it.title}</a> {it.pubDate}</li>
                ))}
            </ul>
        </div>
    );
};
```

### Особистий кабінет (Дашборд)

`DashboardPage.tsx` робить захищений запит `/api/payroll/mypayslips`. Backend (`payrollController.js`) повертає нарахування поточного користувача. Відображення останніх нарахувань картками.

Короткий приклад `DashboardPage.tsx`:

```tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

type PaySlip = { date: string; amount: number; note?: string };

export const DashboardPage: React.FC = () => {
    const [payslips, setPayslips] = useState<PaySlip[]>([]);

    useEffect(() => {
        axios.get('/api/payroll/mypayslips').then(r => setPayslips(r.data)).catch(console.error);
    }, []);

    return (
        <div>
            <h2>Мої нарахування</h2>
            {payslips.map((p, i) => (
                <div key={i} className="card mb-2 p-2">
                    <div>{p.date}</div>
                    <div>{p.amount} грн</div>
                </div>
            ))}
        </div>
    );
};
```

### Статистика

`StatisticsPage.tsx` запитує `/api/payroll/mypayslips` і будує діаграми з `recharts`.

### Адмін-панель

Користувачі (`AdminUserListPage.tsx`) — захищений запит `/api/users` для списку всіх користувачів. CRUD операції через модальне вікно.

Короткий приклад `AdminUserListPage.tsx` (фрагмент):

```tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

type User = { _id: string; name: string; email: string; role: string };

export const AdminUserListPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        axios.get('/api/users').then(r => setUsers(r.data)).catch(console.error);
    }, []);

    return (
        <div>
            <h2>Користувачі</h2>
            <table className="table">
                <thead><tr><th>Ім'я</th><th>Email</th><th>Роль</th><th></th></tr></thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u._id}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>{/* кнопки редагування/видалення */}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
```

### Створення нарахувань (AdminPayrollPage)

Форма з вибором користувача, дати та суми. POST `/api/payroll`.

Фрагмент `AdminPayrollPage.tsx`:

```tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const AdminPayrollPage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [form, setForm] = useState({ userId: '', date: '', amount: 0 });

    useEffect(() => { axios.get('/api/users').then(r => setUsers(r.data)); }, []);

    const submit = () => {
        axios.post('/api/payroll', form).then(() => alert('OK')).catch(console.error);
    };

    return (
        <div>
            <h2>Створити нарахування</h2>
            <select value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}>
                <option value="">Виберіть користувача</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
            <button onClick={submit}>Створити</button>
        </div>
    );
};
```

## 6. Основні труднощі та їх вирішення

Процес розробки супроводжувався низкою типових для веб-розробки викликів:

- Деплой та Конфігурація: проблеми з підключенням до MongoDB Atlas (неправильний пароль, Network Access), налаштування змінних середовища на Render та Vercel.

- Взаємодія Frontend/Backend: помилки CORS, ECONNREFUSED через не запущений/впавший backend.

- Автентифікація/Авторизація: адмінські функції не працювали через старі JWT без поля role.

- Зовнішні Залежності (RSS): недоступність або зміна URL RSS-стрічки (404, ETIMEDOUT).

- React/TypeScript: помилки компіляції та виконання (React.Children.only, типи TSxxxx, ESLint).

## 7. Майбутні плани та розвиток проєкту

Ця курсова робота є міцним фундаментом для подальшого розвитку, зокрема в рамках дипломної роботи:

- Реалізація Калькулятора ГЗ: додати на Frontend інтерактивний калькулятор.
- Інтелектуальна автоматизація розрахунків (Диплом): розробка Backend-модуля для аналізу завантажених документів (OCR, Rule Engine).
- Автоматичне визначення надбавок/пільг та верифікація результатів адміністратором.
- Розширення Моделей Даних: деталізація нарахувань (оклади, премії, надбавки).
- Експорт у Excel: додавання функції експорту зведеної відомості.
- Покращення UI/UX: сортування/фільтрація, пагінація, покращені дашборди.


```