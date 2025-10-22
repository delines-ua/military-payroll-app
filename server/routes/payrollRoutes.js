const express = require('express');
const router = express.Router();
// Імпортуємо всі функції контролера
const {
    getMyPaySlips,
    createPaySlip,
    updatePaySlip,
    deletePaySlip,
    getPaySlipsForUser
} = require('../controllers/payrollController');
const { protect, admin } = require('../middleware/authMiddleware'); // Наші "охоронці"

// --- Маршрут для звичайного користувача ---
// Отримати свої власні нарахування
router.route('/mypayslips').get(protect, getMyPaySlips);

// --- Маршрути для Адміністратора ---

// Створити нове нарахування
router.route('/').post(protect, admin, createPaySlip);

// Отримати всі нарахування для конкретного користувача (за його ID)
// Наприклад: /api/payroll/user/68f678a71fb022546d0498b9
router.route('/user/:userId').get(protect, admin, getPaySlipsForUser);

// Оновити або Видалити конкретне нарахування (за його ID)
// Наприклад: /api/payroll/68f67e4cca0a4620887990c3
router.route('/:id')
    .put(protect, admin, updatePaySlip)    // Метод PUT для оновлення
    .delete(protect, admin, deletePaySlip); // Метод DELETE для видалення

module.exports = router;

