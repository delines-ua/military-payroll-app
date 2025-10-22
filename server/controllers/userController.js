const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Реєстрація нового користувача (публічна)
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'Користувач з таким email вже існує' });
    }

    user = new User({
      fullName,
      email,
      password,
      // Роль 'soldier' буде встановлена за замовчуванням
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Помилка сервера');
  }
};

// @desc    Вхід користувача (автентифікація)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Неправильні дані для входу' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Неправильні дані для входу' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Помилка сервера');
  }
};

// @desc    Отримати дані поточного користувача
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

// @desc    Отримати всіх користувачів (тільки для адміна)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Помилка сервера');
  }
};

// @desc    Видалити користувача (тільки для адміна)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Можна додати перевірку, щоб адмін не міг видалити сам себе
      // if (user._id.toString() === req.user.id) {
      //   return res.status(400).json({ message: 'Неможливо видалити власний акаунт адміністратора'});
      // }
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'Користувача видалено' });
    } else {
      res.status(404).json({ message: 'Користувача не знайдено' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Помилка сервера');
  }
};

// @desc    Отримати користувача за ID (тільки для адміна)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Користувача не знайдено' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Помилка сервера');
  }
};

// @desc    Оновити користувача (тільки для адміна)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.email = req.body.email || user.email;
      user.rank = req.body.rank || user.rank;
      user.position = req.body.position || user.position;
      user.role = req.body.role || user.role;

      // Можна додати можливість зміни пароля окремим маршрутом
      // if (req.body.password) { ... }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        rank: updatedUser.rank,
        position: updatedUser.position,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'Користувача не знайдено' });
    }
  } catch (error) {
    console.error(error.message);
    // Додамо обробку помилки унікального email
    if (error.code === 11000) {
       return res.status(400).json({ message: 'Користувач з таким email вже існує' });
    }
    res.status(500).send('Помилка сервера');
  }
};

// @desc    Створити нового користувача (тільки для адміна)
// @route   POST /api/users
// @access  Private/Admin
const createUserByAdmin = async (req, res) => {
    const { fullName, email, password, rank, position, role } = req.body;

    // Валідація базових полів
    if (!fullName || !email || !password || !role) {
        return res.status(400).json({ message: 'Будь ласка, заповніть усі обов\'язкові поля: ім\'я, email, пароль, роль' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Користувач з таким email вже існує' });
        }

        user = new User({
            fullName,
            email,
            password, // Пароль хешується нижче
            rank,
            position,
            role,
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        const createdUser = await user.save();

        // Повертаємо створеного користувача (без пароля)
        res.status(201).json({
            _id: createdUser._id,
            fullName: createdUser.fullName,
            email: createdUser.email,
            rank: createdUser.rank,
            position: createdUser.position,
            role: createdUser.role,
        });

    } catch (error) {
        console.error(error.message);
         // Додамо обробку помилки унікального email
        if (error.code === 11000) {
           return res.status(400).json({ message: 'Користувач з таким email вже існує' });
        }
        res.status(500).send('Помилка сервера');
    }
};


module.exports = {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  deleteUser,
  getUserById,       // Нова функція
  updateUser,        // Нова функція
  createUserByAdmin, // Нова функція
};

