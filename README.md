Курсова робота з дисципліни «Веб-технології та веб-дизайн»

Тема: Розробка веб-інтерфейсу підсистеми автоматизації нарахування грошового забезпечення військовослужбовців

Виконавець: курсант 221 навчальної групи солдат Науменко О.О.

Зміст

Суть проєкту

Використані технології та методології

Архітектура та Розгортання (Хостинг)

Структура проєкту


# Military Payroll App

Короткий README українською мовою з інструкціями для розробки та розгортання проекту "Military Payroll App" (репозиторій: delines-ua/military-payroll-app).

Короткий опис
---------------
Це навчальний/курсовий проєкт для автоматизації перегляду та керування нарахуваннями грошового забезпечення військовослужбовців. Проєкт має дві частини: frontend (React + TypeScript) та backend (Node.js + Express) з MongoDB як БД.

Швидкий старт (локально)
----------------------
1. Встановіть залежності в корені (скрипт керує одночасним запуском):

```powershell
npm install
```

2. Встановіть залежності для серверної та клієнтської частин (якщо потрібно окремо):

```powershell
npm install --prefix server
npm install --prefix client
```

3. Запуск в режимі розробки (одночасно запускає `server` та `client`):

```powershell
npm run dev
```

Або запустити окремо:

```powershell
npm run server   ; # запускає `npm run dev` в папці server (nodemon)
npm run client   ; # запускає react-scripts start в папці client
```

Налаштування змінних оточення
-----------------------------
Сервер (в папці `server`) потребує файл `.env` з принаймні такими змінними:

- MONGO_URI=your_mongodb_connection_string
- JWT_SECRET=your_jwt_secret

Фронтенд (в папці `client`) може потребувати:

- REACT_APP_API_URL=https://your-backend-url (в development зазвичай http://localhost:5000 або proxy з `client/package.json`)

Команди (вже доступні в `package.json` кореня та підпапок)
----------------------------------------------------
- npm run dev — одночасний запуск сервера і клієнта (використовує `concurrently`)
- npm run server — запускає сервер (використовує `npm run dev --prefix server`)
- npm run client — запускає клієнт (використовує `npm start --prefix client`)
- У `server/package.json`: `npm run dev` запускає `nodemon server.js`, `npm start` запускає `node server.js`.
- У `client/package.json`: `npm start` запускає `react-scripts start`.

Деплой
------
Приклади налаштувань (вже використані авторами проєкту):

- Backend: Render — Root Directory: `server`, Build Command: `npm install`, Start Command: `npm start`. Потрібні секрети: `MONGO_URI`, `JWT_SECRET`.
- Frontend: Vercel — Root Directory: `client`, Framework: Create React App. Налаштуйте змінну `REACT_APP_API_URL` на URL бекенду.

Структура проекту
-----------------
```
military-payroll-app/
├─ client/              # Frontend (React + TypeScript)
│  ├─ public/
│  └─ src/
│     ├─ components/    # Header, Footer, AdminRoute і т.д.
│     ├─ context/       # AuthContext
│     └─ pages/         # Сторінки: Dashboard, News, Admin тощо
├─ server/              # Backend (Node.js + Express)
│  ├─ config/
│  ├─ controllers/
│  ├─ middleware/
│  ├─ models/           # User.js, PaySlip.js
│  └─ routes/
├─ .gitignore
└─ package.json         # Скрипти для одночасного запуску
```

Короткий опис ключових функцій
-----------------------------
- Аутентифікація: реєстрація та вхід користувачів, JWT токени, bcrypt для паролів.
- Новини: сервер парсить RSS/Atom (axios + xml2js) і повертає дані для фронтенду.
- Dashboard: показ особистих нарахувань користувача та статистика (recharts).
- Адмін-функції: керування користувачами (CRUD), керування нарахуваннями (створення/редагування/видалення).

