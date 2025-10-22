// server/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db'); // <-- Ми винесемо підключення до БД в окремий файл

// Завантажуємо змінні середовища
dotenv.config();

// Підключаємося до бази даних
connectDB();

const app = express();

app.use(cors());
app.use(express.json()); // Middleware для розбору JSON

// Головний маршрут
app.get('/', (req, res) => {
  res.send('API працює...');
});

// Підключаємо маршрути для користувачів
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/payroll', require('./routes/payrollRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Сервер запущено на порті ${PORT}`));