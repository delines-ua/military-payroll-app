const express = require('express');
const router = express.Router();
// Імпортуємо всі потрібні функції контролера
const {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  createUserByAdmin
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// --- Публічні ---
router.post('/register', registerUser);
router.post('/login', loginUser);

// --- Приватні ---
router.get('/me', protect, getMe);

// --- Адмінські ---
// Отримати всіх або Створити нового користувача
router.route('/')
  .get(protect, admin, getUsers)
  .post(protect, admin, createUserByAdmin); // Новий маршрут POST

// Отримати одного, Видалити або Оновити користувача за ID
router.route('/:id')
  .get(protect, admin, getUserById)       // Новий маршрут GET
  .delete(protect, admin, deleteUser)
  .put(protect, admin, updateUser);        // Новий маршрут PUT

module.exports = router;

