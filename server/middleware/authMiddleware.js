const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Перевіряє токен (для всіх авторизованих)
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Витягуємо токен з заголовка
      token = req.headers.authorization.split(' ')[1];

      // Верифікуємо токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Знаходимо користувача за ID з токена і додаємо до об'єкта запиту
      // Виключаємо пароль з результату
      req.user = await User.findById(decoded.user.id).select('-password');

      next(); // Передаємо управління далі
    } catch (error) {
      console.error(error);
      // Важливо повертати відповідь тут, щоб уникнути помилок типу "headers already sent"
      return res.status(401).json({ message: 'Немає авторизації, токен недійсний' }); 
    }
  }

  if (!token) {
    // Важливо повертати відповідь тут
    return res.status(401).json({ message: 'Немає авторизації, токен відсутній' }); 
  }
};


// Перевіряє роль адміна (викликається ПІСЛЯ protect)
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // Користувач - адмін, пропускаємо
  } else {
    // Важливо повертати відповідь тут
    return res.status(403).json({ message: 'Недостатньо прав доступу (потрібні права адміна)' }); 
  }
};

module.exports = { protect, admin }; // Експортуємо обидві функції