const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Дані для входу
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['soldier', 'admin'], default: 'soldier' },

  // Особисті дані військовослужбовця
  fullName: { type: String, default: 'ПІБ не вказано' },
  rank: { type: String, default: 'Звання не вказано' }, // Звання
  position: { type: String, default: 'Посада не вказана' }, // Посада
  
  // Інші поля, які ми додали раніше
  taxIdNumber: { type: String, default: '' },
  enlistmentDate: { type: Date },

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;