Поради та відомі проблеми
------------------------
- При підключенні до MongoDB Atlas переконайтесь, що Network Access дозволяє підключення (0.0.0.0/0 або конкретний IP), та що `MONGO_URI` правильний.
- Для локального одночасного запуску клієнта та сервера використовуйте `npm run dev` в корені.
- Якщо фронтенд не може дістатися бекенду, перевірте `REACT_APP_API_URL` та `proxy` в `client/package.json`.

Контакти / Посилання
-------------------
- Репозиторій: https://github.com/delines-ua/military-payroll-app

---

Якщо потрібно, можу додати більш детальні приклади .env для локального запуску, або автоматичні інструкції деплою для Render/Vercel.

Глобальний стан через AuthContext.

Портал Новин:

Backend (newsController.js) парсить RSS/Atom (axios, xml2js) з armyinform.com.ua, обходить CORS.

Frontend (NewsPage.tsx) запитує /api/news і відображає дані.

Особистий кабінет (Дашборд):

DashboardPage.tsx робить захищений запит /api/payroll/mypayslips.

Backend (payrollController.js) повертає нарахування поточного користувача.

Відображення останніх нарахувань картками.

Статистика:

StatisticsPage.tsx запитує /api/payroll/mypayslips.

Побудова діаграми динаміки виплат за допомогою recharts.

Адмін-панель:

Користувачі (AdminUserListPage.tsx):

Захищений запит /api/users для списку всіх користувачів.

CRUD операції через модальне вікно: Створення (POST /api/users), Редагування (PUT /api/users/:id), Видалення (DELETE /api/users/:id).

Створення Нарахувань (AdminPayrollPage.tsx):

Форма з вибором користувача, дати (<input type="date">), суми.

Захищений запит POST /api/payroll.

Історія Нарахувань (AdminPayrollHistoryPage.tsx):

Вибір користувача, запит /api/payroll/user/:userId.

Таблиця з історією, кнопки для редагування (PUT /api/payroll/:id) та видалення (DELETE /api/payroll/:id) через модальне вікно.

6. Основні труднощі та їх вирішення

Процес розробки супроводжувався низкою типових для веб-розробки викликів:

Деплой та Конфігурація: Проблеми з підключенням до MongoDB Atlas (неправильний пароль, Network Access), налаштування змінних середовища на Render та Vercel.

Рішення: Уважна перевірка даних доступу, конфігурації MONGO_URI, правил Network Access (0.0.0.0/0), перезапуск сервісів.

Взаємодія Frontend/Backend: Помилки CORS, ECONNREFUSED через не запущений/впавший backend.

Рішення: concurrently для локальної розробки; змінна REACT_APP_API_URL для деплою; перевірка логів backend.

Автентифікація/Авторизація: Адмінські функції не працювали через старі JWT без поля role.

Рішення: Оновлення генерації токена на backend; вихід/повторний вхід для оновлення токена на клієнті.

Зовнішні Залежності (RSS): Недоступність або зміна URL RSS-стрічки (404, ETIMEDOUT).

Рішення: Збільшення тайм-ауту axios; пошук та інтеграція альтернативного джерела (Atom Feed), адаптація парсера.

React/TypeScript: Помилки компіляції та виконання (React.Children.only, типи TSxxxx, ESLint).

Рішення: Дебаг, виправлення типів, альтернативні підходи до інтеграції бібліотек (onClick замість LinkContainer), очищення кешу node_modules та браузера.

7. Майбутні плани та розвиток проєкту

Ця курсова робота є міцним фундаментом для подальшого розвитку, зокрема в рамках дипломної роботи:

Реалізація Калькулятора ГЗ: Додати на Frontend інтерактивний калькулятор.

Інтелектуальна автоматизація розрахунків (Диплом):

Розробка Backend-модуля для аналізу завантажених документів (OCR, Rule Engine).

Автоматичне визначення надбавок/пільг.

Верифікація результатів адміністратором.

Розширення Моделей Даних: Деталізація нарахувань (оклади, премії, надбавки).

Експорт у Excel: Додавання функції експорту зведеної відомості.

Покращення UI/UX: Сортування/фільтрація, пагінація, покращені дешборди.