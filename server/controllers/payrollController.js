const PaySlip = require('../models/PaySlip');
const User = require('../models/User'); // Потрібно для перевірки існування користувача
const mongoose = require('mongoose'); // Потрібно для перевірки ObjectId

// @desc    Отримати всі нарахування для поточного користувача
// @route   GET /api/payroll/mypayslips
// @access  Private
const getMyPaySlips = async (req, res) => {
  try {
    // req.user.id приходить з middleware 'protect'
    // Сортуємо за датою у спадаючому порядку
    const paySlips = await PaySlip.find({ user: req.user.id }).sort({ paymentDate: -1 });
    res.json(paySlips);
  } catch (error) {
    console.error('Помилка отримання моїх нарахувань:', error);
    res.status(500).json({ message: 'Помилка сервера при отриманні нарахувань' });
  }
};

// @desc    Створити нове нарахування (тільки для адміна)
// @route   POST /api/payroll
// @access  Private/Admin
const createPaySlip = async (req, res) => {
  const { userId, paymentDate, totalAmount, description } = req.body;

  // Валідація вхідних даних
  if (!userId || !paymentDate || totalAmount === undefined || totalAmount === null) {
    return res.status(400).json({ message: 'Будь ласка, надайте ID користувача, дату та суму нарахування' });
  }

  // Перевірка формату дати
  const date = new Date(paymentDate);
  if (isNaN(date.getTime())) {
     return res.status(400).json({ message: 'Неправильний формат дати' });
  }

  // Перевірка суми
   if (typeof totalAmount !== 'number' || totalAmount < 0) {
      return res.status(400).json({ message: 'Сума має бути невід\'ємним числом' });
   }

  try {
    // Перевіряємо, чи існує користувач з таким ID
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'Користувача з таким ID не знайдено' });
    }

    // Створюємо новий запис
    const paySlip = new PaySlip({
      user: userId,
      paymentDate: date, // Зберігаємо як об'єкт Date
      totalAmount,
      description: description || '', // Додаємо опис, якщо він є
    });

    const createdPaySlip = await paySlip.save();
    res.status(201).json(createdPaySlip);
  } catch (error) {
    console.error('Помилка створення нарахування:', error);
     if (error.name === 'ValidationError') {
       return res.status(400).json({ message: error.message });
     }
    res.status(500).json({ message: 'Помилка сервера при створенні нарахування' });
  }
};

// @desc    Оновити нарахування (тільки для адміна)
// @route   PUT /api/payroll/:id
// @access  Private/Admin
const updatePaySlip = async (req, res) => {
  const { paymentDate, totalAmount, description } = req.body;

  // Перевірка ID на валідність
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Неправильний ID нарахування' });
  }

  // Валідація даних, якщо вони є в запиті
   const date = paymentDate ? new Date(paymentDate) : undefined;
   if (paymentDate && isNaN(date.getTime())) {
      return res.status(400).json({ message: 'Неправильний формат дати' });
   }
   if (totalAmount !== undefined && (typeof totalAmount !== 'number' || totalAmount < 0)) {
       return res.status(400).json({ message: 'Сума має бути невід\'ємним числом' });
   }


  try {
    const paySlip = await PaySlip.findById(req.params.id);

    if (paySlip) {
      // Оновлюємо тільки ті поля, які були передані
      if (date) paySlip.paymentDate = date;
      if (totalAmount !== undefined) paySlip.totalAmount = totalAmount;
      if (description !== undefined) paySlip.description = description;

      const updatedPaySlip = await paySlip.save();
      res.json(updatedPaySlip);
    } else {
      res.status(404).json({ message: 'Нарахування не знайдено' });
    }
  } catch (error) {
    console.error('Помилка оновлення нарахування:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Помилка сервера при оновленні нарахування' });
  }
};

// @desc    Видалити нарахування (тільки для адміна)
// @route   DELETE /api/payroll/:id
// @access  Private/Admin
const deletePaySlip = async (req, res) => {
    // Перевірка ID на валідність
   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
       return res.status(400).json({ message: 'Неправильний ID нарахування' });
   }

  try {
    const paySlip = await PaySlip.findById(req.params.id);

    if (paySlip) {
      await PaySlip.deleteOne({ _id: paySlip._id });
      res.json({ message: 'Нарахування видалено' });
    } else {
      res.status(404).json({ message: 'Нарахування не знайдено' });
    }
  } catch (error) {
    console.error('Помилка видалення нарахування:', error);
    res.status(500).json({ message: 'Помилка сервера при видаленні нарахування' });
  }
};

// @desc    Отримати всі нарахування для конкретного користувача (тільки для адміна)
// @route   GET /api/payroll/user/:userId
// @access  Private/Admin
const getPaySlipsForUser = async (req, res) => {
    // Перевірка ID на валідність
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
        return res.status(400).json({ message: 'Неправильний ID користувача' });
    }

  try {
    // Перевіряємо, чи існує користувач
    const userExists = await User.findById(req.params.userId);
    if (!userExists) {
        return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    const paySlips = await PaySlip.find({ user: req.params.userId }).sort({ paymentDate: -1 });
    res.json(paySlips);
  } catch (error) {
    console.error('Помилка отримання нарахувань для користувача:', error);
    res.status(500).json({ message: 'Помилка сервера при отриманні нарахувань користувача' });
  }
};


module.exports = {
  getMyPaySlips,
  createPaySlip,
  updatePaySlip,
  deletePaySlip,
  getPaySlipsForUser,
};

